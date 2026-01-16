
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PhoneOff, VideoOff, MicOff, Users, Pencil, Eraser, Trash2, Monitor, Video, Palette, Mic, Check, Copy, Grip, Square, Circle as CircleIcon, ArrowRight, Minus, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, addDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';

type ViewMode = 'camera' | 'screen' | 'whiteboard';
type WhiteboardTool = 'pen' | 'eraser' | 'shape' | 'text';
type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

interface Stroke {
    id: string;
    points: {x: number, y: number}[];
    tool: WhiteboardTool;
    shape: ShapeType | null;
    color: string;
    size: number;
}


interface Participant {
    uid: string;
    name: string;
    role: string;
    cameraOn: boolean;
    micOn: boolean;
    isLocal: boolean;
    stream: MediaStream | null;
}

const ParticipantVideo = ({ stream, cameraOn, micOn, name, isLocal = false, isMainView = false }: { stream: MediaStream | null, cameraOn: boolean, micOn: boolean, name: string, isLocal?: boolean, isMainView?: boolean }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    return (
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg border border-gray-200/50",
            isMainView ? "w-full h-full" : ""
          )}
        >
            <video ref={videoRef} className={cn("w-full h-full object-cover transition-opacity duration-300", { 'opacity-0': !cameraOn })} autoPlay playsInline muted={isLocal} />
             {!cameraOn && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200/50">
                    <Avatar className={cn("border-4 border-white/50 shadow-md", isMainView ? "w-24 h-24" : "w-16 h-16")}>
                       <AvatarImage src={`https://picsum.photos/seed/${name}/100`} />
                       <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {!isMainView && <p className="mt-2 text-xs text-gray-500 font-medium">{name}</p>}
                </div>
            )}
            {isMainView && (
              <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <span className="text-sm font-semibold text-white">{name} {isLocal && '(You)'}</span>
              </div>
            )}
            <div className={cn("absolute top-3 right-3 transition-opacity duration-300", isMainView ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                {!micOn ? 
                  <MicOff className="w-5 h-5 text-white bg-red-500 rounded-full p-1" /> : 
                  <Mic className="w-5 h-5 text-white bg-green-500/50 backdrop-blur-sm rounded-full p-1" />
                }
            </div>
        </motion.div>
    );
};

const Whiteboard = React.forwardRef<
    { clear: () => void; },
    { 
        isActive: boolean; 
        tool: WhiteboardTool; 
        shape: ShapeType | null; 
        color: string; 
        size: number;
        onStroke: (stroke: Omit<Stroke, 'id'>) => void;
        initialStrokes: Stroke[];
        clearStrokesSignal: number;
    }
