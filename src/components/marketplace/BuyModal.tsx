"use client";

import * as React from "react";
import { Product } from "@/lib/product-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { IndianRupee, CheckCircle, Download } from "lucide-react";
import { upiLinks } from "@/lib/upi-links";
import { doc, updateDoc } from "firebase/firestore";

interface BuyModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BuyModal({ product, isOpen, onClose }: BuyModalProps) {
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [step, setStep] = React.useState<"info" | "payment" | "success">("info");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);
  const [pendingOrderId, setPendingOrderId] = React.useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const [deliveryInfo, setDeliveryInfo] = React.useState({
    name: "",
    address: "",
    phone: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setStep(product?.category === "physical" ? "info" : "payment");
      setOrderId(null);
      setAwaitingConfirmation(false);
      setPendingOrderId(null);
    }
  }, [isOpen, product]);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryInfo.name || !deliveryInfo.address || !deliveryInfo.phone) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please fill all delivery details." });
      return;
    }

    // Basic 10-digit phone validation (Indian standards start with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(deliveryInfo.phone)) {
      toast({ 
        variant: "destructive", 
        title: "Invalid Phone Number", 
        description: "Please enter a valid 10-digit mobile number." 
      });
      return;
    }

    setStep("payment");
  };

  const handlePurchase = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      toast({
        variant: 'destructive',
        title: 'Mobile Device Required',
        description: 'UPI payments can only be completed on a mobile device with a UPI app installed. Please open this page on your phone.',
      });
      return;
    }

    if (!product || !auth.currentUser || !firestore) return;
    setIsProcessing(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          deliveryInfo: product.category === "physical" ? deliveryInfo : {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPendingOrderId(result.orderId);
        setAwaitingConfirmation(true);
        
        // Handle UPI redirection
        const upiData = upiLinks[String(product.price)] || {
          base: `upi://pay?pa=9347229296@ibl&pn=SyllabiQ&am=${product.price}.00&cu=INR&tn=MarketplacePurchase`,
        };

        window.location.href = upiData.base;
        toast({ title: "Purchase Initiated!", description: "Redirecting to your UPI app..." });
      } else {
        throw new Error(result.error || "Purchase failed");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!firestore || !pendingOrderId || !auth.currentUser) return;
    setIsPurchasing(true);
    try {
      await updateDoc(doc(firestore, 'productOrders', pendingOrderId), {
        status: 'PAID',
      });
      toast({ title: 'Purchase Successful!', description: 'Your order has been confirmed.' });
      setOrderId(pendingOrderId);
      setStep("success");
      setAwaitingConfirmation(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not confirm payment. Please contact support.' });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!firestore || !pendingOrderId) return;
    try {
      await updateDoc(doc(firestore, 'productOrders', pendingOrderId), {
        status: 'CANCELLED',
      });
    } catch (e) {
      console.error('Could not cancel order:', e);
    }
    setAwaitingConfirmation(false);
    setPendingOrderId(null);
    setIsPurchasing(false);
    toast({ title: 'Payment Cancelled', description: 'Your order has been cancelled.' });
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {awaitingConfirmation ? (
          <div className="text-center space-y-6 py-6">
            <IndianRupee className="w-12 h-12 mx-auto text-primary mb-4" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Did you complete the payment?</h3>
              <p className="text-sm text-muted-foreground">
                Please confirm only after your UPI app shows a successful transaction.
              </p>
            </div>
            <div className="space-y-3">
              <Button className="w-full" onClick={handleConfirmPayment} disabled={isPurchasing}>
                {isPurchasing ? "Confirming..." : "✅ Yes, Payment Successful"}
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleCancelPayment} disabled={isPurchasing}>
                ❌ No, Payment Failed / I did not pay
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{step === "success" ? "Order Confirmed!" : "Checkout"}</DialogTitle>
              <DialogDescription>
                {step === "info" && "Provide your delivery details."}
                {step === "payment" && `Complete your payment for ${product.title}.`}
                {step === "success" && "Thank you for your purchase!"}
              </DialogDescription>
            </DialogHeader>

            {step === "info" && (
              <form onSubmit={handleInfoSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={deliveryInfo.name}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium border-r pr-2 h-5 flex items-center">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      className="pl-14"
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Continue to Payment</Button>
              </form>
            )}

            {step === "payment" && (
              <div className="space-y-6 py-4">
                <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Product</span>
                    <span className="font-medium">{product.title}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{product.price}</span>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-secondary/30 flex items-center gap-4">
                  <IndianRupee className="w-6 h-6 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-semibold">UPI Payment</p>
                    <p className="text-muted-foreground">Secure mobile payment via UPI apps.</p>
                  </div>
                </div>

                <Button onClick={handlePurchase} className="w-full h-12 text-lg" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : `Pay ₹${product.price} with UPI`}
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="text-center space-y-6 py-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Success!</h3>
                  <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
                </div>

                {product.category !== "physical" && product.fileUrl && (
                  <div className="pt-4 space-y-3">
                    <p className="text-sm">Your digital product is ready for download.</p>
                    <Button asChild className="w-full">
                      <a href={product.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download Now
                      </a>
                    </Button>
                  </div>
                )}

                <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
