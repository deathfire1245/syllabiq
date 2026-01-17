
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, CalendarX2, Ticket, Clock, AlertTriangle, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useUser, useFirebase, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp, runTransaction, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNowStrict } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface Ticket {
  id: string;
  ticketCode: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  slot: { day: string; time: string };
  status: 'PAID' | 'WAITING_FOR_TEACHER' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REFUND_PROCESSED';
  createdAt: any;
  activatedAt?: any;
  waitingSince?: any;
  used: boolean;
  validFrom: any;
  sessionStartTime: any;
}

const Countdown = ({ targetDate, onTimeout }: { targetDate: Date, onTimeout: () => void }) => {
  const calculateTimeLeft = React.useCallback(() => {
    const difference = +targetDate - +new Date();
    let timeLeft: {[key: string]: number} = {};

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      onTimeout();
    }
    return timeLeft;
  }, [targetDate, onTimeout]);

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex gap-4">
      {Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="text-center">
          <div className="text-3xl font-bold text-primary">{String(value).padStart(2, '0')}</div>
          <div className="text-xs text-muted-foreground uppercase">{interval}</div>
        </div>
      ))}
    </div>
  );
};

const joinMeetingAndCheckIn = (firestore: any, ticketId: string): Promise<boolean> => {
    const ticketRef = doc(firestore, 'tickets', ticketId);
    
    const updateData = { 
        used: true,
        checkInTime: serverTimestamp(),
        status: 'WAITING_FOR_TEACHER',
        waitingSince: serverTimestamp(),
        updatedAt: serverTimestamp() 
    };

    return runTransaction(firestore, async (transaction) => {
        const ticketDoc = await transaction.get(ticketRef);
        if (!ticketDoc.exists()) {
            throw "Ticket does not exist!";
        }

        const ticketData = ticketDoc.data();
        if (ticketData.used) {
            console.log("Ticket already used, proceeding to waiting room.");
            return; 
        }

        transaction.update(ticketRef, updateData);
    }).then(() => {
        console.log("Transaction successfully committed!");
        return true;
    }).catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: ticketRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        return false;
    });
}

const JoinButton = ({ validFrom, onJoin, isJoining }: { validFrom: any, onJoin: () => void, isJoining: boolean }) => {
    const { toast } = useToast();
    const [canJoin, setCanJoin] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState("");
    const joinTime = validFrom.toDate();

    React.useEffect(() => {
        const checkTime = () => {
            const now = new Date();
            const difference = joinTime.getTime() - now.getTime();
            if (difference <= 0) {
                setCanJoin(true);
                setTimeLeft("");
                if (timer) clearInterval(timer);
            } else {
                setCanJoin(false);
                setTimeLeft(formatDistanceToNowStrict(joinTime, { addSuffix: false }));
            }
        };

        const timer = setInterval(checkTime, 1000);
        checkTime(); // Initial check

        return () => clearInterval(timer);
    }, [joinTime]);

    const handleClick = () => {
        if (canJoin) {
            onJoin();
        } else {
            toast({
                title: "It's not time yet!",
                description: `You can join the meeting 10 minutes before the start time.`,
            });
        }
    };

    const getButtonText = () => {
        if (isJoining) return "Entering...";
        if (canJoin) return "Enter Waiting Room";
        return `Join in ${timeLeft}`;
    };

    return (
        <Button className="w-full" disabled={!canJoin || isJoining} onClick={handleClick}>
            <Video className="mr-2 h-4 w-4" />
            {getButtonText()}
        </Button>
    );
};


