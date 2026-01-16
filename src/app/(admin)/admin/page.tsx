
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketsTable } from "@/components/admin/TicketsTable";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { firestore } = useFirebase();

  const allTicketsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tickets') : null, [firestore]);
  const { data: allTickets, isLoading: areTicketsLoading } = useCollection(allTicketsQuery);

  const ticketStats = React.useMemo(() => {
      const initialStats = {
          PAID: { count: 0, color: "bg-green-100 text-green-800" },
          ACTIVE: { count: 0, color: "bg-blue-100 text-blue-800" },
          COMPLETED: { count: 0, color: "bg-gray-100 text-gray-800" },
          CANCELLED: { count: 0, color: "bg-yellow-100 text-yellow-800" },
          REFUND_PROCESSED: { count: 0, color: "bg-red-100 text-red-800" },
      };

      if (allTickets) {
          allTickets.forEach(ticket => {
              const status = ticket.status as keyof typeof initialStats;
              if (initialStats[status]) {
                  initialStats[status].count++;
              }
          });
      }
      
      return Object.entries(initialStats).map(([status, data]) => ({
          status: status === 'REFUND_PROCESSED' ? 'REFUNDED' : status,
          count: data.count,
          color: data.color,
      }));
  }, [allTickets]);

  return (
    <div className="space-y-8">
       <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Tickets Overview</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all lecture tickets.</p>
      </ScrollReveal>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {areTicketsLoading ? (
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : (
          ticketStats.map((stat, index) => (
            <ScrollReveal key={stat.status} delay={index * 0.05}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.status.replace(/_/g, ' ')}</CardTitle>
                  <Badge className={stat.color}>{stat.count}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <p className="text-xs text-muted-foreground">tickets</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))
        )}
      </div>

       <ScrollReveal delay={0.3}>
          <Card>
            <CardHeader>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>A complete list of all tickets processed on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketsTable />
            </CardContent>
          </Card>
      </ScrollReveal>
    </div>
  );
}
