
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, CalendarX2, Ticket, Clock, AlertTriangle, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useUser, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

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

const StudentTicketCard = ({ ticket }: { ticket: Ticket }) => {
    const router = useRouter();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [isWaiting, setIsWaiting] = React.useState(false);

    const handleEnterWaitingRoom = async () => {
        if(!firestore) return;
        setIsWaiting(true);
        const ticketRef = doc(firestore, 'tickets', ticket.id);
        try {
            await updateDoc(ticketRef, { 
                status: 'WAITING_FOR_TEACHER',
                waitingSince: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            // The listener on the page will handle showing the waiting room UI
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not enter waiting room." });
            setIsWaiting(false);
        }
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
                    <CardDescription>{ticket.slot.day} at {ticket.slot.time}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">TICKET CODE</h3>
                <p className="text-2xl font-bold font-mono tracking-widest text-primary">{ticket.ticketCode}</p>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30">
                <Button className="w-full" disabled={isWaiting} onClick={handleEnterWaitingRoom}>
                    <Video className="mr-2 h-4 w-4" />
                    {isWaiting ? "Entering..." : "Enter Waiting Room"}
                </Button>
            </CardFooter>
        </Card>
    )
}

const WaitingRoomView = ({ ticket }: { ticket: Ticket }) => {
    const waitingUntil = new Date(ticket.waitingSince.toDate().getTime() + 10 * 60 * 1000);
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const handleTimeout = async () => {
        if (!firestore) return;
        const ticketRef = doc(firestore, 'tickets', ticket.id);
        await updateDoc(ticketRef, { status: 'CANCELLED', updatedAt: serverTimestamp() });
        toast({
            variant: "destructive",
            title: "Session Cancelled",
            description: "The teacher did not join in time. Your ticket is eligible for a refund.",
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

const CancelledSessionView = ({ onBack }: { onBack: () => void }) => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
        <ScrollReveal>
            <Card className="max-w-md w-full text-center shadow-2xl">
                 <CardHeader>
                    <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4"/>
                    <CardTitle className="text-2xl">Session Cancelled</CardTitle>
                    <CardDescription>
                        The teacher did not join the session in time. Your ticket is now marked for a refund.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className="w-full" onClick={onBack}>Back to Bookings</Button>
                </CardFooter>
            </Card>
        </ScrollReveal>
    </div>
)

const TeacherBookingsView = ({ tickets }: { tickets: Ticket[] | null}) => {
    if (!tickets || tickets.length === 0) {
        return (
             <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">No Upcoming Bookings</h2>
                <p className="text-muted-foreground mt-2">
                    You have no sessions booked by students yet.
                </p>
            </ScrollReveal>
        )
    }

    const upcomingSessions = tickets.filter(t => t.status === 'PAID' || t.status === 'WAITING_FOR_TEACHER');

     return (
        <div className="space-y-8">
            <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Bookings</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Here are your upcoming scheduled sessions with students.
                </p>
            </ScrollReveal>
             <Card>
                <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
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
                                        <p className="text-sm text-muted-foreground">{ticket.slot.day} @ {ticket.slot.time}</p>
                                    </div>
                                </div>
                                {ticket.status === 'WAITING_FOR_TEACHER' ? (
                                    <Button size="sm" asChild>
                                        <Link href={`/dashboard/meeting/${ticket.id}`}>Join Now</Link>
                                    </Button>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Scheduled</p>
                                )}
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-4">No upcoming sessions.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const StudentBookingsView = ({ tickets }: { tickets: Ticket[] | null }) => {
    const router = useRouter();
    const { firestore } = useFirebase();

    const paidTickets = React.useMemo(() => tickets?.filter(t => t.status === 'PAID') || [], [tickets]);
    const waitingTicket = React.useMemo(() => tickets?.find(t => t.status === 'WAITING_FOR_TEACHER'), [tickets]);
    const activeTicket = React.useMemo(() => tickets?.find(t => t.status === 'ACTIVE'), [tickets]);
    const cancelledTicket = React.useMemo(() => tickets?.find(t => t.status === 'CANCELLED'), [tickets]);

    React.useEffect(() => {
        if (activeTicket) {
             router.push(`/dashboard/meeting/${activeTicket.id}`);
        }
    }, [activeTicket, router]);

    const handleResetCancelled = async () => {
        if (!cancelledTicket || !firestore) return;
        const ticketRef = doc(firestore, 'tickets', cancelledTicket.id);
        await updateDoc(ticketRef, { status: 'REFUND_PROCESSED', updatedAt: serverTimestamp() });
    }
    
    if (waitingTicket) {
        return <WaitingRoomView ticket={waitingTicket} />
    }

    if (cancelledTicket) {
        return <CancelledSessionView onBack={handleResetCancelled} />
    }
    
  if (!tickets || paidTickets.length === 0) {
    return (
      <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">No Upcoming Bookings</h2>
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
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here are your purchased tickets. Enter the waiting room to start your session.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paidTickets.map((ticket, index) => (
            <ScrollReveal key={ticket.id} delay={index * 0.1}>
              <StudentTicketCard ticket={ticket} />
            </ScrollReveal>
        ))}
      </div>
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
