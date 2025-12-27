"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PhoneOff, VideoOff, MicOff, Users, Timer, Pencil, Eraser, Trash2, Monitor, Video, Palette, Mic, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirebase } from "@/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore";

type ViewMode = 'camera' | 'screen' | 'whiteboard';

interface Participant {
    id: string;
    uid: string;
    role: string;
    name: string;
    isLocal: boolean;
    stream: MediaStream | null;
    isCameraOff: boolean;
    isMicMuted: boolean;
}

const ParticipantVideo = ({ stream, isCameraOff, isMicMuted, name, isLocal = false }: { stream: MediaStream | null, isCameraOff: boolean, isMicMuted: boolean, name: string, isLocal?: boolean }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    return (
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative group">
            <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': isCameraOff })} autoPlay playsInline muted={isLocal} />
             {isCameraOff && (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <Avatar className="w-16 h-16">
                       <AvatarImage src={`https://picsum.photos/seed/${name}/100`} />
                       <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            )}
            <div className="absolute bottom-0 left-0 bg-black/50 px-2 py-1 rounded-tr-lg">
                <span className="text-sm text-white">{name} {isLocal && '(You)'}</span>
            </div>
            <div className="absolute top-2 right-2">
                {isMicMuted ? <MicOff className="w-5 h-5 text-red-500 bg-black/50 rounded-full p-1" /> : <Mic className="w-5 h-5 text-green-500 bg-black/50 rounded-full p-1" />}
            </div>
        </div>
    );
};

const Whiteboard = React.forwardRef<
    { clear: () => void; },
    { isActive: boolean; color: string; size: number; isErasing: boolean; }
