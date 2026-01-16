
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

const statusStyles: { [key: string]: string } = {
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  ONGOING: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse",
  NO_SHOW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export function SessionsTable() {
  const { firestore } = useFirebase();
  const [filter, setFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "tickets"), where("status", "in", ["ACTIVE", "COMPLETED", "CANCELLED"]));
  }, [firestore]);

  const { data: tickets, isLoading } = useCollection(ticketsQuery);
  
  const sessionsData = React.useMemo(() => {
    if (!tickets) return [];
    
    let derivedSessions = tickets.map(ticket => {
        let status = ticket.status;
        if (ticket.status === 'ACTIVE') status = 'ONGOING';
        if (ticket.status === 'CANCELLED' && ticket.cancelReason === 'TEACHER_NO_SHOW') status = 'NO_SHOW';

        const joinTime = ticket.checkInTime ? format(ticket.checkInTime.toDate(), "yyyy-MM-dd hh:mm a") : "-";
        
        let duration = "-";
        if (ticket.activatedAt && ticket.completedAt) {
            const end = ticket.completedAt.toDate();
            const start = ticket.activatedAt.toDate();
            duration = formatDistanceToNow(end, { addSuffix: false, unit: 'minute' });
        } else if (status === 'ONGOING' && ticket.activatedAt) {
            duration = formatDistanceToNow(new Date(), { addSuffix: true, unit: 'minute', includeSeconds: true}).replace('about ','');
        }

      return {
        ticketId: ticket.ticketCode,
        studentName: ticket.studentName,
        teacherName: ticket.teacherName,
        status,
        joinTime,
        duration,
      };
    });
    
    if (filter !== 'all') {
      derivedSessions = derivedSessions.filter(s => s.status === filter);
    }

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        derivedSessions = derivedSessions.filter(s => 
            s.studentName.toLowerCase().includes(lowercasedFilter) || 
            s.teacherName.toLowerCase().includes(lowercasedFilter)
        );
    }
    
    return derivedSessions;

  }, [tickets, filter, searchTerm]);


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
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
        </Select>
         <Input type="date" className="w-[180px]" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/80">
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Join Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center"><Skeleton className="h-24 w-full" /></TableCell></TableRow>
            ) : sessionsData && sessionsData.length > 0 ? (
                sessionsData.map((session) => (
                  <TableRow key={session.ticketId} className="hover:bg-accent transition-colors">
                    <TableCell className="font-mono text-xs">{session.ticketId}</TableCell>
                    <TableCell>{session.studentName}</TableCell>
                    <TableCell>{session.teacherName}</TableCell>
                    <TableCell>{session.joinTime}</TableCell>
                    <TableCell>{session.duration}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={statusStyles[session.status]}>{session.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
                <TableRow><TableCell colSpan={6} className="text-center">No session data available.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
