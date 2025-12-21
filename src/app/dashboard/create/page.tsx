
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BookCopy, Video } from "lucide-react";

const creationOptions = [
  {
    title: "Create a Course",
    description: "Build a multi-lesson course with text, videos, and quizzes.",
    href: "/dashboard/create/courses",
    icon: BookCopy,
  },
  {
    title: "Set Up Classes",
    description: "Manage your availability for live one-on-one teaching sessions.",
    href: "/dashboard/create/classes",
    icon: Video,
  },
];

export default function CreatePage() {
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  if (userRole === null) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (userRole !== "Teacher") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          This section is only available for teachers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create Content</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Share your knowledge by creating courses or setting up live classes.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-2">
        {creationOptions.map((option, index) => (
          <ScrollReveal key={option.title} delay={index * 0.1}>
            <Link href={option.href}>
              <Card className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-primary/20 hover:scale-105">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 text-primary p-4 rounded-lg">
                    <option.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{option.title}</CardTitle>
                    <CardDescription className="mt-1">{option.description}</CardDescription>
                  </div>
                </CardHeader>
                <div className="absolute top-4 right-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1">
                    <ArrowRight className="w-5 h-5" />
                </div>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
