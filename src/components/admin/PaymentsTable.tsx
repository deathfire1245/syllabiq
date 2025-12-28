
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { DollarSign } from "lucide-react";

// Placeholder data
const paymentsData = [
  {
    paymentId: "PAY-987654",
    studentName: "Alex Johnson",
    teacherName: "Dr. Evelyn Reed",
    amount: 60.00,
    commission: 6.00,
    netAmount: 54.00,
    status: "READY_FOR_PAYOUT",
  },
  {
    paymentId: "PAY-123456",
    studentName: "Sam Lee",
    teacherName: "Prof. Eleanor Vance",
    amount: 55.00,
    commission: 5.50,
    netAmount: 49.50,
    status: "PAID_OUT",
  },
  {
    paymentId: "PAY-789012",
    studentName: "Jessica Wong",
    teacherName: "John Smith",
    amount: 75.00,
    commission: 7.50,
    netAmount: 67.50,
    status: "HELD",
  },
  {
    paymentId: "PAY-345678",
    studentName: "Michael Brown",
    teacherName: "Dr. Evelyn Reed",
    amount: 60.00,
    commission: 6.00,
    netAmount: 54.00,
    status: "REFUNDED",
  },
];

const statusStyles: { [key: string]: string } = {
  READY_FOR_PAYOUT: "bg-green-100 text-green-800 border-green-200",
  PAID_OUT: "bg-gray-100 text-gray-800 border-gray-200",
  HELD: "bg-blue-100 text-blue-800 border-blue-200",
  REFUNDED: "bg-red-100 text-red-800 border-red-200",
};

export function PaymentsTable() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Filter by Student or Teacher..." className="max-w-xs" />
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="HELD">Held</SelectItem>
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
              <TableHead>Student</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Net Payout</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData.map((payment) => (
              <TableRow key={payment.paymentId} className="hover:bg-accent transition-colors">
                <TableCell className="font-mono text-xs">{payment.paymentId}</TableCell>
                <TableCell>{payment.studentName}</TableCell>
                <TableCell>{payment.teacherName}</TableCell>
                <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right text-muted-foreground">${payment.commission.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">${payment.netAmount.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={statusStyles[payment.status]}>{payment.status.replace(/_/g, ' ')}</Badge>
                </TableCell>
                <TableCell className="text-center space-x-2">
                    {payment.status === 'READY_FOR_PAYOUT' && (
                        <Button variant="outline" size="sm" className="h-8">
                            <DollarSign className="w-4 h-4 mr-1" /> Mark as Paid
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
