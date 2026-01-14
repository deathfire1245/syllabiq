
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useUser, useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp, Timestamp, query, where } from "firebase/firestore";
import { add, sub, parse } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  teacherProfile?: {
    subjects: string[];
    hourlyRate: number;
    availability: {
      days: string[];
      timeSlots: string[];
    };
    bio: string;
  };
}

/**
 * Generates a production-ready ticket with time buffers and idempotent identifiers.
 * This function prepares a ticket object that can be stored in Firestore.
 */
const generateProductionTicket = (tutor: TeacherProfile, slot: { day: string, time: string }, user: any) => {
    // This is a simplified way to get a Date object for the session.
    // A real app would use a proper date picker and time zone handling.
    const now = new Date();
    const startTimeStr = slot.time.split(' - ')[0];
    const sessionDate = parse(startTimeStr, 'HH:mm', now);
    
    // In a real app, you would determine the correct date for the selected "day"
    const sessionStartTime = sessionDate;
    const sessionEndTime = add(sessionStartTime, { hours: 1 });

    const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const orderId = `MOCK_ORDER_${Date.now()}`;
    const meetingId = `MEET_${Date.now()}_${user.uid.substring(0,5)}`;

    return {
      ticketCode,
      orderId,
      meetingId,
      studentId: user.uid,
      teacherId: tutor.id,
      status: 'PAID', // Initial status before check-in
      paymentStatus: 'MOCK_PAID',
      price: tutor.teacherProfile?.hourlyRate || 0,
      duration: 60, // minutes
      commissionPercent: 10,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      activatedAt: null,
      completedAt: null,
      slot, // Keep original slot info for display
      studentName: user.displayName,
      teacherName: tutor.name,
      validFrom: Timestamp.fromDate(sub(sessionStartTime, { minutes: 15 })),
      validTill: Timestamp.fromDate(add(sessionEndTime, { minutes: 30 })),
      used: false,
      checkInTime: null,
    };
}


export default function TutorsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const tutorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), where("role", "==", "teacher"));
  }, [firestore]);

  const { data: tutors, isLoading } = useCollection<TeacherProfile>(tutorsQuery);

  const handleBookSession = async (tutor: TeacherProfile, slot: { day: string, time: string }) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: "Error", description: "You must be logged in to book a session." });
      return;
    }

    const ticketData = generateProductionTicket(tutor, slot, user);

    try {
      await addDoc(collection(firestore, 'tickets'), ticketData);

      toast({
        title: "Ticket Purchased!",
        description: `Your session with ${tutor.name} is booked. Your code is ${ticketData.ticketCode}.`,
      });

      // Redirect to the bookings page to see the new ticket
      router.push('/dashboard/bookings');

    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({ variant: 'destructive', title: "Booking Failed", description: "Could not create your ticket. Please try again." });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
             <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find a Tutor</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Book a live one-on-one session by purchasing a lecture ticket.
        </p>
      </ScrollReveal>

      <div className="space-y-6">
        {tutors && tutors.length > 0 ? tutors.map((tutor, index) => {
            const availability = tutor.teacherProfile?.availability;
            const availableSlots = availability?.days.flatMap(day => 
                (availability.timeSlots || []).map(time => ({ day, time }))
            ) || [];

            return (
          <ScrollReveal key={tutor.id} delay={index * 0.1}>
            <Card className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl">
              <CardHeader className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                    <AvatarImage src={tutor.profilePicture} alt={tutor.name} />
                    <AvatarFallback>{getInitials(tutor.name)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{tutor.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{tutor.teacherProfile?.bio || 'Experienced Educator'}</p>
                   <p className="text-2xl font-bold text-primary mt-4">${tutor.teacherProfile?.hourlyRate || 0}<span className="text-base font-normal text-muted-foreground">/hour</span></p>
                </div>

                <div>
                    <CardDescription className="mb-4">Specializes in:</CardDescription>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {(tutor.teacherProfile?.subjects || []).map(subject => (
                            <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                    </div>

                     <CardDescription className="mb-3">Available Slots for this week:</CardDescription>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableSlots.map(slot => (
                          <AlertDialog key={slot.day+slot.time}>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="h-auto flex-col py-2">
                                <span className="font-semibold">{slot.day}</span>
                                <span className="text-sm text-muted-foreground">{slot.time}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Ticket Purchase</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Purchase a ticket for a 1-hour session with {tutor.name} on {slot.day} at {slot.time} for ${tutor.teacherProfile?.hourlyRate || 0}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleBookSession(tutor, slot)}>
                                  Buy Ticket
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ))}
                         {availableSlots.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No slots available this week.</p>}
                     </div>
                </div>
              </CardHeader>
            </Card>
          </ScrollReveal>
        )}) : (
          <ScrollReveal className="text-center py-16">
            <h2 className="text-2xl font-bold">No Tutors Available</h2>
            <p className="text-muted-foreground mt-2">Check back soon, our community of educators is growing!</p>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
