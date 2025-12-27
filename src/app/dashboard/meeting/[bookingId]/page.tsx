
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PhoneOff, VideoOff, MicOff, Users, Timer, ScreenShare, ScreenShareOff, Pencil, Eraser, Trash2, Monitor, Video, Palette, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const Whiteboard = React.forwardRef<
    { clear: () => void; },
    { isActive: boolean; color: string; size: number; isErasing: boolean; onDraw: (data: any) => void }
>(({ isActive, color, size, isErasing, onDraw }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const context = canvas.getContext('2d');
        if (!context) return;
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;

        const handleResize = () => {
             const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                contextRef.current = ctx;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = size;
        }
    }, [color, size]);

    const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in event) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        if (!contextRef.current || !isActive) return;
        const { x, y } = getCoords(event);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        if (!contextRef.current || !isActive) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !contextRef.current || !isActive) return;
        const { x, y } = getCoords(event);
        
        contextRef.current.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
        
        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };
    
    React.useImperativeHandle(ref, () => ({
        clear: () => {
            const canvas = canvasRef.current;
            if (canvas && contextRef.current) {
                const dpr = window.devicePixelRatio || 1;
                contextRef.current.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
            }
        }
    }));


    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
            onTouchMove={draw}
            className={cn("w-full h-full bg-white rounded-lg", isActive ? "cursor-crosshair" : "cursor-not-allowed")}
        />
    );
});
Whiteboard.displayName = "Whiteboard";

