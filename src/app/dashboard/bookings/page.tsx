
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Video, CalendarX2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  slot: { day: string; time: string };
  cost: number;
  bookedAt: string;
}

const dayToNumber: { [key: string]: number } = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };

function getSessionDates(day: string, time: string): { start: Date, end: Date } {
  const now = new Date();
  const targetDay = dayToNumber[day];
  const [startTimeStr] = time.split(" - ");
  const [hour, minute] = startTimeStr.split(":").map(Number);

  let startDate = new Date();
  const currentDay = now.getDay();
  let dayDifference = targetDay - currentDay;

  // If the day is in the past for this week, schedule it for next week.
  if (dayDifference < 0) {
      dayDifference += 7;
  }
  // If the day is today but the time has passed, schedule it for next week.
  else if (dayDifference === 0 && (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute))) {
      dayDifference = 7;
  }

  startDate.setDate(now.getDate() + dayDifference);
  startDate.setHours(hour, minute, 0, 0);

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1-hour session

  return { start: startDate, end: endDate };
}


const Countdown = ({ targetDate }: { targetDate: Date }) => {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft: {[key: string]: number} = {};

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
     if (value === 0 && interval !== 'seconds' && !timeLeft.days && !timeLeft.hours && !timeLeft.minutes) return null;
     if (value === 0 && interval !== 'seconds' && !timeLeft.days && !timeLeft.hours) return null;
     if (value === 0 && interval !== 'seconds' && !timeLeft.days) return null;
     if (value === 0 && interval === 'days') return null;

    return (
      <div key={interval} className="text-center">
        <div className="text-3xl font-bold text-primary">{String(value).padStart(2, '0')}</div>
        <div className="text-xs text-muted-foreground uppercase">{interval}</div>
      </div>
    );
  }).filter(Boolean);

  return timerComponents.length ? <div className="flex gap-4">{timerComponents}</div> : <span className="text-primary font-semibold">Session is active!</span>;
};

const SessionCard = ({ booking }: { booking: Booking }) => {
    const router = useRouter();
    const [sessionDates, setSessionDates] = React.useState<{ start: Date, end: Date } | null>(null);
    const [isSessionActive, setIsSessionActive] = React.useState(false);

    React.useEffect(() => {
        const { start, end } = getSessionDates(booking.slot.day, booking.slot.time);
        setSessionDates({ start, end });
    }, [booking.slot.day, booking.slot.time]);

    React.useEffect(() => {
        if (!sessionDates) return;

        const checkSessionStatus = () => {
            const now = new Date();
            setIsSessionActive(now >= sessionDates.start && now < sessionDates.end);
        };
        checkSessionStatus();
        const interval = setInterval(checkSessionStatus, 1000);
        return () => clearInterval(interval);
    }, [sessionDates]);

    const handleJoinMeeting = () => {
      if(isSessionActive) {
        router.push(`/dashboard/meeting/${booking.id}`);
      }
    }

    if (!sessionDates) return null;

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
                  <Countdown targetDate={sessionDates.start} />
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-secondary/30">
                <Button className="w-full" disabled={!isSessionActive} onClick={handleJoinMeeting}>
                    <Video className="mr-2 h-4 w-4" />
                    {isSessionActive ? "Jump Into Meeting" : "Meeting not started"}
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
            <ScrollReveal key={booking.id} delay={index * 0.1}>
              <SessionCard booking={booking} />
            </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
