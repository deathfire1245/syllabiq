
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
  IndianRupee,
} from "lucide-react";
import { getSubjects, getStaticTopics } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore";
import type { Topic } from "@/lib/types";
import { format } from "date-fns";


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


const TeacherDashboard = ({ userRole }: { userRole: string }) => {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    
    const userDocRef = useMemoFirebase(() => (user && firestore) ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);
    
    const waitingTicketsQuery = useMemoFirebase(() => {
        if (!user || !firestore || userRole !== "teacher") return null;
        return query(
            collection(firestore, "tickets"), 
            where("teacherId", "==", user.uid), 
            where("status", "==", "WAITING_FOR_TEACHER")
        );
    }, [user, firestore, userRole]);
    
    const { data: waitingTickets } = useCollection(waitingTicketsQuery);
    
    const completedSessionsQuery = useMemoFirebase(() => {
        if (!user || !firestore || userRole !== "teacher") return null;
        return query(
            collection(firestore, "tickets"),
            where("teacherId", "==", user.uid),
            where("status", "==", "COMPLETED")
        );
    }, [user, firestore, userRole]);
    const { data: completedSessions, isLoading: areSessionsLoading } = useCollection(completedSessionsQuery);

    const upcomingSessionsQuery = useMemoFirebase(() => {
        if (!user || !firestore || userRole !== "teacher") return null;
        return query(
            collection(firestore, "tickets"),
            where("teacherId", "==", user.uid),
            where("status", "in", ["PAID", "WAITING_FOR_TEACHER"])
        );
    }, [user, firestore, userRole]);
    const { data: upcomingSessions, isLoading: areUpcomingSessionsLoading } = useCollection(upcomingSessionsQuery);

    const totalEarnings = React.useMemo(() => {
        if (!completedSessions) return 0;
        return completedSessions.reduce((acc, ticket) => acc + (ticket.price || 0), 0);
    }, [completedSessions]);

    const uniqueStudents = React.useMemo(() => {
        if (!completedSessions) return 0;
        const studentIds = new Set(completedSessions.map(ticket => ticket.studentId));
        return studentIds.size;
    }, [completedSessions]);

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
    
    const courseSalesQuery = useMemoFirebase(() => {
        if (!user || !firestore || userRole !== "teacher") return null;
        return query(
            collection(firestore, "tickets"),
            where("teacherId", "==", user.uid),
            where("saleType", "==", "COURSE"),
            where("status", "in", ["PAID", "REFUND_PROCESSED"])
        );
    }, [user, firestore, userRole]);
    const { data: courseSales, isLoading: areCourseSalesLoading } = useCollection(courseSalesQuery);

    const { pendingCourseEarnings, paidCourseEarnings, allSales } = React.useMemo(() => {
        if (!courseSales) return { pendingCourseEarnings: 0, paidCourseEarnings: 0, allSales: [] };
        
        let pending = 0;
        
        // Calculate pending earnings only from 'PAID' tickets
        courseSales.forEach(ticket => {
            if (ticket.status === 'PAID') {
                const saleAmount = ticket.finalPrice || 0;
                const commission = saleAmount * (ticket.commissionPercent || 10) / 100;
                pending += saleAmount - commission;
            }
        });
    
        const sortedSales = [...courseSales].sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
    
        // paidCourseEarnings is still 0 as we can't determine what's paid out from the ticket status alone
        return { pendingCourseEarnings: pending, paidCourseEarnings: 0, allSales: sortedSales };
    }, [courseSales]);

    const teacherStats = [
        { title: "Total Session Earnings", value: totalEarnings, icon: IndianRupee, footer: "From completed sessions", isLoading: areSessionsLoading, prefix: "₹" },
        { title: "Hours Taught", value: completedSessions?.length ?? 0, icon: Clock, footer: "Total sessions completed", isLoading: areSessionsLoading },
        { title: "My Students", value: uniqueStudents, icon: Users, footer: "Unique students taught", isLoading: areSessionsLoading },
        { title: "Upcoming Sessions", value: upcomingSessions?.length ?? 0, icon: Calendar, footer: "Check your schedule", isLoading: areUpcomingSessionsLoading },
    ];
    
    const handleJoinSession = (ticketId: string) => {
        router.push(`/dashboard/meeting/${ticketId}`);
    }
    
    if (isUserLoading || isProfileLoading) return <div className="p-8">
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

    return (
      <div className="space-y-8">
        <ScrollReveal>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, {userProfile?.name || 'Educator'}!</h1>
            <p className="text-muted-foreground mt-2 text-lg">Here's what's happening today.</p>
        </ScrollReveal>

        {waitingTickets && waitingTickets.length > 0 && (
            <ScrollReveal delay={0.1}>
                <Card className="bg-yellow-100 border-yellow-300 text-yellow-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="w-6 h-6 animate-pulse"/>
                            Students are waiting for you!
                        </CardTitle>
                        <CardDescription className="text-yellow-800">A student has entered the waiting room for a session. Join now to begin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {waitingTickets.map(ticket => (
                            <div key={ticket.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                <div>
                                    <p className="font-bold">{ticket.studentName}</p>
                                    <p className="text-sm">Ticket: {ticket.ticketCode}</p>
                                </div>
                                <Button onClick={() => handleJoinSession(ticket.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white">Join Session</Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </ScrollReveal>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teacherStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                <ScrollReveal key={stat.title} delay={0.1 + index * 0.05}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            {stat.isLoading ? <Skeleton className="h-8 w-1/2" /> : (
                                <div className="text-2xl font-bold">
                                    <AnimatedCounter to={stat.value} prefix={stat.prefix} />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">{stat.footer}</p>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            )})}
        </div>

        <ScrollReveal delay={0.3}>
            <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">Course Earnings</h2>
            <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {areCourseSalesLoading ? <Skeleton className="h-8 w-1/2" /> : (
                            <div className="text-2xl font-bold">
                                <AnimatedCounter to={pendingCourseEarnings} prefix="₹" />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Earnings from course sales awaiting payout.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <AnimatedCounter to={paidCourseEarnings} prefix="₹" />
                        </div>
                        <p className="text-xs text-muted-foreground">Total earnings paid out to your account.</p>
                    </CardContent>
                </Card>
            </div>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                 <ScrollReveal delay={0.4}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Sales &amp; Payouts</CardTitle>
                            <CardDescription>A real-time list of all your course sales and their payout status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        {areCourseSalesLoading ? <Skeleton className="h-40 w-full" /> : 
                            allSales && allSales.length > 0 ? (
                                <div className="space-y-4">
                                    {allSales.map(sale => {
                                        const saleAmount = sale.finalPrice || 0;
                                        const commission = saleAmount * (sale.commissionPercent || 10) / 100;
                                        const earning = saleAmount - commission;
                                        const isRefunded = sale.status === 'REFUND_PROCESSED';
                                        
                                        return (
                                            <div key={sale.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-semibold">{sale.courseTitle}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {sale.createdAt ? format(sale.createdAt.toDate(), "PPP") : 'N/A'} - Sold to {sale.studentName}
                                                    </p>
                                                </div>
                                                <div className="w-1/4 text-right">
                                                    <p className={`font-semibold font-mono ${isRefunded ? 'text-destructive' : 'text-green-600'}`}>
                                                        {isRefunded ? `- ₹${saleAmount.toFixed(2)}` : `+ ₹${earning.toFixed(2)}`}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Sale: ₹{saleAmount.toFixed(2)}</p>
                                                </div>
                                                <div className="w-32 text-center ml-4">
                                                     <Badge variant={isRefunded ? 'destructive' : 'outline'}>
                                                        {isRefunded ? 'Refunded' : 'Pending Payout'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">You have no course sales yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </ScrollReveal>

                <ScrollReveal delay={0.3}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Content</CardTitle>
                            <CardDescription>Your most recently created topics.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isRecentContentLoading ? <Skeleton className="h-32 w-full" /> : 
                            recentContent && recentContent.length > 0 ? (
                                <div className="space-y-4">
                                    {recentContent.map(topic => (
                                        <div key={topic.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                            <div>
                                                <p className="font-semibold">{topic.name}</p>
                                                <p className="text-sm text-muted-foreground">{topic.chapter}</p>
                                            </div>
                                            <Badge variant="outline">{topic.subjectId.split('-')[0]}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">You haven't created any content yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
            <ScrollReveal className="md:col-span-1" delay={0.4}>
                <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground h-full flex flex-col justify-center text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Something New</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6">Share your knowledge with the world. Create a new course or set up your availability for live classes.</p>
                        <Button variant="secondary" asChild>
                            <Link href="/dashboard/create">Start Creating</Link>
                        </Button>
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    </div>
    );
};

const StudentDashboard = ({ userRole }: { userRole: string }) => {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    
    const userDocRef = useMemoFirebase(() => (user && firestore) ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const topicsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'topics') : null, [firestore]);
    const { data: allTopics, isLoading: areTopicsLoading } = useCollection<Topic>(topicsQuery);
    
    const completedTopicsCount = userProfile?.studentProfile?.completedTopics?.length || 0;
    const totalTopicsCount = allTopics?.length || 0;

    const completedSessionsQuery = useMemoFirebase(() => {
        if (!user || !firestore || userRole !== "student") return null;
        return query(
            collection(firestore, "tickets"),
            where("studentId", "==", user.uid),
            where("status", "==", "COMPLETED")
        );
    }, [user, firestore, userRole]);
    const { data: completedSessions, isLoading: areSessionsLoading } = useCollection(completedSessionsQuery);
    
    const recentlyAccessedIds = userProfile?.studentProfile?.recentlyAccessed || [];
    const recentTopics = React.useMemo(() => {
      if (!allTopics || recentlyAccessedIds.length === 0) return [];
      const staticTopics = getStaticTopics();
      const combinedTopics = [...(allTopics || []), ...staticTopics];
      return [...new Set(recentlyAccessedIds)]
        .map(id => combinedTopics.find(t => t.id === id))
        .filter((t): t is Topic => !!t)
        .slice(0, 3);
    }, [allTopics, recentlyAccessedIds]);

    const handleViewTopic = (topic: Topic) => {
        try {
            sessionStorage.setItem('activeTopic', JSON.stringify(topic));
            router.push('/dashboard/subjects/topic-content');
        } catch (e) {
            console.error("Failed to save topic to session storage or navigate", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not open the topic. Please try again.",
            });
        }
    };

    if (isUserLoading || isProfileLoading) return <div className="p-8">
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

    return (
        <div className="space-y-8">
            <ScrollReveal>
                <Card className="bg-gradient-to-r from-primary/80 to-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-3xl">Welcome back, {userProfile?.name || 'Student'}!</CardTitle>
                        <CardDescription className="text-primary-foreground/80 text-lg">Ready to dive back in and continue your learning journey?</CardDescription>
                    </CardHeader>
                </Card>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <ScrollReveal delay={0.1}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Overall Progress</CardDescription>
                            <CardTitle className="text-3xl">{totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0}%</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Progress value={totalTopicsCount > 0 ? (completedTopicsCount / totalTopicsCount) * 100 : 0} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">{completedTopicsCount} of {totalTopicsCount} topics completed</p>
                        </CardContent>
                    </Card>
                </ScrollReveal>
                <ScrollReveal delay={0.15}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Topics Completed</CardDescription>
                            <CardTitle className="text-3xl">{completedTopicsCount}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                        </CardContent>
                    </Card>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Sessions Attended</CardDescription>
                            <CardTitle className="text-3xl">{areSessionsLoading ? <Skeleton className="h-8 w-1/2" /> : completedSessions?.length ?? 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Live learning sessions.</p>
                        </CardContent>
                    </Card>
                </ScrollReveal>
                <ScrollReveal delay={0.25}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Subjects Explored</CardDescription>
                            <CardTitle className="text-3xl">{userProfile?.studentProfile?.preferredSubjects?.length || 0}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Across all your grades.</p>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>

            <ScrollReveal delay={0.4}>
                <Card>
                    <CardHeader>
                        <CardTitle>Continue Learning</CardTitle>
                        <CardDescription>Pick up where you left off.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {areTopicsLoading || isProfileLoading ? (
                            <div className="grid md:grid-cols-3 gap-4">
                                <Skeleton className="h-40 w-full"/>
                                <Skeleton className="h-40 w-full"/>
                                <Skeleton className="h-40 w-full"/>
                            </div>
                        ) : recentTopics.length > 0 ? (
                            <div className="grid md:grid-cols-3 gap-4">
                                {recentTopics.map(topic => {
                                    return (
                                     <div key={topic.id} className="block group cursor-pointer" onClick={() => handleViewTopic(topic)}>
                                        <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                            <CardHeader>
                                                <Badge variant="outline" className="mb-1">{topic.chapter}</Badge>
                                                <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary">{topic.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{topic.summary}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )})}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground mb-4">You haven't accessed any topics recently.</p>
                                <Button asChild>
                                    <Link href="/dashboard/subjects">Explore Subjects</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </ScrollReveal>
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
      {userRole === "teacher" ? <TeacherDashboard userRole={userRole} /> : <StudentDashboard userRole={userRole} />}
    </>
  )
}
