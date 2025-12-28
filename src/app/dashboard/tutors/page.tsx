
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
import { useUser, useFirebase } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// Mock data for available tutors
const tutors = [
  {
    id: "tutor-1",
    name: "Dr. Evelyn Reed",
    avatar: "https://picsum.photos/seed/tutor-evelyn/100",
    subjects: ["Calculus", "Physics", "Linear Algebra"],
    rating: 4.9,
    reviews: 128,
    costPerHour: 60,
    availability: [
      { day: "Mon", time: "10:00 - 11:00" },
      { day: "Wed", time: "14:00 - 15:00" },
      { day: "Fri", time: "09:00 - 10:00" },
    ],
  },
  {
    id: "tutor-2",
    name: "John Smith",
    avatar: "https://picsum.photos/seed/tutor-john/100",
    subjects: ["Python", "Data Science", "Machine Learning"],
    rating: 4.8,
    reviews: 95,
    costPerHour: 75,
    availability: [
      { day: "Tue", time: "15:00 - 16:00" },
      { day: "Thu", time: "11:00 - 12:00" },
    ],
  },
  {
    id: "tutor-3",
    name: "Prof. Eleanor Vance",
    avatar: "https://picsum.photos/seed/tutor-eleanor/100",
    subjects: ["World History", "Civics", "Sociology"],
    rating: 5.0,
    reviews: 210,
    costPerHour: 55,
    availability: [
      { day: "Mon", time: "11:00 - 12:00" },
      { day: "Tue", time: "14:00 - 15:00" },
      { day: "Wed", time: "16:00 - 17:00" },
      { day: "Fri", time: "14:00 - 15:00" },
    ],
  },
];

export default function TutorsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const handleBookSession = async (tutor: (typeof tutors)[0], slot: { day: string, time: string }) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: "Error", description: "You must be logged in to book a session." });
      return;
    }

    // This is placeholder logic. In a real app, this would involve a payment flow.
    const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      await addDoc(collection(firestore, 'tickets'), {
        ticketCode,
        studentId: user.uid,
        teacherId: tutor.id, // In a real app, this ID would come from the teacher's profile in Firestore
        status: 'PAID',
        price: tutor.costPerHour,
        duration: 60, // minutes
        commissionPercent: 10,
        createdAt: serverTimestamp(),
        slot,
        studentName: user.displayName, // Denormalized for easier display
        teacherName: tutor.name, // Denormalized for easier display
      });

      toast({
        title: "Ticket Purchased!",
        description: `Your session with ${tutor.name} is booked. Your code is ${ticketCode}.`,
      });

      // Redirect to the bookings page to see the new ticket
      router.push('/dashboard/bookings');

    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({ variant: 'destructive', title: "Booking Failed", description: "Could not create your ticket. Please try again." });
    }
  };

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Find a Tutor</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Book a live one-on-one session by purchasing a lecture ticket.
        </p>
      </ScrollReveal>

      <div className="space-y-6">
        {tutors.map((tutor, index) => (
          <ScrollReveal key={tutor.id} delay={index * 0.1}>
            <Card className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl">
              <CardHeader className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                    <AvatarImage src={tutor.avatar} alt={tutor.name} />
                    <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{tutor.name}</CardTitle>
                  <div className="flex items-center gap-1 mt-1 text-yellow-500">
                    <p className="font-bold">{tutor.rating}</p>
                    <span>&#9733;</span>
                    <p className="text-muted-foreground text-sm">({tutor.reviews} reviews)</p>
                  </div>
                   <p className="text-2xl font-bold text-primary mt-4">${tutor.costPerHour}<span className="text-base font-normal text-muted-foreground">/hour</span></p>
                </div>

                <div>
                    <CardDescription className="mb-4">Specializes in:</CardDescription>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {tutor.subjects.map(subject => (
                            <Badge key={subject} variant="secondary">{subject}</Badge>
                        ))}
                    </div>

                     <CardDescription className="mb-3">Available Slots for this week:</CardDescription>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {tutor.availability.map(slot => (
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
                                  Purchase a ticket for a 1-hour session with {tutor.name} on {slot.day} at {slot.time} for ${tutor.costPerHour}?
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
                         {tutor.availability.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No slots available this week.</p>}
                     </div>
                </div>
              </CardHeader>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}