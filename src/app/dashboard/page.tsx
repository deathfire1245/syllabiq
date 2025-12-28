
"use client";

import * as React from "react";
import {
  Clock,
  History,
  Target,
  TrendingUp,
  Video,
  Copy,
  PlusCircle,
  Users,
  BookOpen,
  Calendar,
} from "lucide-react";
import { getSubjects } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useInView, motion, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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


const iconMap: { [key:string]: React.ElementType } = {
  TrendingUp,
  Clock,
  Target,
  History,
  Users,
  BookOpen,
  Calendar
};

const TeacherDashboard = () => {
    const router = useRouter();
    const { toast } = useToast();
    const [meetingCode, setMeetingCode] = React.useState<string | null>(null);
    const [meetingRoomId, setMeetingRoomId] = React.useState<string | null>(null);

    const generateMeetingCode = async () => {
        const code = `SYL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newMeetingRoomId = crypto.randomUUID();
        
        // Store in localStorage for simple multi-tab/multi-window testing
        localStorage.setItem("activeMeetingCode", code);
        localStorage.setItem("activeMeetingRoomId", newMeetingRoomId);
        
        setMeetingCode(code);
        setMeetingRoomId(newMeetingRoomId);
        toast({
            title: 'Meeting Code Generated!',
            description: `Your new meeting code is ${code}`,
        });
    };

    const startMeeting = () => {
        if (!meetingRoomId) {
            toast({
                variant: 'destructive',
                title: 'No Meeting Room',
                description: 'Please generate a code first.',
            });
            return;
        }
        router.push(`/dashboard/meeting/${meetingRoomId}`);
    };

    const copyCode = () => {
        if (!meetingCode) return;
        navigator.clipboard.writeText(meetingCode);
        toast({
            title: 'Code Copied!',
            description: 'The meeting code has been copied to your clipboard.',
        });
    };

    const endMeeting = async () => {
        localStorage.removeItem("activeMeetingCode");
        localStorage.removeItem("activeMeetingRoomId");
        setMeetingCode(null);
        setMeetingRoomId(null);
        toast({
            title: 'Meeting Ended',
            description: 'The meeting session has been closed.',
        });
    }
    
    const teacherStats = [
        { title: "Total Students", value: 125, icon: Users, footer: "Across all courses" },
        { title: "Hours Taught", value: 340, icon: Clock, footer: "+20 this month" },
        { title: "Active Courses", value: 5, icon: BookOpen, footer: "View your courses" },
        { title: "Upcoming Sessions", value: 3, icon: Calendar, footer: "Check your schedule" },
    ];

    const recentContent = [
        { title: "Introduction to Calculus", type: "Course", date: "3 days ago" },
        { title: "Newton's Laws of Motion", type: "Topic", date: "5 days ago" },
        { title: "The Periodic Table", type: "Topic", date: "1 week ago" },
    ];


    return (
        <div className="space-y-8">
             <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Teacher Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Welcome back! Here's your teaching overview.</p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
                <Card className="bg-primary/10 border-primary shadow-lg">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Video className="w-6 h-6"/> Host a Live Session</CardTitle>
                            <CardDescription>Generate a code to start a live class and share it with your students.</CardDescription>
                        </div>
                         {meetingCode && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <p className="text-lg font-bold font-mono tracking-widest p-2 bg-background rounded-lg border">{meetingCode}</p>
                                <Button variant="outline" size="icon" onClick={copyCode}><Copy className="w-4 h-4"/></Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {!meetingCode ? (
                             <Button 
                                size="lg" 
                                onClick={generateMeetingCode}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow transform hover:scale-105"
                            >
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Generate New Meeting Code
                            </Button>
                        ) : (
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Button size="lg" onClick={startMeeting}>
                                    <Video className="mr-2 h-5 w-5" />
                                    Jump Into Meeting
                                </Button>
                                 <Button variant="destructive" onClick={endMeeting}>
                                    End Session
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ScrollReveal>

            {/* Quick Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                 {teacherStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <ScrollReveal key={stat.title} delay={index * 0.1}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold"><AnimatedCounter to={stat.value} /></div>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.footer}</p>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    )
                })}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-8">
                <ScrollReveal delay={0.2}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Content</CardTitle>
                            <CardDescription>Your recently created or updated content.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-4">
                                {recentContent.map(item => (
                                    <li key={item.title} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <Badge variant="outline" className="mt-1">{item.type}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.date}</p>
                                    </li>
                                ))}
                           </ul>
                        </CardContent>
                    </Card>
                </ScrollReveal>
                 <ScrollReveal delay={0.3}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Jump right into creating new material.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 gap-4">
                            <Button asChild variant="outline" size="lg" className="h-auto py-4">
                                <Link href="/dashboard/create/courses" className="flex flex-col items-center gap-2">
                                    <BookOpen className="w-8 h-8 text-primary"/>
                                    <span className="font-semibold">Create New Course</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-auto py-4">
                               <Link href="/dashboard/create/classes" className="flex flex-col items-center gap-2">
                                    <Calendar className="w-8 h-8 text-primary"/>
                                    <span className="font-semibold">Manage Schedule</span>
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
        </div>
    );
};

const StudentDashboard = () => {
    const subjects = getSubjects().slice(0, 3);
    const router = useRouter();
    const { toast } = useToast();
    const [meetingCode, setMeetingCode] = React.useState('');

    const userStats = [
        {
            title: "Topics Completed",
            icon: TrendingUp,
            value: 18,
            total: 50,
            footer: "+5 from last week",
        },
        {
            title: "Study Hours",
            icon: Clock,
            value: 42,
            footer: "Total time spent learning",
        },
        {
            title: "Average Score",
            icon: Target,
            value: 88,
            suffix: "%",
            footer: "Across 12 quizzes",
        }
    ];
    
    const recentTopics = getSubjects().flatMap(s => s.topics).slice(0,3);

    const handleJoinMeeting = async () => {
        if (!meetingCode.trim()) {
            toast({
                variant: 'destructive',
                title: 'Meeting Code Required',
                description: 'Please enter a valid meeting code to join.',
            });
            return;
        }

        const storedCode = localStorage.getItem("activeMeetingCode");
        const storedRoomId = localStorage.getItem("activeMeetingRoomId");

        if (meetingCode.trim().toUpperCase() !== storedCode) {
            toast({
                variant: 'destructive',
                title: 'Invalid or Inactive Code',
                description: 'The meeting code is not valid or the session has not started yet.',
            });
            return;
        }

        router.push(`/dashboard/meeting/${storedRoomId}`);
    };

    return (
        <div className="space-y-8">
            <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Student Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Welcome back! Ready to learn something new?</p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                <Card className="bg-primary/10 border-primary shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2"><Video className="w-6 h-6"/> Join a Live Session</CardTitle>
                        <CardDescription>Enter the meeting code provided by your teacher to jump into the class.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Input 
                            placeholder="Enter code (e.g., SYL-ABCD)" 
                            className="text-lg h-12 max-w-sm bg-background"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                        />
                        <Button 
                            size="lg" 
                            onClick={handleJoinMeeting}
                            className="w-full sm:w-auto"
                        >
                            Join Meeting
                        </Button>
                    </CardContent>
                </Card>
            </ScrollReveal>

            {/* User Stats Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                 {userStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <ScrollReveal key={stat.title} delay={index * 0.1}>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                                        {stat.total && <span className="text-lg text-muted-foreground">/ {stat.total}</span>}
                                    </div>
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
                        <CardContent className="space-y-3 pt-4">
                        {recentTopics.map(topic => (
                            <Link href={`/dashboard/subjects/${topic.subjectId}/${topic.id}`} key={topic.id} className="flex items-center gap-3 group">
                                <Image src={topic.coverImage.src} alt={topic.name} width={40} height={40} className="rounded-md object-cover"/>
                                <div>
                                <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{topic.name}</p>
                                <p className="text-xs text-muted-foreground">{topic.chapter}</p>
                                </div>
                            </Link>
                        ))}
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
            
            {/* Your Subjects Section */}
            <ScrollReveal>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold tracking-tight">Continue Learning</h2>
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard/subjects">View All Subjects <Copy className="ml-2 w-4 h-4"/></Link>
                    </Button>
                </div>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject, index) => {
                  const progress = Math.floor(Math.random() * 50) + 25;
                  return (
                    <ScrollReveal key={subject.id} delay={index * 0.1}>
                        <Link href={`/dashboard/subjects/${subject.id}`}>
                            <Card
                            className="group relative overflow-hidden transform transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/20"
                            >
                                <Image
                                    src={subject.coverImage.src}
                                    alt={subject.name}
                                    width={600}
                                    height={400}
                                    className="object-cover w-full h-32 transition-transform duration-300 group-hover:scale-110"
                                    data-ai-hint={subject.coverImage.hint}
                                />
                                <CardHeader className="relative z-10 p-4">
                                     <CardTitle className="text-lg font-bold group-hover:text-primary">
                                        {subject.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <p className="text-muted-foreground">Progress</p>
                                            <p className="font-medium text-primary">{progress}%</p>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </ScrollReveal>
                  );
                })}
            </div>
        </div>
    );
};


export default function DashboardPage() {
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // In a real app, you'd get this from an auth context
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    setIsLoading(false);
  }, []);

  if (isLoading) {
      return (
        <div className="p-8">
            <div className="space-y-8">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-40 w-full" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            </div>
        </div>
      )
  }

  // Teacher Dashboard View
  if (userRole === "Teacher") {
    return <TeacherDashboard />;
  }

  // Student Dashboard View
  // Default to student if no role or student role is set
  return <StudentDashboard />;
}
