
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PhoneOff, VideoOff, MicOff, Users, Timer, ScreenShare, ScreenShareOff } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function MeetingPage({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [hasPermission, setHasPermission] = React.useState(true);
  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [sessionTime, setSessionTime] = React.useState({ start: new Date(), end: new Date() });
  const [timeLeft, setTimeLeft] = React.useState("");
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  // Store streams in refs to avoid re-renders
  const cameraStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);

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
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    });

    return () => {
      cameraStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [getCameraStream]);
  
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
    if (isScreenSharing) {
      // Stop screen share and switch back to camera
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
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
        
        setIsScreenSharing(true);
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
  }


  if (!booking) {
    return null; // or a loading spinner
  }

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
            <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted />
            {!hasPermission && (
                 <Alert variant="destructive" className="max-w-md absolute">
                    <VideoOff className="h-4 w-4"/>
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera and microphone access to use this feature.
                    </AlertDescription>
                </Alert>
            )}
             {isScreenSharing && userRole === "Teacher" && (
                <div className="absolute top-4 left-4 bg-blue-500/80 text-white px-3 py-1 rounded-md text-sm font-medium">
                    You are sharing your screen
                </div>
            )}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 bg-white/10 hover:bg-white/20">
                    <MicOff className="w-6 h-6"/>
                </Button>
                 <Button variant="destructive" size="icon" className="rounded-full h-16 w-16" onClick={handleLeave}>
                    <PhoneOff className="w-7 h-7"/>
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 bg-white/10 hover:bg-white/20">
                    <VideoOff className="w-6 h-6"/>
                </Button>
                {userRole === 'Teacher' && (
                  <Button 
                    variant="secondary"
                    size="icon" 
                    className={cn("rounded-full h-14 w-14 bg-white/10 hover:bg-white/20", isScreenSharing && "bg-blue-500 hover:bg-blue-600")}
                    onClick={handleToggleScreenShare}
                  >
                    {isScreenSharing ? <ScreenShareOff className="w-6 h-6"/> : <ScreenShare className="w-6 h-6"/>}
                  </Button>
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
