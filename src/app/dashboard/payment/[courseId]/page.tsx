'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BadgePercent, X, IndianRupee, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal } from '@/components/ScrollReveal';
import { upiLinks } from '@/lib/upi-links';


// Helper function to extract amount from UPI string
const getAmountFromUpiString = (upiString: string | undefined): number => {
    if (!upiString) return 0;
    try {
        const url = new URL(upiString.replace('upi://', 'http://'));
        const amount = url.searchParams.get('am');
        return amount ? parseFloat(amount) : 0;
    } catch (e) {
        console.error("Error parsing UPI string:", e);
        return 0;
    }
};

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

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

    const [promoCodeInput, setPromoCodeInput] = React.useState("");
    const [appliedPromo, setAppliedPromo] = React.useState<string | null>(null);
    const [isApplying, setIsApplying] = React.useState(false);
    const [isPurchasing, setIsPurchasing] = React.useState(false);

    const [paymentDetails, setPaymentDetails] = React.useState<{
        baseAmount: number;
        finalAmount: number;
        upiLink: string;
        discountApplied: boolean;
        discountValue: number;
    }>({
        baseAmount: 0,
        finalAmount: 0,
        upiLink: '#',
        discountApplied: false,
        discountValue: 0
    });

    React.useEffect(() => {
        if (course) {
            const coursePrice = String(course.price);
            const linksForTier = upiLinks[coursePrice as keyof typeof upiLinks];
            
            if (linksForTier) {
                const baseAmount = getAmountFromUpiString(linksForTier.base);
                setPaymentDetails({
                    baseAmount: baseAmount,
                    finalAmount: baseAmount,
                    upiLink: linksForTier.base,
                    discountApplied: false,
                    discountValue: 0,
                });
            } else {
                console.error("Invalid price tier for this course:", coursePrice);
                toast({ variant: 'destructive', title: 'Pricing Error', description: 'This course has an invalid price.' });
            }
        }
    }, [course, toast]);

    const handleApplyPromo = async () => {
        if (!promoCodeInput.trim()) {
            toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter a promo code.' });
            return;
        }
        if (!course || !firestore) return;
        
        setIsApplying(true);
        const code = promoCodeInput.trim().toUpperCase();

        try {
            const promoDoc = await getDoc(doc(firestore, "promoCodes", code));
            if (promoDoc.exists() && promoDoc.data().isActive && !promoDoc.data().usedBy?.includes(user?.uid)) {
                 const coursePrice = String(course.price);
                 const linksForTier = upiLinks[coursePrice as keyof typeof upiLinks];

                 if (linksForTier) {
                    const baseAmount = getAmountFromUpiString(linksForTier.base);
                    const discountedAmount = getAmountFromUpiString(linksForTier.discounted);

                    setPaymentDetails({
                        baseAmount,
                        finalAmount: discountedAmount,
                        upiLink: linksForTier.discounted,
                        discountApplied: true,
                        discountValue: baseAmount - discountedAmount,
                    });
                    setAppliedPromo(code);
                    toast({ title: 'Success!', description: `Promo code "${code}" applied.` });
                }
            } else {
                 toast({ variant: 'destructive', title: 'Invalid Code', description: "The promo code is not found, inactive, or already used." });
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: "Could not validate the promo code." });
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemovePromo = () => {
        if (!course) return;
        const coursePrice = String(course.price);
        const linksForTier = upiLinks[coursePrice as keyof typeof upiLinks];

        if (linksForTier) {
            const baseAmount = getAmountFromUpiString(linksForTier.base);
            setPaymentDetails({
                baseAmount: baseAmount,
                finalAmount: baseAmount,
                upiLink: linksForTier.base,
                discountApplied: false,
                discountValue: 0,
            });
        }
        setAppliedPromo(null);
        setPromoCodeInput("");
        toast({ title: 'Promo code removed.' });
    };

    const handleInitiatePurchase = async () => {
        if (!firestore || !user || !course || !userProfile || paymentDetails.upiLink === '#') return;
        
        setIsPurchasing(true);
        
        const newTicketPayload = {
            orderId: `mock_${Date.now()}`,
            ticketCode: `TKT-${Date.now().toString().slice(-8)}`,
            studentId: user.uid,
            studentName: userProfile.name || "",
            teacherId: course.authorId,
            teacherName: course.author,
            saleType: 'COURSE',
            courseId: course.id,
            courseTitle: course.title,
            status: 'INITIATED',
            price: paymentDetails.baseAmount,
            finalPrice: paymentDetails.finalAmount,
            appliedPromoCode: appliedPromo || "N/A",
            commissionPercent: 10,
            createdAt: serverTimestamp(),
            validFrom: serverTimestamp(),
            validTill: serverTimestamp(),
            used: false,
            refundable: false,
        };

        try {
            const ticketsCollectionRef = collection(firestore, 'tickets');
            const ticketDocRef = await addDoc(ticketsCollectionRef, newTicketPayload);
            
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                toast({ title: "Purchase Initiated!", description: "Redirecting to payment..." });
                window.location.href = paymentDetails.upiLink;
            } else {
                await updateDoc(ticketDocRef, { status: 'APP_NOT_AVAILABLE' });
                toast({ 
                    variant: 'destructive', 
                    title: 'Payment App Not Found', 
                    description: 'Please use a mobile device with a UPI app installed to complete the payment.' 
                });
                setIsPurchasing(false);
            }

        } catch (error: any) {
            console.error("Purchase initiation failed:", error);
            if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: 'tickets',
                    operation: 'create',
                    requestResourceData: newTicketPayload,
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                 toast({ variant: 'destructive', title: 'Purchase Failed', description: error.message || "Could not initiate the purchase. Please try again." });
            }
            setIsPurchasing(false);
        }
    };
    
    const isLoading = isUserLoading || isCourseLoading || isProfileLoading;
    const isEnrolled = userProfile?.studentProfile?.enrolledCourses?.includes(courseId);


    if (isLoading) {
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

    if (isEnrolled) {
        return (
             <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                <ScrollReveal>
                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                        <CardTitle className="text-2xl">Already Enrolled</CardTitle>
                        <CardDescription>
                            You already have access to this course.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <Button onClick={() => router.push(`/dashboard/courses/${courseId}`)}>
                            Go to Course
                        </Button>
                        </CardContent>
                    </Card>
                </ScrollReveal>
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
                                    disabled={!!appliedPromo || isApplying}
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
                                <span>₹{paymentDetails.baseAmount.toFixed(2)}</span>
                             </div>
                              {paymentDetails.discountApplied && (
                                <div className="flex justify-between items-center text-md text-green-600">
                                    <span>Discount</span>
                                    <span>- ₹{paymentDetails.discountValue.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                                <span className="text-foreground">Total to Pay</span>
                                <span className="text-2xl">₹{paymentDetails.finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                         {appliedPromo && (
                            <div className="!mt-4">
                                <div className="bg-green-100 text-green-800 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                    <BadgePercent className="h-5 w-5" />
                                    <p className="font-semibold">Promo code "{appliedPromo}" applied!</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold mb-2">Payment Method</h3>
                            <div className="border rounded-lg p-4 bg-secondary/50 flex items-center gap-4">
                                <IndianRupee className="w-6 h-6 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">UPI (Unified Payments Interface)</p>
                                    <p className="text-sm text-muted-foreground">You will be redirected to your UPI app to complete the payment.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button 
                            onClick={handleInitiatePurchase}
                            className="w-full h-12 text-lg" 
                            disabled={isPurchasing || paymentDetails.upiLink === '#'}
                        >
                            {isPurchasing ? 'Processing...' : `Pay with UPI for ₹${paymentDetails.finalAmount.toFixed(2)}`}
                        </Button>
                    </CardFooter>
                </Card>
            </ScrollReveal>
        </div>
    );
}
