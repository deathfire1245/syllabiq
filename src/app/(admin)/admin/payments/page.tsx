
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function PaymentsPage() {
  return (
    <div className="space-y-8">
       <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Payments Overview</h1>
          <p className="text-muted-foreground mt-1">Track all financial transactions.</p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>All Payments</CardTitle>
              <CardDescription>A log of every payment, commission, and net amount.</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentsTable />
            </CardContent>
          </Card>
      </ScrollReveal>
    </div>
  );
}
