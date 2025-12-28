
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Placeholder data
const ticketsData = [
  {
    ticketId: "TKT-12345",
    studentName: "Alex Johnson",
    teacherName: "Dr. Evelyn Reed",
    status: "PAID",
  },
  {
    ticketId: "TKT-67890",
    studentName: "Sam Lee",
    teacherName: "Prof. Eleanor Vance",
    status: "ACTIVE",
  },
  {
    ticketId: "TKT-11223",
    studentName: "Jessica Wong",
    teacherName: "John Smith",
    status: "COMPLETED",
  },
  {
    ticketId: "TKT-44556",
    studentName: "Michael Brown",
    teacherName: "Dr. Evelyn Reed",
    status: "CANCELLED",
  },
   {
    ticketId: "TKT-99887",
    studentName: "Emily Davis",
    teacherName: "Prof. Eleanor Vance",
    status: "REFUND_PROCESSED",
  },
];

const statusStyles: { [key: string]: string } = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  ACTIVE: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  CANCELLED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  REFUND_PROCESSED: "bg-red-100 text-red-800 border-red-200",
  WAITING_FOR_TEACHER: "bg-purple-100 text-purple-800 border-purple-200",
};

export function TicketsTable() {
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
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="WAITING_FOR_TEACHER">Waiting</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUND_PROCESSED">Refunded</SelectItem>
            </SelectContent>
        </Select>
        <Input type="date" className="w-[180px]" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/80">
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Teacher Name</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticketsData.map((ticket) => (
              <TableRow key={ticket.ticketId} className="hover:bg-accent transition-colors">
                <TableCell className="font-mono text-xs">{ticket.ticketId}</TableCell>
                <TableCell>{ticket.studentName}</TableCell>
                <TableCell>{ticket.teacherName}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={statusStyles[ticket.status]}>{ticket.status.replace(/_/g, ' ')}</Badge>
                </TableCell>
                <TableCell className="text-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8">Refund Student</Button>
                    <Button variant="outline" size="sm" className="h-8">Release Payment</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
