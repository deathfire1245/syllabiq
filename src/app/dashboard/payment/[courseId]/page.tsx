
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BadgePercent, X, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollReveal } from '@/components/ScrollReveal';
import Link from 'next/link';
import { upiLinks, allowedPromoCodes } from '@/lib/upi-links';

export default function MockPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const courseId = params.courseId as string;

    const { firestore } = useFirebase();
    const { isUserLoading } = useUser();

    const courseDocRef = useMemoFirebase(() => {
        if (!firestore || !courseId) return null;
        return doc(firestore, 'courses', courseId);
    }, [firestore, courseId]);
    const { data: course, isLoading: isCourseLoading } = useDoc(courseDocRef);

    const [promoCodeInput, setPromoCodeInput] = React.useState("");
    const [appliedPromo, setAppliedPromo] = React.useState<string | null>(null);
    const [isApplying, setIsApplying] = React.useState(false);

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

    const handleApplyPromo = () => {
        if (!promoCodeInput.trim()) {
            toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please enter a promo code.' });
            return;
        }
        if (!course) return;

        setIsApplying(true);
        const code = promoCodeInput.trim().toUpperCase();
        
        const isValid = allowedPromoCodes.map(c => c.toUpperCase()).includes(code);

        setTimeout(() => {
            if (isValid) {
                const coursePrice = String(course.price);
                const links = upiLinks[coursePrice];
                if (links) {
                    setUpiLink(links.discounted);
                    const discountedAmount = new URLSearchParams(new URL(links.discounted.replace('upi://', 'http://')).search).get('am');
                    setDisplayPrices(prev => prev ? { ...prev, final: Number(discountedAmount) } : null);
                    setAppliedPromo(code);
                    toast({ title: 'Success!', description: `Promo code "${code}" applied.` });
                }
            } else {
                toast({ variant: 'destructive', title: 'Promo Code Error', description: "This promo code is not valid." });
                handleRemovePromo();
            }
            setIsApplying(false);
        }, 500);
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
                                <span>₹{displayPrices?.base.toFixed(2)}</span>
                             </div>
                              {appliedPromo && displayPrices && (displayPrices.final < displayPrices.base) && (
                                <div className="flex justify-between items-center text-md text-green-600">
                                    <span>Discount</span>
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
                    <CardFooter>
                        <Button 
                            asChild
                            className="w-full h-12 text-lg" 
                            disabled={upiLink === '#'}
                        >
                            <Link href={upiLink}>
                                Pay with UPI for ₹{displayPrices?.final.toFixed(2)}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </ScrollReveal>
        </div>
    );
}
