'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal } from '@/components/ScrollReveal';

export default function MockPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const courseId = params.courseId as string;

    const { firestore } = useFirebase();
    const { user, isUserLoading } = useUser();

    const courseDocRef = useMemoFirebase(() => {
        if (!firestore || !courseId) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);

    const { data: course, isLoading: isCourseLoading } = useDoc(courseDocRef);

    const [isProcessing, setIsProcessing] = React.useState(false);

    const handlePurchase = async () => {
        if (!user || !firestore || !courseId) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to make a purchase.' });
            return;
        }

        setIsProcessing(true);

        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
                'studentProfile.enrolledCourses': arrayUnion(courseId),
            });

            toast({
                title: 'Purchase Successful!',
                description: `You have successfully enrolled in "${course?.title}".`,
            });
            
            router.push('/dashboard/courses');

        } catch (error) {
            console.error('Failed to enroll in course:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not enroll you in the course. Please try again.' });
            setIsProcessing(false);
        }
    };

    if (isUserLoading || isCourseLoading) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Skeleton className="h-12 w-1/4 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    if (!course) {
         return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold">Course Not Found</h1>
                <p className="text-muted-foreground mt-2">The course you are looking for does not exist.</p>
                 <Button onClick={() => router.back()} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <ScrollReveal>
                <div className="flex items-center gap-4 mb-8">
                     <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Checkout</h1>
                </div>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">{course.title}</CardTitle>
                        <CardDescription>by {course.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="border-t border-b py-4">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-bold text-2xl">₹{course.price}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Mock Payment Details</h3>
                            <div className="border rounded-lg p-4 bg-secondary/50 flex items-center gap-4">
                                <CreditCard className="w-6 h-6 text-muted-foreground"/>
                                <div>
                                    <p className="font-mono">**** **** **** 4242</p>
                                    <p className="text-sm text-muted-foreground">This is a mock payment. No real transaction will occur.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full h-12 text-lg" 
                            onClick={handlePurchase}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5 animate-pulse" />
                                    Processing...
                                </>
                            ) : (
                                `Confirm Purchase for ₹${course.price}`
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </ScrollReveal>
        </div>
    );
}
