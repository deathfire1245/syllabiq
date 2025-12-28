
"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Placeholder data
const sessionsData = [
  {
    ticketId: "TKT-12345",
    studentName: "Alex Johnson",
    teacherName: "Dr. Evelyn Reed",
    status: "COMPLETED",
    joinTime: "2024-08-01 10:01 AM",
    duration: "59 mins",
  },
  {
    ticketId: "TKT-67890",
    studentName: "Sam Lee",
    teacherName: "Prof. Eleanor Vance",
    status: "ONGOING",
    joinTime: "2024-08-01 02:00 PM",
    duration: "32 mins",
  },
  {
    ticketId: "TKT-11223",
    studentName: "Jessica Wong",
    teacherName: "John Smith",
    status: "NO_SHOW",
    joinTime: "-",
    duration: "-",
  },
   {
    ticketId: "TKT-44556",
    studentName: "Michael Brown",
    teacherName: "Dr. Evelyn Reed",
    status: "COMPLETED",
    joinTime: "2024-07-30 09:05 AM",
    duration: "62 mins",
  },
];

const statusStyles: { [key: string]: string } = {
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  ONGOING: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse",
  NO_SHOW: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export function SessionsTable() {
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
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
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
            {sessionsData.map((session) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
