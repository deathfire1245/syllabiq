'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, limit, runTransaction, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Lock, FileText, Video, Link as LinkIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CourseContentItem {
  title: string;
  type: 'pdf' | 'video';
  url: string;
}

export default function CourseContentPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const { toast } = useToast();

    const { firestore } = useFirebase();
    const { user, isUserLoading } = useUser();

    const [isConfirming, setIsConfirming] = React.useState(false);

    const courseDocRef = useMemoFirebase(() => {
        if (!firestore || !courseId) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    // Check for an initiated ticket for this course
    const ticketQuery = useMemoFirebase(() => {
        if (!firestore || !user || !courseId) return null;
        return query(
            collection(firestore, 'tickets'),
            where('studentId', '==', user.uid),
            where('courseId', '==', courseId),
            limit(1)
        );
    }, [firestore, user, courseId]);

    const { data: course, isLoading: isCourseLoading } = useDoc(courseDocRef);
    const { data: userProfile, isLoading: isProfileLoading, mutate } = useDoc(userDocRef);
    const { data: tickets, isLoading: isTicketLoading } = useCollection(ticketQuery);

    const isEnrolled = React.useMemo(() => {
        return userProfile?.studentProfile?.enrolledCourses?.includes(courseId) || false;
    }, [userProfile, courseId]);

    const pendingTicket = React.useMemo(() => {
        if (!tickets || tickets.length === 0) return null;
        const ticket = tickets[0];
        return ticket.status === 'INITIATED' ? ticket : null;
    }, [tickets]);
    
    const handleConfirmPayment = async () => {
        if (!firestore || !user || !pendingTicket) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not find a pending payment to confirm.'});
            return;
        }
        setIsConfirming(true);
        const ticketRef = doc(firestore, 'tickets', pendingTicket.id);
        const userRef = doc(firestore, 'users', user.uid);

        try {
            await runTransaction(firestore, async (transaction) => {
                const ticketDoc = await transaction.get(ticketRef);
                if (!ticketDoc.exists() || ticketDoc.data().status !== 'INITIATED') {
                    throw new Error('Ticket is not in a valid state to be confirmed.');
                }

                // 1. Update the ticket status to PAID
                transaction.update(ticketRef, { status: 'PAID', used: true, refundable: false });

                // 2. Grant course access to the user
                transaction.update(userRef, {
                    'studentProfile.enrolledCourses': arrayUnion(courseId)
                });
            });

            toast({ title: 'Payment Confirmed!', description: 'You now have access to the course.'});
            // Optimistically update the UI without a full reload
            await mutate();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Confirmation Failed', description: error.message || 'Could not confirm your payment. Please try again.' });
        } finally {
            setIsConfirming(false);
        }
    }

    if (isUserLoading || isCourseLoading || isProfileLoading || isTicketLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (!course) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold">Course Not Found</h1>
                <p className="text-muted-foreground mt-2">The course you are looking for does not exist.</p>
                <Button onClick={() => router.back()} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    if (!isEnrolled) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                 <ScrollReveal>
                    {pendingTicket ? (
                        <Card className="max-w-md mx-auto border-yellow-400 bg-yellow-50">
                            <CardHeader>
                                <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4"/>
                                <CardTitle className="text-2xl">Payment Pending</CardTitle>
                                <CardDescription>Your purchase has been initiated. If you have completed the payment, please confirm below.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Button onClick={handleConfirmPayment} disabled={isConfirming}>
                                    {isConfirming ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin"/>Confirming...</> : 'I have paid, Confirm Purchase'}
                                 </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="max-w-md mx-auto">
                            <CardHeader>
                                <Lock className="w-12 h-12 mx-auto text-destructive mb-4"/>
                                <CardTitle className="text-2xl">Access Denied</CardTitle>
                                <CardDescription>You are not enrolled in this course.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <Button onClick={() => router.push(`/dashboard/payment/${courseId}`)}>
                                    Buy Course for ₹{course.price}
                                 </Button>
                            </CardContent>
                        </Card>
                    )}
                 </ScrollReveal>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
             <ScrollReveal>
                <div className="flex items-center gap-4 mb-4">
                     <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/courses')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                           <Badge variant="outline">{course.category}</Badge>
                           <Badge variant="secondary">{course.difficulty}</Badge>
                        </div>
                        <h1 className="text-4xl font-bold">{course.title}</h1>
                        <p className="text-muted-foreground text-lg">by {course.author}</p>
                    </div>
                </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>Course Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{course.description}</p>
                    </CardContent>
                </Card>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
                 <Card>
                    <CardHeader>
                        <CardTitle>Lessons ({course.lessons})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {course.content?.map((item: CourseContentItem, index: number) => (
                            <a 
                                key={index} 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/80 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {item.type === 'pdf' ? <FileText className="w-6 h-6 text-destructive"/> : <Video className="w-6 h-6 text-blue-500"/>}
                                    <p className="font-semibold">{item.title}</p>
                                </div>
                                <LinkIcon className="w-5 h-5 text-muted-foreground"/>
                            </a>
                        ))}
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    )
}
