
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { doc, getDoc, runTransaction, collection, addDoc, arrayUnion, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BadgePercent, X, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal } from '@/components/ScrollReveal';
import { upiLinks } from '@/lib/upi-links';

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
    const [appliedPromo, setAppliedPromo] = React.useState<{code: string; percentage: number} | null>(null);
    const [isApplying, setIsApplying] = React.useState(false);
    const [isPurchasing, setIsPurchasing] = React.useState(false);

    const [displayPrices, setDisplayPrices] = React.useState<{ base: number; final: number; } | null>(null);
    const [upiLink, setUpiLink] = React.useState<string>('#');

    React.useEffect(() => {
        if (course) {
            const coursePrice = String(course.price);
            const links = upiLinks[coursePrice];
            if (links) {
                setUpiLink(links.base);
                const baseAmount = new URLSearchParams(new URL(links.base.replace('upi://', 'http://')).search).get('am');
                setDisplayPrices({
                    base: Number(baseAmount),
                    final: Number(baseAmount)
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
        if (!course || !firestore || !user) return;

        setIsApplying(true);
        const code = promoCodeInput.trim().toUpperCase();
        
        const promoDocRef = doc(firestore, "promoCodes", code);
        try {
            const promoDoc = await getDoc(promoDocRef);
            if (promoDoc.exists() && promoDoc.data().isActive) {
                const usedBy = promoDoc.data().usedBy || [];
                if (usedBy.includes(user.uid)) {
                    toast({ variant: 'destructive', title: 'Already Used', description: 'You have already used this promo code.' });
                } else {
                    const discountPercentage = promoDoc.data().percentage || 20; // Default to 20 if not set
                    
                    const links = upiLinks[String(course.price)];
                    if (links) {
                       setUpiLink(links.discounted);
                       const finalAmountFromLink = new URLSearchParams(new URL(links.discounted.replace('upi://', 'http://')).search).get('am');
                       setDisplayPrices(prev => prev ? { ...prev, final: Number(finalAmountFromLink) } : null);
                    }

                    setAppliedPromo({ code, percentage: discountPercentage });
                    toast({ title: 'Success!', description: `Promo code "${code}" applied.` });
                }
            } else {
                toast({ variant: 'destructive', title: 'Invalid Code', description: "The promo code is not valid or has expired." });
            }
        } catch (error) {
             toast({ variant: 'destructive', title: 'Error', description: "Could not validate the promo code." });
             console.error("Promo validation error:", error);
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemovePromo = () => {
        if (!course) return;
        const coursePrice = String(course.price);
        const links = upiLinks[coursePrice];

        if (links) {
            setUpiLink(links.base);
            const baseAmount = new URLSearchParams(new URL(links.base.replace('upi://', 'http://')).search).get('am');
            setDisplayPrices(prev => prev ? { ...prev, final: Number(baseAmount) } : null);
        }
        setAppliedPromo(null);
        setPromoCodeInput("");
        toast({ title: 'Promo code removed.' });
    };

    const handleConfirmPurchase = async () => {
        if (!firestore || !user || !course || !userProfile || !displayPrices) return;
        setIsPurchasing(true);

        try {
            await runTransaction(firestore, async (transaction) => {
                const ticketsCollectionRef = collection(firestore, 'tickets');
                const newTicketRef = doc(ticketsCollectionRef); // Create a new doc reference with an auto-generated ID

                // 1. If promo is applied, validate and update it
                if (appliedPromo) {
                    const promoDocRef = doc(firestore, 'promoCodes', appliedPromo.code);
                    const promoDoc = await transaction.get(promoDocRef);
                    if (!promoDoc.exists() || !promoDoc.data().isActive || (promoDoc.data().usedBy || []).includes(user.uid)) {
                        throw new Error("Promo code is no longer valid.");
                    }
                    transaction.update(promoDocRef, {
                        usedBy: arrayUnion(user.uid)
                    });
                }
                
                // 2. Add course to user's enrolled list
                 const userDocRef = doc(firestore, 'users', user.uid);
                 transaction.update(userDocRef, {
                    'studentProfile.enrolledCourses': arrayUnion(course.id)
                });


                // 3. Create the ticket document
                const newTicketPayload = {
                    orderId: newTicketRef.id,
                    ticketCode: `TKT-${newTicketRef.id.substring(0, 8).toUpperCase()}`,
                    studentId: user.uid,
                    studentName: userProfile.name,
                    teacherId: course.authorId, // Assuming course has authorId
                    teacherName: course.author,
                    saleType: 'COURSE',
                    courseId: course.id,
                    courseTitle: course.title,
                    status: 'PAID',
                    price: displayPrices.base,
                    finalPrice: displayPrices.final,
                    appliedPromoCode: appliedPromo?.code || null,
                    commissionPercent: 10, // Example commission
                    duration: 0, // Not a session
                    createdAt: serverTimestamp(),
                    validFrom: serverTimestamp(), // Or relevant course start date
                    validTill: serverTimestamp(), // Or relevant course end date
                    used: true, // Course access is immediate
                    refundable: false, // Course purchases generally not refundable
                };

                transaction.set(newTicketRef, newTicketPayload);
            });

            toast({ title: "Purchase Successful!", description: `You can now access "${course.title}".`});
            
            // Redirect to UPI link after successful transaction
            router.push(upiLink);
            
        } catch (error: any) {
            console.error("Purchase transaction failed:", error);
            toast({ variant: 'destructive', title: 'Purchase Failed', description: error.message || "Could not complete the purchase. Please try again." });
        } finally {
            setIsPurchasing(false);
        }
    };
    
    const isLoading = isUserLoading || isCourseLoading || isProfileLoading;

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
                                <span>₹{displayPrices?.base.toFixed(2)}</span>
                             </div>
                              {appliedPromo && displayPrices && (displayPrices.final < displayPrices.base) && (
                                <div className="flex justify-between items-center text-md text-green-600">
                                    <span>Discount ({appliedPromo.percentage}%)</span>
                                    <span>- ₹{(displayPrices.base - displayPrices.final).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                                <span className="text-foreground">Total to Pay</span>
                                <span className="text-2xl">₹{displayPrices?.final.toFixed(2)}</span>
                            </div>
                        </div>
                         {appliedPromo && (
                            <div className="!mt-4">
                                <div className="bg-green-100 text-green-800 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                    <BadgePercent className="h-5 w-5" />
                                    <p className="font-semibold">Promo code "{appliedPromo.code}" applied!</p>
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
                    <CardFooter>
                        <Button 
                            onClick={handleConfirmPurchase}
                            className="w-full h-12 text-lg" 
                            disabled={isPurchasing || upiLink === '#'}
                        >
                            {isPurchasing ? 'Processing...' : `Pay with UPI for ₹${displayPrices?.final.toFixed(2)}`}
                        </Button>
                    </CardFooter>
                </Card>
            </ScrollReveal>
        </div>
    );
}
