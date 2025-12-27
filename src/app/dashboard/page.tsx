
"use client";

import * as React from "react";
import {
  Clock,
  History,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import { getSubjects } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useInView, motion, animate } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const AnimatedCounter = ({ to, prefix = "", suffix = "" }: { to: number, prefix?: string, suffix?: string }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  React.useEffect(() => {
    if (isInView && ref.current) {
      const controls = animate(0, to, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = prefix + Math.round(value).toLocaleString() + suffix;
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to, prefix, suffix]);

  return <span ref={ref}>0</span>;
};


const iconMap: { [key: string]: React.ElementType } = {
  // Your existing icon map
};

const SubjectProgress = ({ subject, delay = 0 }: { subject: ReturnType<typeof getSubjects>[0], delay?: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [animatedProgress, setAnimatedProgress] = React.useState(0);
  const [initialProgress] = React.useState(Math.floor(Math.random() * 50) + 25);
  const Icon = iconMap[subject.icon] || TrendingUp;

  React.useEffect(() => {
    if (isInView) {
      const controls = animate(0, initialProgress, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate(value) {
          setAnimatedProgress(value);
        },
      });
      return () => controls.stop();
    }
  }, [isInView, initialProgress]);

  return (
     <ScrollReveal delay={delay}>
        <Card
        ref={ref}
        key={subject.id}
        className="group relative overflow-hidden transform transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/20"
        >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
        <Image
            src={subject.coverImage.src}
            alt={subject.name}
            width={600}
            height={400}
            className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={subject.coverImage.hint}
        />
        <CardHeader className="relative z-10 p-4 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
            {Icon && (
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Icon className="w-6 h-6" />
                </div>
            )}
            <div>
                <CardTitle className="text-lg font-bold">
                {subject.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{`${subject.topics.length} topics`}</p>
            </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <div className="space-y-2">
                {isInView ? (
                <>
                    <div className="flex justify-between items-center text-sm">
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-medium text-primary">{Math.round(animatedProgress)}%</p>
                    </div>
                    <Progress value={animatedProgress} className="h-2" />
                </>
                ) : (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                </div>
                )}
            </div>
        </CardContent>
        </Card>
    </ScrollReveal>
  );
};

interface Booking {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  slot: { day: string; time: string };
  cost: number;
  bookedAt: string;
}

const TeacherSessions = () => {
    const router = useRouter();
    const [bookings, setBookings] = React.useState<Booking[]>([]);

    React.useEffect(() => {
        const storedBookings = localStorage.getItem("userBookings");
        if (storedBookings) {
            setBookings(JSON.parse(storedBookings));
        }
    }, []);

    const handleJoinMeeting = (bookingId: string) => {
        router.push(`/dashboard/meeting/${bookingId}`);
    }

    if (bookings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You have no upcoming sessions booked by students.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Upcoming Sessions</CardTitle>
                <CardDescription>Students have booked these sessions with you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-4">
                             <Avatar>
                                <AvatarImage src="https://picsum.photos/seed/student-avatar/100" />
                                <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">Session with a Student</p>
                                <p className="text-sm text-muted-foreground">{booking.slot.day} at {booking.slot.time}</p>
                            </div>
                        </div>
                        <Button onClick={() => handleJoinMeeting(booking.id)}>
                            <Video className="mr-2 h-4 w-4" />
                            Jump Into Meeting
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}


export default function DashboardPage() {
  const subjects = getSubjects().slice(0, 3); // Placeholder for "Your Subjects"
  const recentTopics = getSubjects().flatMap(s => s.topics).slice(0,3);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const userStats = {
    topicsCompleted: 18,
    totalTopics: 50,
    studyHours: 42,
    quizzesTaken: 12,
    avgScore: 88,
  }

  const statCards = [
      {
          title: "Topics Completed",
          icon: TrendingUp,
          value: <><AnimatedCounter to={userStats.topicsCompleted} /> / {userStats.totalTopics}</>,
          footer: "+5 from last week",
      },
      {
          title: "Study Hours",
          icon: Clock,
          value: <AnimatedCounter to={userStats.studyHours} />,
          footer: "Total time spent learning",
      },
      {
          title: "Average Score",
          icon: Target,
          value: <AnimatedCounter to={userStats.avgScore} suffix="%" />,
          footer: <>Across <AnimatedCounter to={userStats.quizzesTaken} /> quizzes</>,
      }
  ]

  if (!userRole) {
      return <div>Loading...</div>
  }

  // Teacher Dashboard View
  if (userRole === "Teacher") {
    return (
        <div className="space-y-8">
            <ScrollReveal>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Teacher Dashboard</h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
                <Card className="bg-primary/10 border-primary">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Test the Meeting Interface</CardTitle>
                        <CardDescription>Click the button below to immediately join a test video call and see how the meeting room looks and feels.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button 
                            size="lg" 
                            onClick={() => router.push('/dashboard/meeting/test-meeting-123')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow transform hover:scale-105"
                        >
                            <Video className="mr-2 h-5 w-5" />
                            Jump Into a Test Meeting NOW
                        </Button>
                    </CardContent>
                </Card>
            </ScrollReveal>
            
             <ScrollReveal delay={0.2}>
               <TeacherSessions />
            </ScrollReveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You haven't created any courses yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/create/courses">Create a Course</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Set your schedule for live classes.</p>
                         <Button asChild className="mt-4">
                            <Link href="/dashboard/create/classes">Manage Schedule</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  // Student Dashboard View
  return (
    <div className="space-y-8">
      {/* Your Subjects Section */}
      <ScrollReveal>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Your Subjects</h2>
      </ScrollReveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, index) => (
            <SubjectProgress key={subject.id} subject={subject} delay={index * 0.1} />
        ))}
      </div>

      {/* User Stats Section */}
       <div>
        <ScrollReveal>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Your Progress</h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <ScrollReveal key={stat.title} delay={index * 0.1}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.footer}</p>
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                )
            })}
             <ScrollReveal className="sm:col-span-2 lg:col-span-1" delay={0.3}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Recently Accessed</CardTitle>
                        <History className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                    {recentTopics.map(topic => (
                        <div key={topic.id} className="flex items-center gap-3 group">
                            <Image src={topic.coverImage.src} alt={topic.name} width={40} height={40} className="rounded-md object-cover"/>
                            <div>
                            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{topic.name}</p>
                            <p className="text-xs text-muted-foreground">{topic.chapter}</p>
                            </div>
                        </div>
                    ))}
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

    