>(({ isActive, tool, shape, color, size, onStroke, initialStrokes, clearStrokesSignal }, ref) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [currentPoints, setCurrentPoints] = React.useState<{x: number, y: number}[]>([]);
    const [snapshot, setSnapshot] = React.useState<ImageData | null>(null);

    const drawAllStrokes = React.useCallback((strokes: Stroke[]) => {
        const ctx = contextRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        strokes.forEach(stroke => {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            
            ctx.beginPath();
            if (stroke.points.length > 0) {
                 ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            }

            if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
                stroke.points.forEach(point => ctx.lineTo(point.x, point.y));
            } else if (stroke.tool === 'shape' && stroke.points.length > 1) {
                const start = stroke.points[0];
                const end = stroke.points[stroke.points.length - 1];
                drawShape(ctx, stroke.shape, start.x, start.y, end.x, end.y, stroke.size);
            }
            ctx.stroke();
        });
    }, []);

    React.useEffect(() => {
        drawAllStrokes(initialStrokes);
    }, [initialStrokes, drawAllStrokes]);
    
     React.useEffect(() => {
        if(clearStrokesSignal > 0) {
            drawAllStrokes([]);
        }
    }, [clearStrokesSignal, drawAllStrokes]);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            // Preserve drawing buffer
            const tempSnapshot = contextRef.current?.getImageData(0, 0, canvas.width, canvas.height);

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                contextRef.current = ctx;

                // Restore drawing buffer and redraw strokes
                if (tempSnapshot) {
                    drawAllStrokes(initialStrokes);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [initialStrokes, drawAllStrokes]);
    
    React.useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = size;
            contextRef.current.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        }
    }, [color, size, tool]);

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
        const ctx = contextRef.current;
        if (!ctx || !isActive) return;

        const point = getCoords(event);
        setIsDrawing(true);
        setCurrentPoints([point]);

        if (tool === 'shape' || tool === 'text') {
            const canvas = canvasRef.current!;
            setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }
        
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    };

    const finishDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (!isDrawing || !contextRef.current || currentPoints.length === 0) return;
        
        const finalPoints = [...currentPoints, getCoords(event)];
        
        onStroke({
            points: finalPoints,
            tool,
            shape,
            color,
            size,
            timestamp: serverTimestamp(),
        });
        
        setIsDrawing(false);
        setCurrentPoints([]);
        setSnapshot(null);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (!isDrawing || !contextRef.current) return;
        const point = getCoords(event);
        
        setCurrentPoints(prev => [...prev, point]);

        if (tool === 'pen' || tool === 'eraser') {
            contextRef.current.lineTo(point.x, point.y);
            contextRef.current.stroke();
        } else if (tool === 'shape' && currentPoints.length > 0 && snapshot) {
            contextRef.current.putImageData(snapshot, 0, 0); // Restore canvas to pre-shape state
            const startPoint = currentPoints[0];
            drawShape(contextRef.current, shape, startPoint.x, startPoint.y, point.x, point.y, size); // Draw the current shape preview
            contextRef.current.stroke();
        }
    };
    
    const drawShape = (ctx: CanvasRenderingContext2D, currentShape: ShapeType | null, startX: number, startY: number, endX: number, endY: number, currentSize: number) => {
        if (!ctx || !currentShape) return;

        ctx.beginPath();
        switch (currentShape) {
            case 'rectangle':
                ctx.rect(startX, startY, endX - startX, endY - startY);
                break;
            case 'circle':
                const radiusX = Math.abs(endX - startX) / 2;
                const radiusY = Math.abs(endY - startY) / 2;
                const centerX = startX + (endX - startX) / 2;
                const centerY = startY + (endY - startY) / 2;
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                break;
            case 'line':
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                break;
            case 'arrow':
                const headlen = 10 + currentSize; // length of head in pixels
                const angle = Math.atan2(endY - startY, endX - startX);
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
                break;
        }
    };

    React.useImperativeHandle(ref, () => ({
        clear: () => {
            onStroke({
                points: [],
                tool: 'eraser',
                shape: null,
                color: '#ffffff',
                size: 9999,
                timestamp: serverTimestamp(),
            });
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
            className={cn("w-full h-full bg-white rounded-2xl shadow-inner border border-gray-200/80", isActive ? "touch-none" : "pointer-events-none", tool === 'text' && "cursor-text")}
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
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-gray-200/50">
            {isMuted ? <MicOff className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5 text-green-500" />}
            <div className="flex items-end gap-1 h-6">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="w-1 bg-gray-300 rounded-full transition-all duration-75"
                        style={{
                            height: `${Math.max(5, (isMuted ? 0 : volume) * 100 * ((i + 1) / 8))}%`,
                            backgroundColor: isMuted ? '#d1d5db' : `hsl(140, 70%, ${60 - volume * 30}%)`,
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
  const { user, firestore } = useFirebase();
  
  const [ticketData, setTicketData] = React.useState<any | null>(null);
  const [meetingRoomId, setMeetingRoomId] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [hasPermission, setHasPermission] = React.useState(true);
  const whiteboardRef = React.useRef<{ clear: () => void }>(null);
  
  const [viewMode, setViewMode] = React.useState<ViewMode>('camera');
  const [showParticipants, setShowParticipants] = React.useState(true);

  const localStreamRef = React.useRef<MediaStream | null>(null);
  const screenStreamRef = React.useRef<MediaStream | null>(null);
  
  const [isMicMuted, setIsMicMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);

  const [wbTool, setWbTool] = React.useState<WhiteboardTool>('pen');
  const [wbShape, setWbShape] = React.useState<ShapeType>('rectangle');
  const [wbColor, setWbColor] = React.useState("#1e293b");
  const [wbSize, setWbSize] = React.useState(5);
  
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [mainViewParticipant, setMainViewParticipant] = React.useState<Participant | null>(null);

  const strokesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !meetingRoomId) return null;
    return collection(firestore, 'whiteboards', meetingRoomId, 'strokes');
  }, [firestore, meetingRoomId]);

  const { data: strokes } = useCollection<Omit<Stroke, 'id'>>(strokesCollectionRef);
  const [clearStrokesSignal, setClearStrokesSignal] = React.useState(0);
  
  const peerConnections = React.useRef<Map<string, any>>(new Map());

  React.useEffect(() => {
    const ticketId = params.bookingId as string;
    if (!ticketId) {
        toast({ title: "Error", description: "No meeting ticket ID found." });
        router.replace('/dashboard');
        return;
    }
    
    const role = localStorage.getItem('userRole');
    if(role) setUserRole(role);

    const joinMeeting = async () => {
      if (!user || !firestore) {
          return; // Wait for auth to be ready
      }

      const ticketRef = doc(firestore, 'tickets', ticketId);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
          toast({ variant: "destructive", title: "Not Found", description: "This session ticket does not exist." });
          router.replace('/dashboard/bookings');
          return;
      }

      const currentTicket = ticketSnap.data();
      setTicketData(currentTicket);

      const isParticipant = user.uid === currentTicket.studentId || user.uid === currentTicket.teacherId;
      if (!isParticipant) {
          toast({ variant: "destructive", title: "Access Denied", description: "You are not a participant in this session." });
          router.replace('/dashboard/bookings');
          return;
      }
      
      const terminalStatuses = ['COMPLETED', 'CANCELLED', 'REFUND_PROCESSED'];
      if (terminalStatuses.includes(currentTicket.status)) {
          toast({ variant: "destructive", title: "Session Over", description: "This session has already ended." });
          router.replace('/dashboard/bookings');
          return;
      }

      if (currentTicket.meetingId) {
           setMeetingRoomId(currentTicket.meetingId);
      } else {
          console.warn("meetingId not found on ticket, using ticket ID as fallback.");
          setMeetingRoomId(ticketId);
      }

      if (role === 'teacher' && currentTicket.status === 'WAITING_FOR_TEACHER') {
           try {
              await updateDoc(ticketRef, {
                  status: 'ACTIVE',
                  activatedAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
              });
           } catch (e) {
               console.error("Failed to activate session", e);
               toast({ variant: "destructive", title: "Error", description: "Could not activate the session." });
               return;
           }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setHasPermission(true);

        const localUser: Participant = {
          uid: user.uid,
          name: role === 'student' ? currentTicket.studentName : currentTicket.teacherName,
          role: role as string,
          cameraOn: true,
          micOn: true,
          isLocal: true,
          stream: stream
        };

        const otherUser: Participant = {
            uid: `user-other-${Date.now()}`,
            name: role === 'student' ? currentTicket.teacherName : currentTicket.studentName,
            role: role === 'student' ? "teacher" : "student",
            cameraOn: true,
            micOn: true,
            isLocal: false,
            stream: null
        }

        setParticipants([localUser, otherUser]);
        setMainViewParticipant(localUser);

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

    if (user && firestore) {
        joinMeeting();
    }

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [params.bookingId, router, toast, user, firestore]);

  
  const handleToggleMic = async () => {
    const newMutedState = !isMicMuted;
    localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    setIsMicMuted(newMutedState);
    setParticipants(prev => prev.map(p => p.isLocal ? { ...p, micOn: !newMutedState } : p));
  };
  
  const handleToggleCamera = async () => {
    const newCameraOffState = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = !newCameraOffState);
    setIsCameraOff(newCameraOffState);
    setParticipants(prev => prev.map(p => p.isLocal ? { ...p, cameraOn: !newCameraOffState } : p));
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
            uid: `screen-${Date.now()}`,
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
  
  const handleLeave = async () => {
    const ticketId = params.bookingId as string;
    if (firestore && ticketId && userRole && ticketData && ticketData.status === 'ACTIVE') {
        const ticketRef = doc(firestore, 'tickets', ticketId);
        try {
            await updateDoc(ticketRef, {
                status: 'COMPLETED',
                endedAt: serverTimestamp(),
                endedBy: userRole.toUpperCase(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Failed to update ticket status on leave:", error);
        }
    }
    router.replace('/dashboard/bookings');
  };

   const handleStroke = async (stroke: Omit<Stroke, 'id' | 'timestamp'> & {timestamp: any}) => {
        if (!strokesCollectionRef) return;
        
        if (stroke.tool === 'eraser' && stroke.size === 9999) {
            // This is the clear signal
            await addDoc(strokesCollectionRef, { type: 'clear', timestamp: serverTimestamp() });
        } else {
            await addDoc(strokesCollectionRef, { ...stroke, timestamp: serverTimestamp() });
        }
    };

    const handleClearWhiteboard = () => {
        if (!strokesCollectionRef) return;
         addDoc(strokesCollectionRef, { type: 'clear', timestamp: serverTimestamp() });
    };

    const processedStrokes = React.useMemo(() => {
        if (!strokes) return [];
        let currentStrokes: Stroke[] = [];
        // The `useCollection` hook does not guarantee order, so we need to sort by timestamp if available
        const sortedEvents = strokes.sort((a: any, b: any) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));

        for (const event of sortedEvents) {
            if ((event as any).type === 'clear') {
                currentStrokes = [];
            } else {
                currentStrokes.push(event as Stroke);
            }
        }
        return currentStrokes;
    }, [strokes]);

  
  const handleParticipantClick = (participant: Participant) => {
    setMainViewParticipant(participant);
  };
  
  const handleWbToolChange = (tool: WhiteboardTool) => {
    setWbTool(tool);
  };

  const handleShapeSelect = (shape: ShapeType) => {
    setWbTool('shape');
    setWbShape(shape);
  }

  const colors = ["#1e293b", "#ef4444", "#3b82f6", "#22c55e", "#f97316"];
  const shapes = [
    { type: 'rectangle', icon: Square },
    { type: 'circle', icon: CircleIcon },
    { type: 'line', icon: Minus },
    { type: 'arrow', icon: ArrowRight }
  ] as const;

  if (!ticketData) {
    return <div className="fixed inset-0 bg-white flex items-center justify-center">Loading meeting...</div>;
  }

  const isTeacher = userRole === 'teacher';
  const localParticipant = participants.find(p => p.isLocal);

  const currentMainViewStream = viewMode === 'screen' 
        ? screenStreamRef.current 
        : mainViewParticipant?.stream;

  const meetingCode = ticketData?.ticketCode;

  return (
    <div className="fixed inset-0 bg-white text-slate-800 flex flex-col z-50 p-4 gap-4 font-sans">
      <header className="flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">SyllabiQ Meeting</h1>
             {meetingCode && (
                 <div className="hidden md:flex items-center gap-2">
                    <TooltipProvider>
                       <Tooltip>
                           <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(meetingCode); toast({ title: "Copied!", description: "Meeting code copied to clipboard."})}}>
                                <span className="font-mono text-slate-600">{meetingCode}</span>
                                <Copy className="w-4 h-4 ml-2 text-slate-500"/>
                              </Button>
                           </TooltipTrigger>
                           <TooltipContent><p>Copy Code</p></TooltipContent>
                       </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
        <div className="flex items-center gap-4">
            {localParticipant && <MicIndicator stream={localStreamRef.current} isMuted={!localParticipant.micOn} />}
            <Button variant="outline" size="icon" className="rounded-full h-11 w-11" onClick={() => setShowParticipants(!showParticipants)}>
              <Users className="w-5 h-5"/>
            </Button>
        </div>
      </header>
     
      <div className="flex-1 flex gap-4 min-h-0">
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-grow bg-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner">
              <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                >
                  {viewMode === 'whiteboard' ? (
                      <Whiteboard 
                        ref={whiteboardRef} 
                        isActive={true} 
                        tool={wbTool}
                        shape={wbShape}
                        color={wbColor} 
                        size={wbSize}
                        onStroke={handleStroke}
                        initialStrokes={processedStrokes}
                        clearStrokesSignal={clearStrokesSignal}
                      />
                  ) : mainViewParticipant ? (
                    <div className="w-full h-full">
                      <ParticipantVideo 
                          stream={currentMainViewStream}
                          cameraOn={mainViewParticipant.cameraOn}
                          micOn={mainViewParticipant.micOn}
                          name={mainViewParticipant.name}
                          isLocal={mainViewParticipant.isLocal}
                          isMainView={true}
                      />
                    </div>
                  ): (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                          <p className="text-slate-500">Select a participant to view</p>
                       </div>
                  )}
                </motion.div>
              </AnimatePresence>
              
              {!hasPermission && viewMode === 'camera' && !isCameraOff &&(
                   <Alert variant="destructive" className="max-w-md absolute bg-white/80 backdrop-blur-md">
                      <VideoOff className="h-4 w-4"/>
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                          Please allow camera and microphone access to use this feature.
                      </AlertDescription>
                  </Alert>
              )}
          </div>
        </main>
        
        <AnimatePresence>
          {showParticipants && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-gray-50/80 backdrop-blur-xl rounded-2xl p-4 flex flex-col gap-4 border border-gray-200/60"
            >
              <div className="flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-slate-800">Participants ({participants.length})</h3>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowParticipants(false)}><Grip className="w-4 h-4" /></Button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                <AnimatePresence>
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
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

       <footer className="flex-shrink-0 flex justify-between items-center mt-2">
         <div className="flex items-center gap-2">
            {viewMode === 'whiteboard' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md border border-gray-200/50"
              >
                  <TooltipProvider>
                  <Tooltip><TooltipTrigger asChild>
                    <Button variant={wbTool === 'pen' ? "secondary" : "outline"} size="icon" className="rounded-full w-11 h-11" onClick={() => handleWbToolChange('pen')}> <Pencil className="w-5 h-5"/> </Button>
                  </TooltipTrigger><TooltipContent><p>Pen</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild>
                    <Button variant={wbTool === 'eraser' ? "secondary" : "outline"} size="icon" className="rounded-full w-11 h-11" onClick={() => handleWbToolChange('eraser')}> <Eraser className="w-5 h-5"/> </Button>
                  </TooltipTrigger><TooltipContent><p>Eraser</p></TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild>
                     <Button variant={wbTool === 'text' ? "secondary" : "outline"} size="icon" className="rounded-full w-11 h-11" onClick={() => handleWbToolChange('text')}> <MousePointer2 className="w-5 h-5"/> </Button>
                  </TooltipTrigger><TooltipContent><p>Text</p></TooltipContent></Tooltip>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                       <Button variant={wbTool === 'shape' ? "secondary" : "outline"} size="icon" className="rounded-full w-11 h-11"><Square className="w-5 h-5"/></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side="top">
                        <div className="flex gap-1">
                            {shapes.map(({type, icon: Icon}) => (
                              <Tooltip key={type}>
                                <TooltipTrigger asChild>
                                  <Button variant={wbShape === type ? 'secondary' : 'ghost'} size="icon" onClick={() => handleShapeSelect(type)}>
                                    <Icon className="w-5 h-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{type.charAt(0).toUpperCase() + type.slice(1)}</p></TooltipContent>
                              </Tooltip>
                            ))}
                        </div>
                    </PopoverContent>
                  </Popover>

                  <div className="h-6 w-px bg-gray-300 mx-1"></div>

                  <Popover>
                    <PopoverTrigger asChild>
                       <Button variant="outline" size="icon" className="rounded-full w-11 h-11"><Palette className="w-5 h-5"/></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" side="top">
                        <div className="flex gap-1">
                            {colors.map(c => <button key={c} onClick={() => setWbColor(c)} className="w-7 h-7 rounded-full transition-transform hover:scale-110" style={{ backgroundColor: c, border: wbColor === c ? '2px solid #64748b' : '2px solid transparent' }}/>)}
                        </div>
                    </PopoverContent>
                  </Popover>

                   <Popover>
                      <PopoverTrigger asChild>
                         <Button variant="outline" size="icon" className="rounded-full w-11 h-11 relative">
                            <div className="absolute w-full h-full flex items-center justify-center">
                                <div className="rounded-full bg-slate-700" style={{width: wbSize, height: wbSize}}></div>
                            </div>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" side="top">
                           <Slider value={[wbSize]} onValueChange={(v) => setWbSize(v[0])} min={2} max={20} step={1} />
                      </PopoverContent>
                  </Popover>

                  <div className="h-6 w-px bg-gray-300 mx-2"></div>

                   <Tooltip><TooltipTrigger asChild>
                      <Button variant="destructive" size="icon" className="rounded-full w-11 h-11" onClick={handleClearWhiteboard}> <Trash2 className="w-5 h-5"/> </Button>
                   </TooltipTrigger><TooltipContent><p>Clear Whiteboard</p></TooltipContent></Tooltip>
                  </TooltipProvider>
              </motion.div>
            )}
         </div>
         <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md border border-gray-200/50">
            <TooltipProvider>
                {localParticipant && (
                  <>
                     <Tooltip><TooltipTrigger asChild>
                        <Button 
                            variant="secondary"
                            size="icon" 
                            className={cn("rounded-full h-12 w-12 transition-all", !localParticipant.micOn && "bg-red-100 text-red-600 hover:bg-red-200")}
                            onClick={handleToggleMic}
                        >
                            {!localParticipant.micOn ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>
                     </TooltipTrigger><TooltipContent><p>{!localParticipant.micOn ? "Unmute" : "Mute"}</p></TooltipContent></Tooltip>

                     <Tooltip><TooltipTrigger asChild>
                         <Button 
                            variant="secondary"
                            size="icon"
                            className={cn("rounded-full h-12 w-12 transition-all", !localParticipant.cameraOn && "bg-red-100 text-red-600 hover:bg-red-200")}
                            onClick={handleToggleCamera}
                         >
                             {!localParticipant.cameraOn ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                         </Button>
                      </TooltipTrigger><TooltipContent><p>{!localParticipant.cameraOn ? "Start Camera" : "Stop Camera"}</p></TooltipContent></Tooltip>
                  </>
                )}

                 
                  <>
                     <div className="h-8 w-px bg-gray-300 mx-1"></div>
                      <Tooltip><TooltipTrigger asChild>
                        <Button 
                          variant="secondary"
                          size="icon" 
                          className={cn("rounded-full h-12 w-12 transition-all", viewMode === 'screen' && "bg-blue-100 text-blue-600 hover:bg-blue-200")}
                          onClick={handleToggleScreenShare}
                          disabled={!isTeacher}
                        >
                          <Monitor className="w-6 h-6"/>
                        </Button>
                      </TooltipTrigger><TooltipContent><p>{viewMode === 'screen' ? "Stop Sharing" : "Share Screen"}</p></TooltipContent></Tooltip>

                      <Tooltip><TooltipTrigger asChild>
                         <Button 
                          variant="secondary"
                          size="icon" 
                          className={cn("rounded-full h-12 w-12 transition-all", viewMode === 'whiteboard' && "bg-green-100 text-green-600 hover:bg-green-200")}
                          onClick={() => setViewMode(viewMode === 'whiteboard' ? 'camera' : 'whiteboard')}
                        >
                          <Pencil className="w-6 h-6"/>
                        </Button>
                      </TooltipTrigger><TooltipContent><p>{viewMode === 'whiteboard' ? "Exit Whiteboard" : "Open Whiteboard"}</p></TooltipContent></Tooltip>
                  </>
                

                <div className="h-8 w-px bg-gray-300 mx-1"></div>
                
                 <Tooltip><TooltipTrigger asChild>
                   <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={handleLeave}>
                        <PhoneOff className="w-6 h-6"/>
                    </Button>
                </TooltipTrigger><TooltipContent><p>Leave Meeting</p></TooltipContent></Tooltip>
            </TooltipProvider>
        </div>
        <div className="w-48 hidden md:block"></div>
      </footer>
    </div>
  );
}
