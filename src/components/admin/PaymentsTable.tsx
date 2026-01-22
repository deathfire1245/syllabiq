"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { IndianRupee } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";

const statusStyles: { [key: string]: string } = {
  READY_FOR_PAYOUT: "bg-green-100 text-green-800 border-green-200",
  PAID_OUT: "bg-gray-100 text-gray-800 border-gray-200",
  REFUNDED: "bg-red-100 text-red-800 border-red-200",
};

export function PaymentsTable() {
    const { firestore } = useFirebase();
    const [filter, setFilter] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');

    const ticketsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "tickets"));
    }, [firestore]);

    const { data: tickets, isLoading } = useCollection(ticketsQuery);

    const paymentsData = React.useMemo(() => {
        if (!tickets) return [];
        
        const courseSaleTickets = tickets.filter(ticket => ticket.saleType === 'COURSE');

        let derivedPayments = courseSaleTickets.map(ticket => {
            const amount = ticket.price || 0;
            const commission = amount * (ticket.commissionPercent || 10) / 100;
            const netAmount = amount - commission;
            let status = "READY_FOR_PAYOUT";
            if (ticket.status === 'REFUND_PROCESSED') status = 'REFUNDED';
            
            return {
                paymentId: `PAY-${ticket.orderId?.slice(-6) || ticket.id.slice(-6)}`,
                ticketId: ticket.id,
                studentName: ticket.studentName,
                teacherName: ticket.teacherName, // This is the author
                courseTitle: ticket.courseTitle,
                amount,
                commission,
                netAmount,
                status,
            };
        });

        if (filter !== 'all') {
            derivedPayments = derivedPayments.filter(p => p.status === filter);
        }
        
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            derivedPayments = derivedPayments.filter(p => 
                p.studentName?.toLowerCase().includes(lowercasedFilter) || 
                p.teacherName?.toLowerCase().includes(lowercasedFilter) ||
                p.courseTitle?.toLowerCase().includes(lowercasedFilter)
            );
        }

        return derivedPayments;
    }, [tickets, filter, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
            placeholder="Filter by Course, Student, or Author..." 
            className="max-w-xs" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="READY_FOR_PAYOUT">Ready for Payout</SelectItem>
                <SelectItem value="PAID_OUT">Paid Out</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/80">
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Author</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Net Payout</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center"><Skeleton className="h-24 w-full" /></TableCell></TableRow>
            ) : paymentsData && paymentsData.length > 0 ? (
                 paymentsData.map((payment) => (
                    <TableRow key={payment.paymentId} className="hover:bg-accent transition-colors">
                        <TableCell className="font-mono text-xs">{payment.paymentId}</TableCell>
                        <TableCell className="font-medium">{payment.courseTitle}</TableCell>
                        <TableCell>{payment.studentName}</TableCell>
                        <TableCell>{payment.teacherName}</TableCell>
                        <TableCell className="text-right font-medium">₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">₹{payment.commission.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">₹{payment.netAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                        <Badge variant="outline" className={statusStyles[payment.status]}>{payment.status.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                            {payment.status === 'READY_FOR_PAYOUT' && (
                                <Button variant="outline" size="sm" className="h-8">
                                    <IndianRupee className="w-4 h-4 mr-1" /> Mark as Paid
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow><TableCell colSpan={9} className="text-center">No course payment data available.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
