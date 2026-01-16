
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";

const statusStyles: { [key: string]: string } = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  ACTIVE: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  CANCELLED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  REFUND_PROCESSED: "bg-red-100 text-red-800 border-red-200",
  WAITING_FOR_TEACHER: "bg-purple-100 text-purple-800 border-purple-200",
};

export function TicketsTable() {
  const { firestore } = useFirebase();
  const [filter, setFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const ticketsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tickets') : null, [firestore]);
  const { data: ticketsData, isLoading } = useCollection(ticketsQuery);
  
  const filteredTickets = React.useMemo(() => {
    if (!ticketsData) return [];
    
    let filtered = ticketsData;

    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filtered = filtered.filter(t => 
            t.studentName?.toLowerCase().includes(lowercasedFilter) || 
            t.teacherName?.toLowerCase().includes(lowercasedFilter)
        );
    }
    
    return filtered;
  }, [ticketsData, filter, searchTerm]);


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Filter by Student or Teacher..." 
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
              <TableHead className="text-center">Refundable</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center"><Skeleton className="h-24 w-full" /></TableCell></TableRow>
            ) : filteredTickets && filteredTickets.length > 0 ? (
               filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-accent transition-colors">
                  <TableCell className="font-mono text-xs">{ticket.ticketCode}</TableCell>
                  <TableCell>{ticket.studentName}</TableCell>
                  <TableCell>{ticket.teacherName}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={statusStyles[ticket.status]}>{ticket.status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                      {ticket.refundable ? <Badge variant="destructive">YES</Badge> : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-center space-x-2">
                      <Button variant="outline" size="sm" className="h-8" disabled={!ticket.refundable}>Refund Student</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center">No tickets found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
