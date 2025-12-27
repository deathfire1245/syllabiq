
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PhoneOff, VideoOff, MicOff, Users, Timer, ScreenShare, ScreenShareOff, Pencil, Eraser, Trash2, Monitor, Video, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface Booking {
  id: string;
  tutorName: string;
  slot: { day: string; time: string };
}

const dayToNumber: { [key: string]: number } = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };

function getSessionDates(day: string, time: string): { start: Date, end: Date } {
  const now = new Date();
  const targetDay = dayToNumber[day];
  const [startTimeStr] = time.split(" - ");
  const [hour, minute] = startTimeStr.split(":").map(Number);

  let startDate = new Date();
  const currentDay = now.getDay();
  let dayDifference = (targetDay - currentDay + 7) % 7;
  
  if (dayDifference === 0 && (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute))) {
      dayDifference = 7;
  }
  
  startDate.setDate(now.getDate() + dayDifference);
  startDate.setHours(hour, minute, 0, 0);

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1-hour session

  return { start: startDate, end: endDate };
}

const testBooking: Booking = {
  id: "test-meeting-123",
  tutorName: "Test Teacher",
  slot: { day: "Mon", time: "10:00 - 11:00" },
};

type ViewMode = 'camera' | 'screen' | 'whiteboard';

const Whiteboard = ({ isActive, color, size, isErasing, onDraw }: { isActive: boolean; color: string; size: number; isErasing: boolean; onDraw: (data: any) => void }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
    }, []);

    React.useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = size;
        }
    }, [color, size]);

    const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
        if (!contextRef.current || !isActive) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        if (!contextRef.current || !isActive) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }: React.MouseEvent) => {
        if (!isDrawing || !contextRef.current || !isActive) return;
        const { offsetX, offsetY } = nativeEvent;
        if (isErasing) {
             contextRef.current.globalCompositeOperation = 'destination-out';
        } else {
             contextRef.current.globalCompositeOperation = 'source-over';
        }
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };
    
    // Public method for clearing
    React.useImperativeHandle(whiteboardRef, () => ({
        clear: () => {
            const canvas = canvasRef.current;
            if (canvas && contextRef.current) {
                contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }));


    return (
        <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            className={cn("w-full h-full bg-white", isActive ? "cursor-crosshair" : "cursor-not-allowed")}
        />
    );
};
Whiteboard.displayName = "Whiteboard";
const whiteboardRef = React.createRef<{ clear: () => void }>();


export default function MeetingPage({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [hasPermission, setHasPermission] = React.useState(true);
  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [sessionTime, setSessionTime] = React.useState({ start: new Date(), end: new Date() });
  const [timeLeft, setTimeLeft] = React.useState("");
  
  const [viewMode, setViewMode] = React.useState<ViewMode>('camera');

  // Store streams in refs to avoid re-renders
  const cameraStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);

  // Whiteboard state
  const [wbColor, setWbColor] = React.useState("#000000");
  const [wbSize, setWbSize] = React.useState(5);
  const [isErasing, setIsErasing] = React.useState(false);

  React.useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
    
    if (params.bookingId === 'test-meeting-123') {
      setBooking(testBooking);
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      setSessionTime({ start: now, end: end });
    } else {
      const storedBookings = localStorage.getItem("userBookings");
      if (storedBookings) {
        const allBookings = JSON.parse(storedBookings);
        const currentBooking = allBookings.find((b: Booking) => b.id === params.bookingId);
        if (currentBooking) {
          setBooking(currentBooking);
          const { start, end } = getSessionDates(currentBooking.slot.day, currentBooking.slot.time);
          setSessionTime({ start, end });
        } else {
          router.replace("/dashboard/bookings");
        }
      }
    }
  }, [params.bookingId, router]);
  
  const getCameraStream = React.useCallback(async () => {
    if (cameraStreamRef.current) {
      return cameraStreamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraStreamRef.current = stream;
      setHasPermission(true);
      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasPermission(false);
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Please enable camera and microphone permissions.",
      });
      return null;
    }
  }, [toast]);

  React.useEffect(() => {
    getCameraStream().then(stream => {
      if (videoRef.current && stream && viewMode === 'camera') {
        videoRef.current.srcObject = stream;
      }
    });

    return () => {
      cameraStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [getCameraStream, viewMode]);
  
  React.useEffect(() => {
    if (!sessionTime.end) return;

    const timer = setInterval(() => {
      const now = new Date();
      const difference = +sessionTime.end - +now;

      if (difference <= 0) {
        setTimeLeft("00:00");
        toast({ title: "Session Ended", description: "Your meeting time has finished." });
        router.replace("/dashboard/bookings");
        clearInterval(timer);
        return;
      }
      
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionTime.end, router, toast]);

  const handleToggleScreenShare = async () => {
    if (viewMode === 'screen') {
      // Stop screen share and switch back to camera
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setViewMode('camera');
      if (videoRef.current && cameraStreamRef.current) {
        videoRef.current.srcObject = cameraStreamRef.current;
      }
    } else {
      // Start screen share
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;

        // When the user stops sharing via the browser UI
        stream.getVideoTracks()[0].onended = () => {
           handleToggleScreenShare(); // Will toggle back to camera
        };
        
        setViewMode('screen');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast({
          variant: "destructive",
          title: "Could not share screen",
          description: "Permission was likely denied. Please try again.",
        });
      }
    }
  };
  
  const handleLeave = () => {
    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    router.replace('/dashboard');
  };

  const handleClearWhiteboard = () => {
    whiteboardRef.current?.clear();
  };

  const colors = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f97316"];


  if (!booking) {
    return null; // or a loading spinner
  }

  const isTeacher = userRole === 'Teacher';

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Session with {booking.tutorName}</h1>
        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
          <Timer className="w-5 h-5 text-primary"/>
          <span className="font-mono text-lg">{timeLeft}</span>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
            {viewMode !== 'whiteboard' && <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted />}
            
            {viewMode === 'whiteboard' && (
                <Whiteboard ref={whiteboardRef} isActive={isTeacher} color={wbColor} size={wbSize} isErasing={isErasing} onDraw={() => {}} />
            )}

            {!hasPermission && (
                 <Alert variant="destructive" className="max-w-md absolute">
                    <VideoOff className="h-4 w-4"/>
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera and microphone access to use this feature.
                    </AlertDescription>
                </Alert>
            )}
            {viewMode === 'screen' && isTeacher && (
                <div className="absolute top-4 left-4 bg-blue-500/80 text-white px-3 py-1 rounded-md text-sm font-medium">
                    You are sharing your screen
                </div>
            )}
             {viewMode === 'whiteboard' && isTeacher && (
                <div className="absolute top-4 left-4 bg-green-500/80 text-white px-3 py-1 rounded-md text-sm font-medium">
                    Whiteboard is active
                </div>
            )}

            {isTeacher && viewMode === 'whiteboard' && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 bg-gray-800/70 p-2 rounded-lg">
                  <Button variant={isErasing ? "secondary" : "default"} size="icon" onClick={() => setIsErasing(false)}> <Pencil className="w-5 h-5"/> </Button>
                  <Button variant={isErasing ? "default" : "secondary"} size="icon" onClick={() => setIsErasing(true)}> <Eraser className="w-5 h-5"/> </Button>
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="secondary" size="icon"><Palette className="w-5 h-5"/></Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" side="left">
                          <div className="flex gap-1">
                              {colors.map(c => <button key={c} onClick={() => setWbColor(c)} className="w-6 h-6 rounded-full" style={{ backgroundColor: c, border: wbColor === c ? '2px solid white' : 'none' }}/>)}
                          </div>
                      </PopoverContent>
                  </Popover>
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button variant="secondary" size="icon" className="relative">
                            <div className="absolute w-full h-full flex items-center justify-center">
                                <div className="rounded-full bg-current" style={{width: wbSize, height: wbSize}}></div>
                            </div>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" side="left">
                           <Slider value={[wbSize]} onValueChange={(v) => setWbSize(v[0])} min={2} max={20} step={1} />
                      </PopoverContent>
                  </Popover>
                   <Button variant="destructive" size="icon" onClick={handleClearWhiteboard}> <Trash2 className="w-5 h-5"/> </Button>
              </div>
            )}

             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 bg-white/10 hover:bg-white/20">
                    <MicOff className="w-6 h-6"/>
                </Button>
                 <Button variant="destructive" size="icon" className="rounded-full h-16 w-16" onClick={handleLeave}>
                    <PhoneOff className="w-7 h-7"/>
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 bg-white/10 hover:bg-white/20" onClick={() => setViewMode('camera')}>
                    <Video className="w-6 h-6" />
                </Button>
                {isTeacher && (
                  <>
                    <Button 
                      variant="secondary"
                      size="icon" 
                      className={cn("rounded-full h-14 w-14 bg-white/10 hover:bg-white/20", viewMode === 'screen' && "bg-blue-500 hover:bg-blue-600")}
                      onClick={handleToggleScreenShare}
                    >
                      <Monitor className="w-6 h-6"/>
                    </Button>
                     <Button 
                      variant="secondary"
                      size="icon" 
                      className={cn("rounded-full h-14 w-14 bg-white/10 hover:bg-white/20", viewMode === 'whiteboard' && "bg-green-500 hover:bg-green-600")}
                      onClick={() => setViewMode('whiteboard')}
                    >
                      <Pencil className="w-6 h-6"/>
                    </Button>
                  </>
                )}
            </div>
        </div>
        <div className="md:col-span-1 bg-gray-800/50 rounded-lg p-4">
          <Card className="bg-transparent border-0 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Participants (2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">T</div>
                 <div>
                    <p className="font-semibold">{booking.tutorName}</p>
                    <p className="text-sm text-gray-400">Teacher</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">S</div>
                <div>
                  <p className="font-semibold">Student</p>
                  <p className="text-sm text-gray-400">Student</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    