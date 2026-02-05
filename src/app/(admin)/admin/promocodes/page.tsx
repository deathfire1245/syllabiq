"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PromoCodesTable } from "@/components/admin/PromoCodesTable";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgePercent, PlusCircle } from "lucide-react";
import { useFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function PromoCodesPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [code, setCode] = React.useState("");
  const [percentage, setPercentage] = React.useState("30");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddCode = async () => {
    if (!code.trim() || !percentage.trim()) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide a code and a percentage." });
      return;
    }
    if (!firestore) {
        toast({ variant: "destructive", title: "Database Error", description: "Could not connect to the database." });
        return;
    }

    setIsSubmitting(true);
    const codeId = code.trim().toUpperCase();
    const payload = {
        code: codeId,
        percentage: Number(percentage),
        isActive: true,
        usedBy: [],
    };

    try {
        const promoDocRef = doc(firestore, "promoCodes", codeId);
        await setDoc(promoDocRef, payload);
        toast({ title: "Success!", description: `Promo code "${codeId}" has been created.` });
        setCode("");
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Could not create the promo code." });
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-8">
       <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Promo Code Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage discount codes for users.</p>
      </ScrollReveal>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <ScrollReveal className="lg:col-span-1" delay={0.05}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Create New Code
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Promo Code</Label>
                        <Input id="code" placeholder="e.g., WELCOME30" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="percentage">Discount Percentage</Label>
                        <div className="relative">
                            <Input id="percentage" type="number" placeholder="e.g., 30" value={percentage} onChange={(e) => setPercentage(e.target.value)} className="pl-8"/>
                            <BadgePercent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    <Button onClick={handleAddCode} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Creating..." : "Create Code"}
                    </Button>
                </CardContent>
            </Card>
        </ScrollReveal>

        <ScrollReveal className="lg:col-span-2" delay={0.1}>
            <Card>
                <CardHeader>
                <CardTitle>All Promo Codes</CardTitle>
                <CardDescription>A list of all promotional codes on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                <PromoCodesTable />
                </CardContent>
            </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
