
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionsTable } from "@/components/admin/SessionsTable";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Sessions Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor all ongoing and past lecture sessions.</p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>A complete log of every session that has occurred on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionsTable />
            </CardContent>
          </Card>
      </ScrollReveal>
    </div>
  );
}