const MicIndicator = ({ stream, isMuted }: { stream: MediaStream | null, isMuted: boolean }) => {
    const [volume, setVolume] = React.useState(0);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const animationFrameId = React.useRef<number>();

    React.useEffect(() => {
        if (stream && !isMuted) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const getVolume = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                    setVolume(avg / 255); // Normalize to 0-1 range
                }
                animationFrameId.current = requestAnimationFrame(getVolume);
            };
            getVolume();
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [stream, isMuted]);

    return (
        <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-lg">
            {isMuted ? <MicOff className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5 text-green-500" />}
            <div className="flex items-end gap-1 h-6">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="w-1 bg-gray-600 rounded-full transition-all duration-75"
                        style={{
                            height: `${Math.max(5, (isMuted ? 0 : volume) * 100 * ((i + 1) / 8))}%`,
                            backgroundColor: isMuted ? 'rgb(107 114 128)' : `hsl(120, 100%, ${25 + volume * 50}%)`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};


export default function MeetingPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [hasPermission, setHasPermission] = React.useState(true);
  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [sessionTime, setSessionTime] = React.useState({ start: new Date(), end: new Date() });
  const [timeLeft, setTimeLeft] = React.useState("");
  const whiteboardRef = React.useRef<{ clear: () => void }>(null);
  
  const [viewMode, setViewMode] = React.useState<ViewMode>('camera');

  const cameraStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);
  
  const [isMicMuted, setIsMicMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);


  const [wbColor, setWbColor] = React.useState("#000000");
  const [wbSize, setWbSize] = React.useState(5);
  const [isErasing, setIsErasing] = React.useState(false);

  React.useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
    
    const bookingId = params.bookingId;
    if (bookingId === 'test-meeting-123') {
        const now = new Date();
        const end = new Date(now.getTime() + 60 * 60 * 1000);
        setBooking({ ...testBooking, slot: {day: "Mon", time: `${now.getHours()}:${now.getMinutes()}`}});
        setSessionTime({ start: now, end: end });
    } else {
      const storedBookings = localStorage.getItem("userBookings");
      if (storedBookings) {
        const allBookings = JSON.parse(storedBookings);
        const currentBooking = allBookings.find((b: Booking) => b.id === bookingId);
        if (currentBooking) {
          setBooking(currentBooking);
          const { start, end } = getSessionDates(currentBooking.slot.day, currentBooking.slot.time);
          setSessionTime({ start, end });
        } else {
          router.replace("/dashboard/bookings");
        }
      } else {
         router.replace("/dashboard/bookings");
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

  const handleToggleMic = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(prev => !prev);
    }
  };
  
  const handleToggleCamera = () => {
    if (cameraStreamRef.current) {
        cameraStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsCameraOff(prev => !prev);
    }
  };

  const handleToggleScreenShare = async () => {
    if (viewMode === 'screen') {
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setViewMode('camera');
      if (videoRef.current && cameraStreamRef.current) {
        videoRef.current.srcObject = cameraStreamRef.current;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        stream.getVideoTracks()[0].onended = () => {
           handleToggleScreenShare();
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
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col p-4 z-50">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Session with {booking.tutorName}</h1>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
              <Timer className="w-5 h-5 text-primary"/>
              <span className="font-mono text-lg">{timeLeft}</span>
            </div>
             <MicIndicator stream={cameraStreamRef.current} isMuted={isMicMuted} />
            <div className="md:hidden">
              <Users className="w-5 h-5"/>
            </div>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0">
        <div className="md:col-span-3 bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
            {viewMode !== 'whiteboard' && (
              <div className="w-full h-full">
                <video ref={videoRef} className={cn("w-full h-full object-contain", isCameraOff && "hidden")} autoPlay muted />
                {isCameraOff && (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                        <Avatar className="w-32 h-32">
                           <AvatarImage src="https://picsum.photos/seed/user-avatar/100" />
                           <AvatarFallback>{isTeacher ? 'T' : 'S'}</AvatarFallback>
                        </Avatar>
                        <p className="mt-4 text-lg">Camera is off</p>
                   </div>
                )}
              </div>
            )}
            
            {viewMode === 'whiteboard' && (
                <Whiteboard ref={whiteboardRef} isActive={isTeacher} color={wbColor} size={wbSize} isErasing={isErasing} onDraw={() => {}} />
            )}

            {!hasPermission && viewMode === 'camera' && !isCameraOff &&(
                 <Alert variant="destructive" className="max-w-md absolute">
                    <VideoOff className="h-4 w-4"/>
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera and microphone access to use this feature.
                    </AlertDescription>
                </Alert>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
                {viewMode === 'screen' && isTeacher && (
                    <div className="bg-blue-500/80 text-white px-3 py-1 rounded-md text-sm font-medium">
                        You are sharing your screen
                    </div>
                )}
                 {viewMode === 'whiteboard' && isTeacher && (
                    <div className="bg-green-500/80 text-white px-3 py-1 rounded-md text-sm font-medium">
                        Whiteboard is active
                    </div>
                )}
            </div>

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

             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-gray-800/50 p-2 rounded-full">
                <Button 
                    variant="secondary"
                    size="icon" 
                    className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", isMicMuted && "bg-red-500 hover:bg-red-600")}
                    onClick={handleToggleMic}
                >
                    {isMicMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                </Button>
                 <Button 
                    variant="secondary"
                    size="icon"
                    className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", isCameraOff && "bg-red-500 hover:bg-red-600")}
                    onClick={handleToggleCamera}
                 >
                     {isCameraOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
                 </Button>
                 <Button variant="destructive" size="icon" className="rounded-full h-14 w-14 sm:h-16 sm:w-16" onClick={handleLeave}>
                    <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7"/>
                </Button>
                {isTeacher && (
                  <>
                    <Button 
                      variant={viewMode === 'screen' ? 'default' : 'secondary'}
                      size="icon" 
                      className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", viewMode === 'screen' && "bg-blue-500 hover:bg-blue-600")}
                      onClick={handleToggleScreenShare}
                      disabled={isCameraOff}
                    >
                      <Monitor className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </Button>
                     <Button 
                      variant={viewMode === 'whiteboard' ? 'default' : 'secondary'}
                      size="icon" 
                      className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", viewMode === 'whiteboard' && "bg-green-500 hover:bg-green-600")}
                      onClick={() => setViewMode('whiteboard')}
                    >
                      <Pencil className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </Button>
                  </>
                )}
            </div>
        </div>
        <div className="hidden md:flex flex-col bg-gray-800/50 rounded-lg p-4">
          <Card className="bg-transparent border-0 text-white flex-grow">
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
