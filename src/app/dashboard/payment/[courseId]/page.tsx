
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { doc, runTransaction, arrayUnion, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CreditCard, CheckCircle, BadgePercent, Ticket, X } from 'lucide-react';
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
    const [promoCodeInput, setPromoCodeInput] = React.useState("");
    const [appliedPromo, setAppliedPromo] = React.useState<any | null>(null);
    const [finalPrice, setFinalPrice] = React.useState<number | null>(null);
    const [isApplying, setIsApplying] = React.useState(false);

    React.useEffect(() => {
        if (course && !appliedPromo) {
            setFinalPrice(Number(course.price));
        }
    }, [course, appliedPromo]);

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) {
            toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter a promo code.' });
            return;
        }
        if (!firestore || !user) return;

        setIsApplying(true);
        const code = promoCodeInput.trim().toUpperCase();
        const promoDocRef = doc(firestore, 'promoCodes', code);

        try {
            const promoDoc = await runTransaction(firestore, async (transaction) => {
                const sfDoc = await transaction.get(promoDocRef);
                if (!sfDoc.exists() || !sfDoc.data().isActive) {
                    throw new Error("Promo code not found or is inactive.");
                }
                const promoData = sfDoc.data();
                if (promoData.usedBy?.includes(user.uid)) {
                    throw new Error("You have already used this promo code.");
                }
                return promoData;
            });
            
            const originalPrice = Number(course.price);
            const discountValue = originalPrice * (promoDoc.percentage / 100);
            const final = originalPrice - discountValue;

            setFinalPrice(Number(final.toFixed(2)));
            setAppliedPromo({ ...promoDoc, id: code });
            toast({ title: 'Success!', description: `${promoDoc.percentage}% discount applied.` });

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Promo Code Error', description: error.message });
            setAppliedPromo(null);
            setFinalPrice(Number(course.price));
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCodeInput("");
        setFinalPrice(Number(course.price));
        toast({ title: 'Promo code removed.' });
    };

    const handlePurchase = async () => {
        if (!user || !firestore || !courseId || !course || finalPrice === null) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process purchase.' });
            return;
        }

        setIsProcessing(true);
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(doc(firestore, 'users', user.uid));
                const studentName = userDoc.exists() ? userDoc.data().name : 'Unknown Student';
                
                // If a promo code is applied, validate it again within the transaction
                if (appliedPromo) {
                    const promoDocRef = doc(firestore, 'promoCodes', appliedPromo.id);
                    const promoDoc = await transaction.get(promoDocRef);
                    if (!promoDoc.exists() || !promoDoc.data().isActive || promoDoc.data().usedBy?.includes(user.uid)) {
                        throw new Error("This promo code is no longer valid.");
                    }
                    // Mark promo as used
                    transaction.update(promoDocRef, { usedBy: arrayUnion(user.uid) });
                }

                // Create the ticket
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
                    appliedPromoCode: appliedPromo ? appliedPromo.id : null,
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
                };
                transaction.set(newTicketRef, ticketPayload);

                // Enroll user in the course
                const userDocRef = doc(firestore, 'users', user.uid);
                transaction.update(userDocRef, {
                    'studentProfile.enrolledCourses': arrayUnion(courseId),
                });
            });

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate payment processing

            toast({
                title: 'Purchase Successful!',
                description: `You have successfully enrolled in "${course?.title}".`,
            });
            
            router.push('/dashboard/courses');

        } catch (error: any) {
            console.error('Failed to enroll in course:', error);
            toast({ variant: 'destructive', title: 'Purchase Failed', description: error.message || 'Could not complete the purchase.' });
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
                         <div className="space-y-2">
                             <label htmlFor="promo-code" className="font-medium">Promo Code</label>
                             <div className="flex gap-2">
                                 <Input 
                                    id="promo-code" 
                                    placeholder="Enter code" 
                                    value={promoCodeInput}
                                    onChange={(e) => setPromoCodeInput(e.target.value)}
                                    disabled={!!appliedPromo}
                                />
                                {appliedPromo ? (
                                    <Button variant="destructive" onClick={handleRemovePromo}>
                                        <X className="mr-2 h-4 w-4" /> Remove
                                    </Button>
                                ) : (
                                    <Button onClick={handleApplyPromo} disabled={isApplying}>
                                        {isApplying ? 'Applying...' : 'Apply'}
                                    </Button>
                                )}
                             </div>
                         </div>
                         <div className="border-t border-b py-4 space-y-2">
                             <div className="flex justify-between items-center text-md text-muted-foreground">
                                <span>Original Price</span>
                                <span>₹{Number(course.price).toFixed(2)}</span>
                             </div>
                              {appliedPromo && (
                                <div className="flex justify-between items-center text-md text-green-600">
                                    <span>Discount ({appliedPromo.percentage}%)</span>
                                    <span>- ₹{(Number(course.price) * (appliedPromo.percentage / 100)).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                                <span className="text-foreground">Total to Pay</span>
                                <span className="text-2xl">₹{finalPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                         {appliedPromo && (
                            <div className="!mt-4">
                                <div className="bg-green-100 text-green-800 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                    <BadgePercent className="h-5 w-5" />
                                    <p className="font-semibold">{appliedPromo.id} applied! You're saving {appliedPromo.percentage}%.</p>
                                </div>
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
                                    <Ticket className="mr-2 h-5 w-5 animate-pulse" />
                                    Processing Purchase...
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
