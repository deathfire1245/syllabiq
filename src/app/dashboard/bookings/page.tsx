"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, CalendarX2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Booking {
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  slot: { day: string; time: string };
  cost: number;
  bookedAt: string;
}

const dayToNumber: { [key: string]: number } = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };

function getNextSessionDate(day: string, time: string): Date {
  const now = new Date();
  const targetDay = dayToNumber[day];
  const [startTime] = time.split(" - ");
  const [hour, minute] = startTime.split(":").map(Number);
  
  let resultDate = new Date();
  resultDate.setDate(now.getDate() + ((targetDay + 7 - now.getDay()) % 7));
  resultDate.setHours(hour, minute, 0, 0);

  // If the time has already passed for today, get next week's day
  if (resultDate < now) {
    resultDate.setDate(resultDate.getDate() + 7);
  }

  return resultDate;
}

const Countdown = ({ targetDate }: { targetDate: Date }) => {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
     if (value === 0 && interval !== 'seconds' && timeLeft.days === 0) return null;
     if (value === 0 && interval === 'days') return null;

    return (
      <div key={interval} className="text-center">
        <div className="text-3xl font-bold text-primary">{String(value).padStart(2, '0')}</div>
        <div className="text-xs text-muted-foreground uppercase">{interval}</div>
      </div>
    );
  }).filter(Boolean);

  return timerComponents.length ? <div className="flex gap-4">{timerComponents}</div> : <span>Session Active!</span>;
};

const SessionCard = ({ booking }: { booking: Booking }) => {
    const { toast } = useToast();
    const sessionDate = getNextSessionDate(booking.slot.day, booking.slot.time);
    const sessionEndDate = new Date(sessionDate.getTime() + 60 * 60 * 1000); // 1 hour session
    const [isSessionActive, setIsSessionActive] = React.useState(false);

    React.useEffect(() => {
        const checkSessionStatus = () => {
            const now = new Date();
            setIsSessionActive(now >= sessionDate && now < sessionEndDate);
        };
        checkSessionStatus();
        const interval = setInterval(checkSessionStatus, 1000);
        return () => clearInterval(interval);
    }, [sessionDate, sessionEndDate]);

    const handleJoinMeeting = () => {
      // For this simulation, we just show a toast. In a real app, this would redirect to a video call.
      toast({
        title: "Joining Meeting...",
        description: `Connecting you with ${booking.tutorName}.`,
      });
    }

    return (
         <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-secondary/30 p-4">
                <Avatar className="w-16 h-16">
                    <AvatarImage src={booking.tutorAvatar} alt={booking.tutorName} />
                    <AvatarFallback>{booking.tutorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>Session with {booking.tutorName}</CardTitle>
                    <CardDescription>{booking.slot.day} at {booking.slot.time}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Session starts in:</h3>
                <div className="flex justify-center items-center">
                  <Countdown targetDate={sessionDate} />
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30">
                <Button className="w-full" disabled={!isSessionActive} onClick={handleJoinMeeting}>
                    <Video className="mr-2 h-4 w-4" />
                    {isSessionActive ? "Join Meeting" : "Meeting not started"}
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);

  React.useEffect(() => {
    const storedBookings = localStorage.getItem("userBookings");
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
  }, []);

  if (bookings.length === 0) {
    return (
      <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
        <CalendarX2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">No Upcoming Bookings</h2>
        <p className="text-muted-foreground mt-2">
          You haven't booked any sessions yet. Find a tutor to get started!
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
          Here are your upcoming one-on-one sessions.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <SessionCard booking={booking} />
            </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
