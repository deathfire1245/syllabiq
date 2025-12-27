"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PhoneOff, VideoOff, MicOff, Users, Pencil, Eraser, Trash2, Monitor, Video, Palette, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirebase } from "@/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";

type ViewMode = 'camera' | 'screen' | 'whiteboard';

interface Participant {
    uid: string;
    name: string;
    role: string;
    cameraOn: boolean;
    micOn: boolean;
    isLocal: boolean;
    stream: MediaStream | null;
}

const ParticipantVideo = ({ stream, cameraOn, micOn, name, isLocal = false }: { stream: MediaStream | null, cameraOn: boolean, micOn: boolean, name: string, isLocal?: boolean }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    return (
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative group cursor-pointer">
            <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !cameraOn })} autoPlay playsInline muted={isLocal} />
             {!cameraOn && (
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
                {!micOn ? <MicOff className="w-5 h-5 text-red-500 bg-black/50 rounded-full p-1" /> : <Mic className="w-5 h-5 text-green-500 bg-black/50 rounded-full p-1" />}
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

        const scaleX = canvas.width / (rect.width * (window.devicePixelRatio || 1));
        const scaleY = canvas.height / (rect.height * (window.devicePixelRatio || 1));

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
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
                contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
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
  const [mainViewParticipant, setMainViewParticipant] = React.useState<Participant | null>(null);
  
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

  React.useEffect(() => {
    if (!meetingRoomId || !user || !firestore) return;

    let unsubscribeParticipants: () => void;

    const joinMeeting = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setHasPermission(true);

            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const role = userDoc.exists() ? userDoc.data().role : 'student';
            const name = userDoc.exists() ? userDoc.data().name : 'Guest';
            setUserRole(role);

            const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
            await setDoc(selfParticipantRef, {
                uid: user.uid,
                role: role,
                name: name,
                cameraOn: !isCameraOff,
                micOn: !isMicMuted,
                joinedAt: serverTimestamp(),
            });

            const participantsColRef = collection(firestore, `participants/${meetingRoomId}/users`);
            unsubscribeParticipants = onSnapshot(participantsColRef, (snapshot) => {
                const updatedParticipants: Participant[] = [];
                snapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    const isLocal = data.uid === user.uid;
                    updatedParticipants.push({
                        uid: data.uid,
                        name: data.name,
                        role: data.role,
                        cameraOn: data.cameraOn,
                        micOn: data.micOn,
                        isLocal: isLocal,
                        stream: isLocal ? localStreamRef.current : null, // Placeholder for remote streams
                    });
                });
                
                setParticipants(updatedParticipants);
                const localUser = updatedParticipants.find(p => p.isLocal);
                 if (!mainViewParticipant && localUser) {
                    setMainViewParticipant(localUser);
                } else if(mainViewParticipant) {
                    // Update main view participant if their state changed
                    const updatedMain = updatedParticipants.find(p => p.uid === mainViewParticipant.uid);
                    if (updatedMain) setMainViewParticipant(updatedMain);
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

    const leaveMeeting = () => {
        if (unsubscribeParticipants) unsubscribeParticipants();
        if (user && meetingRoomId) {
            const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
            deleteDoc(selfParticipantRef);
        }
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
    }

    // Add beforeunload event listener to handle tab closing
    window.addEventListener('beforeunload', leaveMeeting);

    return () => {
        leaveMeeting();
        window.removeEventListener('beforeunload', leaveMeeting);
    };
  }, [meetingRoomId, user, firestore]);

  
  const handleToggleMic = async () => {
    if (!user || !meetingRoomId) return;
    const newMutedState = !isMicMuted;
    localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    setIsMicMuted(newMutedState);
    const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
    await updateDoc(selfParticipantRef, { micOn: !newMutedState });
  };
  
  const handleToggleCamera = async () => {
    if (!user || !meetingRoomId) return;
    const newCameraOffState = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = !newCameraOffState);
    setIsCameraOff(newCameraOffState);
    const selfParticipantRef = doc(firestore, `participants/${meetingRoomId}/users`, user.uid);
    await updateDoc(selfParticipantRef, { cameraOn: !newCameraOffState });
  };

  const handleToggleScreenShare = async () => {
     if (viewMode === 'screen') {
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
        setViewMode('camera');
        setMainViewParticipant(participants.find(p => p.isLocal) || null);
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        setViewMode('screen');
        setMainViewParticipant({
            uid: user!.uid,
            name: 'Your Screen',
            role: 'screen',
            cameraOn: true,
            micOn: false,
            isLocal: true,
            stream: stream,
        });

        stream.getVideoTracks()[0].onended = () => {
            setViewMode('camera');
            setMainViewParticipant(participants.find(p => p.isLocal) || null);
        };
    } catch (error) {
        console.error("Screen share failed:", error);
        toast({ title: "Screen share failed", description: "Could not start screen sharing." });
    }
  };
  
  const handleLeave = () => {
    router.replace('/dashboard');
  };

  const handleClearWhiteboard = () => {
    whiteboardRef.current?.clear();
  };
  
  const handleParticipantClick = (participant: Participant) => {
    if (participant.isLocal) {
        setMainViewParticipant({ ...participant, stream: localStreamRef.current });
    } else {
        // In a real WebRTC app, you'd get the stream from the peer connection
        setMainViewParticipant({ ...participant, stream: null });
    }
  };

  const colors = ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f97316"];

  if (isUserLoading || !meetingRoomId) {
    return <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center">Loading meeting...</div>;
  }

  const isTeacher = userRole === 'Teacher';
  const localParticipant = participants.find(p => p.isLocal);
  const remoteParticipants = participants.filter(p => !p.isLocal);

  const currentMainViewStream = viewMode === 'screen' 
        ? screenStreamRef.current 
        : mainViewParticipant?.isLocal 
            ? localStreamRef.current 
            : null; // Remote streams not handled yet

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col z-50">
     <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <main className="flex-1 flex flex-col p-4 gap-4 min-h-0">
          <header className="flex justify-between items-center flex-shrink-0">
            <div>
                <h1 className="text-xl font-bold">Meeting Room</h1>
                <p className="text-xs text-muted-foreground font-mono">Room ID: {meetingRoomId}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <Users className="w-5 h-5 text-primary"/>
                  <span className="font-mono text-lg">{participants.length}</span>
                </div>
                {localParticipant && <MicIndicator stream={localStreamRef.current} isMuted={!localParticipant.micOn} />}
            </div>
          </header>
          
          <div className="flex-grow bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
              {viewMode === 'whiteboard' ? (
                  <Whiteboard ref={whiteboardRef} isActive={isTeacher} color={wbColor} size={wbSize} isErasing={isErasing} />
              ) : mainViewParticipant ? (
                <div className="w-full h-full">
                  <ParticipantVideo 
                      stream={currentMainViewStream}
                      cameraOn={mainViewParticipant.cameraOn}
                      micOn={mainViewParticipant.micOn}
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
                  {localParticipant && (
                    <>
                      <Button 
                          variant="secondary"
                          size="icon" 
                          className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", !localParticipant.micOn && "bg-red-500 hover:bg-red-600")}
                          onClick={handleToggleMic}
                      >
                          {!localParticipant.micOn ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </Button>
                       <Button 
                          variant="secondary"
                          size="icon"
                          className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", !localParticipant.cameraOn && "bg-red-500 hover:bg-red-600")}
                          onClick={handleToggleCamera}
                       >
                           {!localParticipant.cameraOn ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
                       </Button>
                    </>
                  )}
                   <Button variant="destructive" size="icon" className="rounded-full h-14 w-14 sm:h-16 sm:w-16" onClick={handleLeave}>
                      <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7"/>
                  </Button>
                  {isTeacher && (
                    <>
                      <Button 
                        variant="secondary"
                        size="icon" 
                        className={cn("rounded-full h-12 w-12 sm:h-14 sm:w-14 bg-white/10 hover:bg-white/20", viewMode === 'screen' && "bg-blue-500 hover:bg-blue-600")}
                        onClick={handleToggleScreenShare}
                      >
                        <Monitor className="w-5 h-5 sm:w-6 sm:h-6"/>
                      </Button>
                       <Button 
                        variant="secondary"
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
        </main>
        
        <aside className="w-full md:w-80 bg-gray-800/50 p-4 flex flex-col gap-4 border-l border-gray-700/50">
           <Card className="bg-transparent border-0 text-white flex-1 min-h-0">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-base"><Users className="w-5 h-5"/> Participants ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 overflow-y-auto h-full">
              {participants.map(p => (
                <div key={p.uid} onClick={() => handleParticipantClick(p)}>
                    <ParticipantVideo 
                        stream={p.stream}
                        cameraOn={p.cameraOn}
                        micOn={p.micOn}
                        name={p.name}
                        isLocal={p.isLocal}
                    />
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
     </div>
    </div>
  );
}
