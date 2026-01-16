
"use client";

import * as React from "react";
import {
  Clock,
  History,
  Target,
  TrendingUp,
  Video,
  Copy,
  Users,
  BookOpen,
  Calendar,
} from "lucide-react";
import { getSubjects, getStaticTopics } from "@/lib/data";
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
import { Badge } from "@/components/ui/badge";
import { useUser, useFirebase, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, updateDoc, collection, query, where, addDoc, getDocs, orderBy, limit, getDoc, arrayUnion } from "firebase/firestore";
import type { Topic } from "@/lib/types";


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

  return <span ref={ref}>{prefix}0{suffix}</span>;
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
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();

    const waitingTicketsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, "tickets"), 
            where("teacherId", "==", user.uid), 
            where("status", "==", "WAITING_FOR_TEACHER")
        );
    }, [user, firestore]);
    
    const { data: waitingTickets } = useCollection(waitingTicketsQuery);
    
    // Total students on the platform
    const studentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null, [firestore]);
    const { data: students, isLoading: areStudentsLoading } = useCollection(studentsQuery);

    // Active courses by this teacher
    const coursesQuery = useMemoFirebase(() => (user && firestore) ? query(collection(firestore, 'courses'), where('authorId', '==', user.uid)) : null, [user, firestore]);
    const { data: myCourses, isLoading: areCoursesLoading } = useCollection(coursesQuery);

    // Upcoming sessions for this teacher
    const upcomingSessionsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, "tickets"),
            where("teacherId", "==", user.uid),
            where("status", "in", ["PAID", "WAITING_FOR_TEACHER"])
        );
    }, [user, firestore]);
    const { data: upcomingSessions, isLoading: areSessionsLoading } = useCollection(upcomingSessionsQuery);

    // Recent content by this teacher
    const recentContentQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, "topics"),
            where("createdBy", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(3)
        );
    }, [user, firestore]);
    const { data: recentContent, isLoading: isRecentContentLoading } = useCollection<Topic>(recentContentQuery);
    
    const teacherStats = [
        { title: "Total Students", value: students?.length ?? 0, icon: Users, footer: "On the platform", isLoading: areStudentsLoading },
        { title: "Hours Taught", value: 340, icon: Clock, footer: "+20 this month", isLoading: false }, // Static
        { title: "Active Courses", value: myCourses?.length ?? 0, icon: BookOpen, footer: "View your courses", isLoading: areCoursesLoading },
        { title: "Upcoming Sessions", value: upcomingSessions?.length ?? 0, icon: Calendar, footer: "Check your schedule", isLoading: areSessionsLoading },
    ];
    
    const handleJoinSession = async (ticket: any) => {
        if (!firestore || !user) return;
        
        const ticketRef = doc(firestore, 'tickets', ticket.id);
        try {
            await updateDoc(ticketRef, {
                status: 'ACTIVE',
                activatedAt: new Date(),
                updatedAt: new Date(),
            });
            router.push(`/dashboard/meeting/${ticket.id}`);
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not start the session." });
        }
    }
    
    if (isUserLoading) return <div>Loading...</div>

    return (
        <div className="space-y-8">
             <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Teacher Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Welcome back, {user?.displayName}! Here's your teaching overview.</p>
            </ScrollReveal>
            
            {waitingTickets && waitingTickets.length > 0 && (
                <ScrollReveal delay={0.1}>
                    <Card className="bg-blue-50 border-blue-200 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2 text-blue-800"><Video className="w-6 h-6"/> Student is Waiting!</CardTitle>
                            <CardDescription className="text-blue-700">A student has entered the waiting room for their session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {waitingTickets.map((ticket: any) => (
                                <div key={ticket.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border">
                                    <div>
                                        <p className="font-semibold">Student: {ticket.studentName}</p>
                                        <p className="text-sm text-muted-foreground">Ticket: {ticket.ticketCode}</p>
                                    </div>
                                    <Button onClick={() => handleJoinSession(ticket)}>
                                        <Video className="mr-2 h-5 w-5" />
                                        Join Session Now
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </ScrollReveal>
            )}

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
                                    {stat.isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold"><AnimatedCounter to={stat.value} /></div>}
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
                           {isRecentContentLoading ? <Skeleton className="h-24 w-full" /> : (
                             <ul className="space-y-4">
                                {recentContent && recentContent.length > 0 ? recentContent.map(item => (
                                    <li key={item.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <Badge variant="outline" className="mt-1">Topic</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.createdAt?.toDate().toLocaleDateString()}</p>
                                    </li>
                                )) : <p className="text-sm text-muted-foreground text-center">No recent content.</p>}
                           </ul>
                           )}
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
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    
    const userDocRef = useMemoFirebase(() => (user && firestore) ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const topicsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'topics') : null, [firestore]);
    const { data: allTopics, isLoading: areTopicsLoading } = useCollection<Topic>(topicsQuery);

    const completedTopicsCount = userProfile?.studentProfile?.completedTopics?.length || 0;
    const totalTopicsCount = allTopics?.length || 0;
    
    const recentlyAccessedIds = userProfile?.studentProfile?.recentlyAccessed || [];
    const recentTopics = React.useMemo(() => {
      if (!allTopics || recentlyAccessedIds.length === 0) return [];
      // Combine Firestore topics with any static topics if they exist
      const staticTopics = getStaticTopics();
      const combinedTopics = [...(allTopics || []), ...staticTopics];
      return [...new Set(recentlyAccessedIds)]
        .map(id => combinedTopics.find(t => t.id === id))
        .filter((t): t is Topic => !!t)
        .slice(0, 3);
    }, [allTopics, recentlyAccessedIds]);

    const userStats = [
        { title: "Topics Completed", icon: TrendingUp, value: completedTopicsCount, total: totalTopicsCount, footer: "Keep it up!", isLoading: isProfileLoading || areTopicsLoading },
        { title: "Study Hours", icon: Clock, value: 42, footer: "Total time spent learning", isLoading: false }, // Static
        { title: "Average Score", icon: Target, value: 88, suffix: "%", footer: "Across 12 quizzes", isLoading: false }, // Static
    ];
    
    const subjectsWithProgress = React.useMemo(() => {
        return getSubjects().slice(0, 3).map(subject => {
            if (!allTopics || !userProfile?.studentProfile?.completedTopics) {
                return { ...subject, progress: 0 };
            }
            const topicsInSubject = allTopics.filter(t => t.subjectId === subject.id);
            const completedInSubject = userProfile.studentProfile.completedTopics.filter((topicId: string) => 
                topicsInSubject.some(t => t.id === topicId)
            ).length;
            const progress = topicsInSubject.length > 0 ? Math.round((completedInSubject / topicsInSubject.length) * 100) : 0;
            return { ...subject, progress };
        });
    }, [allTopics, userProfile]);

    return (
        <div className="space-y-8">
            <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Student Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">Welcome back, {user?.displayName || 'student'}! Ready to learn something new?</p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                 <Card className="bg-primary/10 border-primary/20 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2"><Video className="w-6 h-6"/> Join a Live Session</CardTitle>
                        <CardDescription>Have a ticket? Go to 'My Bookings' to enter the waiting room for your session.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild size="lg">
                            <Link href="/dashboard/bookings">Go to My Bookings</Link>
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
                                    {stat.isLoading ? (
                                      <Skeleton className="h-8 w-1/2" />
                                    ) : (
                                      <div className="text-2xl font-bold">
                                          <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                                          {stat.total != null && <span className="text-lg text-muted-foreground">/ {stat.total}</span>}
                                      </div>
                                    )}
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
                        {(isProfileLoading || areTopicsLoading) ? <Skeleton className="h-24 w-full" /> : (
                            recentTopics.length > 0 ? recentTopics.map(topic => (
                                <Link href={`/dashboard/subjects/topic-content`} onClick={() => sessionStorage.setItem('activeTopic', JSON.stringify(topic))} key={topic.id} className="flex items-center gap-3 group">
                                    <Image src={topic.coverImage.src} alt={topic.name} width={40} height={40} className="rounded-md object-cover"/>
                                    <div>
                                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{topic.name}</p>
                                    <p className="text-xs text-muted-foreground">{topic.chapter}</p>
                                    </div>
                                </Link>
                            )) : <p className="text-sm text-muted-foreground text-center">No recent topics.</p>
                        )}
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
                {subjectsWithProgress.map((subject, index) => (
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
                                            <p className="font-medium text-primary">{subject.progress}%</p>
                                        </div>
                                        {(isProfileLoading || areTopicsLoading) ? <Skeleton className="h-2 w-full" /> : <Progress value={subject.progress} className="h-2" />}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </ScrollReveal>
                  ))}
            </div>
        </div>
    );
};


export default function DashboardPage() {
  const { isUserLoading } = useUser();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isUserLoading) return;
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, [isUserLoading]);

  if (isUserLoading || !userRole) {
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

  return (
    <>
      {userRole === "teacher" ? <TeacherDashboard /> : <StudentDashboard />}
    </>
  )
}
