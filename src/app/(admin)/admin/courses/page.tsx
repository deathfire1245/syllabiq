"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCoursesTable } from "@/components/admin/AdminCoursesTable";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function AdminCoursesPage() {
  return (
    <div className="space-y-8">
       <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Courses Overview</h1>
              <p className="text-muted-foreground mt-1">Manage all courses created by teachers and admins.</p>
            </div>
            <Button asChild>
              <Link href="/admin/courses/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Course
              </Link>
            </Button>
          </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>A complete list of all courses on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminCoursesTable />
            </CardContent>
          </Card>
      </ScrollReveal>
    </div>
  );
}