>(({ isActive, color, size, isErasing }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
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
                 if(contextRef.current) {
                    ctx.strokeStyle = contextRef.current.strokeStyle;
                    ctx.lineWidth = contextRef.current.lineWidth;
                }
                contextRef.current = ctx;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

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
            x: (clientX - rect.left),
            y: (clientY - rect.top),
        };
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (!contextRef.current || !isActive) return;
        const { x, y } = getCoords(event);
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);
        setIsDrawing(true);
    };

    const finishDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (!contextRef.current || !isActive) return;
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
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
            className={cn("w-full h-full bg-white rounded-lg", isActive ? "touch-none" : "pointer-events-none")}
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
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

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
                audioContextRef.current.close().catch(console.error);
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
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  
  const [meetingRoomId, setMeetingRoomId] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [hasPermission, setHasPermission] = React.useState(true);
  const [timeLeft, setTimeLeft] = React.useState("");
  const whiteboardRef = React.useRef<{ clear: () => void }>(null);
  
  const [viewMode, setViewMode] = React.useState<ViewMode>('camera');

  const localStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);
  
  const [isMicMuted, setIsMicMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);

  const [wbColor, setWbColor] = React.useState("#000000");
  const [wbSize, setWbSize] = React.useState(5);
  const [isErasing, setIsErasing] = React.useState(false);
  
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [mainViewStream, setMainViewStream] = React.useState<MediaStream | null>(null);
  const [mainViewParticipant, setMainViewParticipant] = React.useState<Participant | null>(null);

  // This should be WebRTC peer connections in a real app
  const peerConnections = React.useRef<Map<string, any>>(new Map());

  React.useEffect(() => {
    const roomId = params.bookingId as string;
    if (!roomId) {
        toast({ title: "Error", description: "No meeting room ID found." });
        router.replace('/dashboard');
        return;
    }
    setMeetingRoomId(roomId);
  }, [params.bookingId, router, toast]);

  // Main effect for joining and managing the meeting
  React.useEffect(() => {
    if (!meetingRoomId || !user || !firestore) return;

    let unsubscribeParticipants: () => void;

    const joinMeeting = async () => {
        try {
            // Get local media stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setHasPermission(true);

            // Fetch user's role from Firestore
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const role = userDoc.exists() ? userDoc.data().role : 'student';
            const name = userDoc.exists() ? userDoc.data().name : 'Guest';
            setUserRole(role);

            // Add self to participants collection in Firestore
            const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
            await setDoc(selfParticipantRef, {
                uid: user.uid,
                role: role,
                name: name,
                cameraOn: !isCameraOff,
                micOn: !isMicMuted,
                joinedAt: serverTimestamp(),
            });

            // Set up listener for participants
            const participantsColRef = collection(firestore, `participants/${meetingRoomId}/users`);
            unsubscribeParticipants = onSnapshot(participantsColRef, (snapshot) => {
                const remoteParticipants: Participant[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.uid !== user.uid) { // Don't add self to remote list
                        remoteParticipants.push({
                            id: doc.id,
                            uid: data.uid,
                            role: data.role,
                            name: data.name,
                            isLocal: false,
                            stream: null, // Placeholder for WebRTC stream
                            isCameraOff: !data.cameraOn,
                            isMicMuted: !data.micOn,
                        });
                    }
                });
                
                const localUser: Participant = {
                    id: user.uid,
                    uid: user.uid,
                    role: role,
                    name: name,
                    isLocal: true,
                    stream: localStreamRef.current,
                    isCameraOff: isCameraOff,
                    isMicMuted: isMicMuted,
                };
                
                setParticipants([localUser, ...remoteParticipants]);
                if (!mainViewParticipant || mainViewParticipant.id === user.uid) {
                    setMainViewStream(localStreamRef.current);
                    setMainViewParticipant(localUser);
                }
            });

        } catch (error) {
            console.error("Error joining meeting:", error);
            setHasPermission(false);
            toast({
                variant: "destructive",
                title: "Could not join meeting",
                description: "Please enable camera and microphone permissions.",
            });
            router.replace('/dashboard');
        }
    };

    joinMeeting();

    return () => {
        // Cleanup on unmount
        if (unsubscribeParticipants) unsubscribeParticipants();
        if (user && meetingRoomId) {
            const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
            deleteDoc(selfParticipantRef);
        }
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [meetingRoomId, user, firestore]);

  
  const handleToggleMic = async () => {
    const newMutedState = !isMicMuted;
    localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    setIsMicMuted(newMutedState);
    
    // Update self in participants list
    setParticipants(p => p.map(u => u.isLocal ? {...u, isMicMuted: newMutedState} : u));
    
    // Update Firestore
    if (user && meetingRoomId) {
        const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
        await setDoc(selfParticipantRef, { micOn: !newMutedState }, { merge: true });
    }
  };
  
  const handleToggleCamera = async () => {
    const newCameraOffState = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = !newCameraOffState);
    setIsCameraOff(newCameraOffState);

    // Update self in participants list
    setParticipants(p => p.map(u => u.isLocal ? {...u, isCameraOff: newCameraOffState} : u));
    if(mainViewParticipant?.isLocal) {
        setMainViewParticipant((p: any) => ({...p, isCameraOff: newCameraOffState}));
    }

    // Update Firestore
     if (user && meetingRoomId) {
        const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
        await setDoc(selfParticipantRef, { cameraOn: !newCameraOffState }, { merge: true });
    }
  };

  const handleToggleScreenShare = async () => {
     // Not implemented with full WebRTC
  };
  
  const handleLeave = () => {
    router.replace('/dashboard');
  };

  const handleClearWhiteboard = () => {
    whiteboardRef.current?.clear();
  };

  const colors = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f97316"];

  if (isUserLoading || !meetingRoomId) {
    return <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center">Loading meeting...</div>;
  }

  const isTeacher = userRole === 'Teacher';

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col p-4 z-50">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
            <h1 className="text-xl font-bold">Meeting Room</h1>
            <p className="text-xs text-muted-foreground font-mono">Room ID: {meetingRoomId}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
              <Users className="w-5 h-5 text-primary"/>
              <span className="font-mono text-lg">{participants.length}</span>
            </div>
             <MicIndicator stream={localStreamRef.current} isMuted={isMicMuted} />
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 min-h-0">
        <div className="md:col-span-3 bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
            {viewMode === 'whiteboard' ? (
                <Whiteboard ref={whiteboardRef} isActive={isTeacher} color={wbColor} size={wbSize} isErasing={isErasing} />
            ) : mainViewParticipant ? (
              <div className="w-full h-full">
                <ParticipantVideo 
                    stream={mainViewStream}
                    isCameraOff={mainViewParticipant.isCameraOff}
                    isMicMuted={mainViewParticipant.isMicMuted}
                    name={mainViewParticipant.name}
                    isLocal={mainViewParticipant.isLocal}
                />
              </div>
            ): (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                    <p>Select a participant to view</p>
                 </div>
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
            
            {isTeacher && viewMode === 'whiteboard' && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 bg-gray-800/70 p-2 rounded-lg z-10">
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

             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-gray-800/50 p-2 rounded-full z-10">
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
                      onClick={() => {}}
                      disabled
                    >
                      <Monitor className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </Button>
                     <Button 
                      variant={viewMode === 'whiteboard' ? 'default' : 'secondary'}
                      size="icon" 
                      className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", viewMode === 'whiteboard' && "bg-green-500 hover:bg-green-600")}
                      onClick={() => setViewMode(viewMode === 'whiteboard' ? 'camera' : 'whiteboard')}
                    >
                      <Pencil className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </Button>
                  </>
                )}
            </div>
        </div>
        <div className="hidden md:flex flex-col bg-gray-800/50 rounded-lg p-4 gap-4">
          <Card className="bg-transparent border-0 text-white">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-base"><Users className="w-5 h-5"/> Participants ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 overflow-y-auto">
              {participants.map(p => (
                <div key={p.id} onClick={() => {
                    if (p.isLocal) {
                        setMainViewStream(localStreamRef.current);
                    } else {
                        // In real WebRTC, you'd set the stream from the peer connection
                        setMainViewStream(null);
                    }
                    setMainViewParticipant(p);
                }}>
                    <ParticipantVideo 
                        stream={p.stream}
                        isCameraOff={p.isCameraOff}
                        isMicMuted={p.isMicMuted}
                        name={p.name}
                        isLocal={p.isLocal}
                    />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
