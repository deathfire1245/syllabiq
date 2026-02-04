
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp, getDoc, setDoc, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CreditCard, CheckCircle, BadgePercent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Badge } from '@/components/ui/badge';

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

    // --- Discount Logic ---
    const [availableDiscount, setAvailableDiscount] = React.useState<any | null>(null);
    const [finalPrice, setFinalPrice] = React.useState<number | null>(null);
    
    const discountsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'discounts'),
            where('userId', '==', user.uid),
            where('used', '==', false)
        );
    }, [user, firestore]);
    const { data: discounts, isLoading: areDiscountsLoading } = useCollection(discountsQuery);

    React.useEffect(() => {
        if (isCourseLoading || areDiscountsLoading || !course) {
            return;
        }

        if (discounts && discounts.length > 0) {
            const bestDiscount = discounts.reduce((prev, current) => 
                (prev.percentage > current.percentage) ? prev : current
            );
            
            setAvailableDiscount(bestDiscount);

            const originalPrice = Number(course.price);
            const discountValue = originalPrice * (bestDiscount.percentage / 100);
            const final = originalPrice - discountValue;
            setFinalPrice(Number(final.toFixed(2)));

        } else {
            setAvailableDiscount(null);
            setFinalPrice(Number(course.price));
        }
    }, [discounts, areDiscountsLoading, course, isCourseLoading]);
    // --- End Discount Logic ---

    const handlePurchase = async () => {
        if (!user || !firestore || !courseId || !course || finalPrice === null) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to make a purchase.' });
            return;
        }

        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            const studentName = userDoc.exists() ? userDoc.data().name : 'Unknown Student';
            
            const newTicketRef = doc(collection(firestore, 'tickets'));

            const ticketPayload = {
                id: newTicketRef.id,
                ticketCode: `CS-${Date.now().toString().slice(-6)}`,
                orderId: `ord_${courseId.slice(0, 5)}_${user.uid.slice(0, 5)}`,
                studentId: user.uid,
                studentName: studentName,
                teacherId: course.authorId,
                teacherName: course.author,
                status: 'COMPLETED',
                price: Number(course.price),
                finalPrice: finalPrice,
                appliedDiscountId: availableDiscount ? availableDiscount.id : null,
                duration: 0,
                commissionPercent: 10,
                createdAt: serverTimestamp(),
                validFrom: serverTimestamp(),
                validTill: serverTimestamp(),
                used: true,
                saleType: 'COURSE',
                courseId: courseId,
                courseTitle: course.title,
                refundable: false,
                cancelReason: null,
                endedBy: 'SYSTEM'
            };
            await setDoc(newTicketRef, ticketPayload);
            
            if (availableDiscount) {
                const discountRef = doc(firestore, 'discounts', availableDiscount.id);
                await updateDoc(discountRef, {
                    used: true,
                    orderId: newTicketRef.id
                });
            }

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

    if (isUserLoading || isCourseLoading || areDiscountsLoading) {
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
                         <div className="border-t border-b py-4 space-y-2">
                             <div className="flex justify-between items-center text-md text-muted-foreground">
                                <span>Original Price</span>
                                <span>₹{Number(course.price).toFixed(2)}</span>
                             </div>
                              {availableDiscount && (
                                <div className="flex justify-between items-center text-md text-green-600">
                                    <span>Discount ({availableDiscount.percentage}%)</span>
                                    <span>- ₹{(Number(course.price) * (availableDiscount.percentage / 100)).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                                <span className="text-foreground">Total to Pay</span>
                                <span className="text-2xl">₹{finalPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                         {availableDiscount && (
                            <div className="!mt-4">
                                <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200">
                                    <BadgePercent className="mr-1.5 h-4 w-4" />
                                    {availableDiscount.percentage}% referral discount applied!
                                </Badge>
                            </div>
                        )}
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
                            disabled={isProcessing || finalPrice === null}
                        >
                            {isProcessing ? (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5 animate-pulse" />
                                    Processing...
                                </>
                            ) : (
                                `Confirm Purchase for ₹${finalPrice?.toFixed(2)}`
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </ScrollReveal>
        </div>
    );
}

