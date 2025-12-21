
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for teacher-created courses
const courses = [
  {
    id: "course-calc-101",
    title: "Introduction to Calculus",
    author: "Dr. Evelyn Reed",
    description: "Master the fundamentals of calculus, from limits to derivatives and basic integration. Perfect for beginners.",
    coverImage: "https://picsum.photos/seed/course-calculus/600/400",
    imageHint: "calculus graph",
    price: "49.99",
    category: "Mathematics",
    difficulty: "Beginner",
    lessons: 25,
  },
  {
    id: "course-python-mastery",
    title: "Python for Data Science",
    author: "John Smith",
    description: "Learn Python programming and its application in data analysis, visualization, and machine learning.",
    coverImage: "https://picsum.photos/seed/course-python/600/400",
    imageHint: "python code",
    price: "79.99",
    category: "Computer Science",
    difficulty: "Intermediate",
    lessons: 40,
  },
  {
    id: "course-ww2-deep-dive",
    title: "World War II: A Deep Dive",
    author: "Prof. Eleanor Vance",
    description: "Explore the causes, major events, and consequences of World War II through detailed lectures and primary sources.",
    coverImage: "https://picsum.photos/seed/course-ww2/600/400",
    imageHint: "history war",
    price: "39.99",
    category: "History",
    difficulty: "Beginner",
    lessons: 18,
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Available Courses</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Expand your knowledge with courses created by our expert teachers.
        </p>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <ScrollReveal key={course.id} delay={index * 0.1}>
            <Card className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl h-full flex flex-col">
              <Image
                src={course.coverImage}
                alt={course.title}
                width={600}
                height={400}
                className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={course.imageHint}
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <Badge variant="outline">{course.category}</Badge>
                       <Badge variant="secondary">{course.difficulty}</Badge>
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">by {course.author}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-secondary/50 p-4">
                 <p className="text-2xl font-bold text-primary">${course.price}</p>
                 <Button asChild>
                    <Link href="#">View Course</Link>
                 </Button>
              </CardFooter>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
