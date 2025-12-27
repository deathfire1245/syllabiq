
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
import { useUser, useFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

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

const TeacherDashboard = () => {
    const router = useRouter();
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const [meetingCode, setMeetingCode] = React.useState<string | null>(null);
    const [meetingRoomId, setMeetingRoomId] = React.useState<string | null>(null);

    const generateMeetingCode = async () => {
        if (!user || !firestore) return;
        
        const code = `SYL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const roomId = crypto.randomUUID();
        
        const meetingDocRef = doc(firestore, "meetings", code);

        try {
            await setDoc(meetingDocRef, {
                meetingCode: code,
                meetingRoomId: roomId,
                hostUid: user.uid,
                isActive: true,
                createdAt: serverTimestamp()
            });
            setMeetingCode(code);
            setMeetingRoomId(roomId);
            toast({
                title: 'Meeting Code Generated!',
                description: `Your new meeting code is ${code}`,
            });
        } catch(error: any) {
            toast({
                variant: 'destructive',
                title: 'Error creating meeting',
                description: error.message,
            });
        }
    };

    const startMeeting = () => {
        if (!meetingCode || !meetingRoomId) {
            toast({
                variant: 'destructive',
                title: 'No Meeting Code',
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
        if (!meetingCode || !firestore) return;
        const meetingDocRef = doc(firestore, "meetings", meetingCode);
        try {
            await setDoc(meetingDocRef, { isActive: false }, { merge: true });
            setMeetingCode(null);
            setMeetingRoomId(null);
            toast({
                title: 'Meeting Ended',
                description: 'The meeting session has been closed.',
            });
        } catch(error: any) {
            toast({
                variant: 'destructive',
                title: 'Error ending meeting',
                description: error.message,
            });
        }
    }

    return (
        <div className="space-y-8">
            <ScrollReveal>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Teacher Dashboard</h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
                <Card className="bg-primary/10 border-primary">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Host a Meeting</CardTitle>
                        <CardDescription>Generate a code to start a live session. Share the code with your students to have them join.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        {!meetingCode ? (
                             <Button 
                                size="lg" 
                                onClick={generateMeetingCode}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow transform hover:scale-105"
                            >
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Generate a New Meeting Code
                            </Button>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold font-mono tracking-widest p-3 bg-background rounded-lg border">{meetingCode}</p>
                                    <Button variant="outline" size="icon" onClick={copyCode}><Copy className="w-5 h-5"/></Button>
                                </div>
                                <div className="flex gap-4">
                                    <Button size="lg" onClick={startMeeting}>
                                        <Video className="mr-2 h-5 w-5" />
                                        Start Meeting Now
                                    </Button>
                                     <Button variant="secondary" onClick={endMeeting}>
                                        End Session
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    );
};

const StudentDashboard = () => {
    const subjects = getSubjects().slice(0, 3);
    const recentTopics = getSubjects().flatMap(s => s.topics).slice(0,3);
    const router = useRouter();
    const { toast } = useToast();
    const { firestore } = useFirebase();
    const [meetingCode, setMeetingCode] = React.useState('');


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
    ];

    const handleJoinMeeting = async () => {
        if (!meetingCode.trim()) {
            toast({
                variant: 'destructive',
                title: 'Meeting Code Required',
                description: 'Please enter a valid meeting code to join.',
            });
            return;
        }

        try {
            const meetingDocRef = doc(firestore, "meetings", meetingCode.trim());
            const meetingDoc = await getDoc(meetingDocRef);

            if (!meetingDoc.exists() || !meetingDoc.data()?.isActive) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid or Inactive Code',
                    description: 'The meeting code is not valid or the session has not started yet.',
                });
                return;
            }

            const { meetingRoomId } = meetingDoc.data();
            router.push(`/dashboard/meeting/${meetingRoomId}`);
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error Joining Meeting',
                description: error.message || 'Could not join the meeting.',
            });
        }
    };

    return (
        <div className="space-y-8">
            <ScrollReveal delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>Join a Live Session</CardTitle>
                        <CardDescription>Enter the meeting code provided by your teacher to join the class.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                        <Input 
                            placeholder="Enter code (e.g., SYL-ABCD)" 
                            className="text-lg h-12 max-w-sm"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                        />
                        <Button 
                            size="lg" 
                            onClick={handleJoinMeeting}
                            className="w-full sm:w-auto"
                        >
                            <Video className="mr-2 h-5 w-5" />
                            Join Meeting
                        </Button>
                    </CardContent>
                </Card>
            </ScrollReveal>

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
};


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Rely on localStorage for a quick role check, but Firestore is the source of truth
    const role = localStorage.getItem("userRole");
    if(role) {
        setUserRole(role);
    }
  }, []);

  if (isUserLoading || !user) {
      return <div>Loading...</div>
  }

  // Teacher Dashboard View
  if (userRole === "Teacher") {
    return <TeacherDashboard />;
  }

  // Student Dashboard View
  return <StudentDashboard />;
}