const StudentTicketCard = ({ ticket }: { ticket: Ticket }) => {
    const { firestore } = useFirebase();
    const [isJoining, setIsJoining] = React.useState(false);

    const handleEnterWaitingRoom = () => {
        if(!firestore) return;
        setIsJoining(true);
        
        joinMeetingAndCheckIn(firestore, ticket.id)
          .then(success => {
            if (!success) {
                setIsJoining(false);
            }
        });
    }

    return (
         <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-secondary/30 p-4">
                <Avatar className="w-16 h-16">
                    <AvatarImage src={`https://picsum.photos/seed/${ticket.teacherName}/100`} alt={ticket.teacherName} />
                    <AvatarFallback>{ticket.teacherName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>Session with {ticket.teacherName}</CardTitle>
                    <CardDescription>{format(ticket.sessionStartTime.toDate(), "EEE, MMM d 'at' h:mm a")}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">TICKET CODE</h3>
                <p className="text-2xl font-bold font-mono tracking-widest text-primary">{ticket.ticketCode}</p>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/50">
                <JoinButton validFrom={ticket.validFrom} onJoin={handleEnterWaitingRoom} isJoining={isJoining} />
            </CardFooter>
        </Card>
    )
}

const PastSessionCard = ({ ticket }: { ticket: Ticket }) => {
    const getStatusBadge = () => {
        switch (ticket.status) {
            case 'COMPLETED':
                return <Badge variant="secondary">Completed</Badge>;
            case 'CANCELLED':
                return <Badge variant="destructive">Refund Pending</Badge>;
            case 'REFUND_PROCESSED':
                return <Badge variant="outline">Refunded</Badge>;
            default:
                return null;
        }
    };

    return (
        <Card className="overflow-hidden bg-secondary/30">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://picsum.photos/seed/${ticket.teacherName}/100`} alt={ticket.teacherName} />
                    <AvatarFallback>{ticket.teacherName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">Session with {ticket.teacherName}</p>
                    <p className="text-sm text-muted-foreground">{format(ticket.sessionStartTime.toDate(), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
            </CardHeader>
            <CardFooter className="p-4 bg-secondary/50 flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-mono">{ticket.ticketCode}</p>
                {getStatusBadge()}
            </CardFooter>
        </Card>
    );
}

const WaitingRoomView = ({ ticket }: { ticket: Ticket }) => {
    const waitingUntil = new Date(ticket.waitingSince.toDate().getTime() + 10 * 60 * 1000);
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const handleTimeout = () => {
        if (!firestore) return;
        const ticketRef = doc(firestore, 'tickets', ticket.id);
        const updateData = { status: 'CANCELLED', cancelReason: 'TEACHER_NO_SHOW', updatedAt: serverTimestamp() };

        updateDoc(ticketRef, updateData)
            .then(() => {
                 toast({
                    variant: "destructive",
                    title: "Session Cancelled",
                    description: "The teacher did not join in time. Your ticket is now waiting for refund.",
                });
            })
            .catch(error => {
                console.log("Student cannot update ticket, ignoring Firestore write.");
            });
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <ScrollReveal>
                <Card className="max-w-md w-full text-center shadow-2xl">
                    <CardHeader>
                        <Clock className="w-16 h-16 mx-auto text-primary mb-4"/>
                        <CardTitle className="text-2xl">Waiting for Teacher...</CardTitle>
                        <CardDescription>
                            Your teacher, {ticket.teacherName}, has been notified. The session will start automatically when they join.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">This waiting room will expire in:</p>
                        <div className="flex justify-center">
                           <Countdown targetDate={waitingUntil} onTimeout={handleTimeout} />
                        </div>
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    )
}

const TeacherBookingsView = ({ tickets }: { tickets: Ticket[] | null}) => {
    const upcomingSessions = React.useMemo(() => tickets?.filter(t => ['PAID', 'WAITING_FOR_TEACHER'].includes(t.status))
        .sort((a, b) => (a.sessionStartTime?.toDate() || 0) - (b.sessionStartTime?.toDate() || 0)) || [], [tickets]);
    
    const pastSessions = React.useMemo(() => tickets?.filter(t => ['COMPLETED', 'CANCELLED', 'REFUND_PROCESSED'].includes(t.status))
        .sort((a, b) => (b.sessionStartTime?.toDate() || 0) - (a.sessionStartTime?.toDate() || 0)) || [], [tickets]);

    if (!tickets || tickets.length === 0) {
        return (
             <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">No Bookings</h2>
                <p className="text-muted-foreground mt-2">
                    You have no sessions booked by students yet.
                </p>
            </ScrollReveal>
        )
    }

     return (
        <div className="space-y-8">
            <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Bookings</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Manage your scheduled sessions with students.
                </p>
            </ScrollReveal>
             <Card>
                <CardHeader>
                    <CardTitle>Upcoming & Waiting Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {upcomingSessions.length > 0 ? upcomingSessions.map(ticket => (
                            <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/50">
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarImage src={`https://picsum.photos/seed/${ticket.studentName}/100`} />
                                        <AvatarFallback>{ticket.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{ticket.studentName}</p>
                                        <p className="text-sm text-muted-foreground">{format(ticket.sessionStartTime.toDate(), "EEE, MMM d 'at' h:mm a")}</p>
                                    </div>
                                </div>
                                {ticket.status === 'WAITING_FOR_TEACHER' ? (
                                    <Button size="sm" asChild className="animate-pulse">
                                        <Link href={`/dashboard/meeting/${ticket.id}`}>Join Now</Link>
                                    </Button>
                                ) : (
                                    <Badge variant="outline">Scheduled</Badge>
                                )}
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-4">No upcoming sessions.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {pastSessions.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Session History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pastSessions.map(ticket => (
                                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/30">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://picsum.photos/seed/${ticket.studentName}/100`} />
                                            <AvatarFallback>{ticket.studentName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{ticket.studentName}</p>
                                            <p className="text-sm text-muted-foreground">{format(ticket.sessionStartTime.toDate(), "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <Badge variant={ticket.status === 'COMPLETED' ? 'secondary' : 'destructive'}>{ticket.status.replace(/_/g, ' ')}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

const StudentBookingsView = ({ tickets }: { tickets: Ticket[] | null }) => {
    const router = useRouter();

    const upcomingTickets = React.useMemo(() => tickets?.filter(t => t.status === 'PAID') || [], [tickets]);
    const waitingTicket = React.useMemo(() => tickets?.find(t => t.status === 'WAITING_FOR_TEACHER'), [tickets]);
    const activeTicket = React.useMemo(() => tickets?.find(t => t.status === 'ACTIVE'), [tickets]);
    const pastTickets = React.useMemo(() => tickets?.filter(t => ['COMPLETED', 'CANCELLED', 'REFUND_PROCESSED'].includes(t.status))
        .sort((a, b) => (b.sessionStartTime?.toDate() || 0) - (a.sessionStartTime?.toDate() || 0)) || [], [tickets]);

    React.useEffect(() => {
        if (activeTicket) {
             router.push(`/dashboard/meeting/${activeTicket.id}`);
        }
    }, [activeTicket, router]);

    if (waitingTicket) return <WaitingRoomView ticket={waitingTicket} />;

    if (!tickets || tickets.length === 0) {
        return (
            <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">No Bookings Yet</h2>
                <p className="text-muted-foreground mt-2">
                    You haven't purchased any tickets yet. Find a tutor to get started!
                </p>
                <Button asChild className="mt-6">
                  <Link href="/dashboard/tutors">Find a Tutor</Link>
                </Button>
            </ScrollReveal>
        );
    }

    return (
        <div className="space-y-12">
            <div>
                <ScrollReveal>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Upcoming Sessions</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Here are your purchased tickets. Enter the waiting room to start your session.
                    </p>
                </ScrollReveal>

                {upcomingTickets.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                        {upcomingTickets.map((ticket, index) => (
                            <ScrollReveal key={ticket.id} delay={index * 0.1}>
                                <StudentTicketCard ticket={ticket} />
                            </ScrollReveal>
                        ))}
                    </div>
                ) : (
                     <Card className="mt-6">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            You have no upcoming sessions.
                        </CardContent>
                    </Card>
                )}
            </div>

            {pastTickets.length > 0 && (
                <div>
                     <ScrollReveal>
                        <h2 className="text-2xl font-bold tracking-tight">Past Sessions</h2>
                        <p className="text-muted-foreground mt-1">A history of your completed or cancelled sessions.</p>
                    </ScrollReveal>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                         {pastTickets.map((ticket, index) => (
                            <ScrollReveal key={ticket.id} delay={index * 0.1}>
                                <PastSessionCard ticket={ticket} />
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MyBookingsPage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);
    }, []);

    const ticketsQuery = useMemoFirebase(() => {
        if (!user || !firestore || !userRole) return null;
        
        const filterField = userRole === 'student' ? 'studentId' : 'teacherId';
        return query(collection(firestore, "tickets"), where(filterField, "==", user.uid));

    }, [user, firestore, userRole]);
    
    const { data: tickets, isLoading: areTicketsLoading } = useCollection<Ticket>(ticketsQuery);

    if (areTicketsLoading || isUserLoading || !userRole) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/3" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    
    return userRole === 'teacher' 
        ? <TeacherBookingsView tickets={tickets} />
        : <StudentBookingsView tickets={tickets} />;
}
