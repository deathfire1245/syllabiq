"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCollection, useFirebase, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/contexts/SearchContext";

interface Course {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  imageHint: string;
  price: string;
  category: string;
  difficulty: string;
  lessons: number;
}

export default function CoursesPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { searchTerm } = useSearch();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);

  const { data: courses, isLoading } = useCollection<Course>(coursesQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userDocRef);
  const enrolledCourses = userProfile?.studentProfile?.enrolledCourses || [];

  const filteredCourses = React.useMemo(() => {
    if (!courses) return [];
    if (!searchTerm) return courses;
    const lowercasedTerm = searchTerm.toLowerCase();
    return courses.filter(course =>
      course.title.toLowerCase().includes(lowercasedTerm) ||
      course.description.toLowerCase().includes(lowercasedTerm) ||
      course.author.toLowerCase().includes(lowercasedTerm) ||
      course.category.toLowerCase().includes(lowercasedTerm)
    );
  }, [courses, searchTerm]);


  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Available Courses</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Expand your knowledge with courses created by our expert teachers.
        </p>
      </ScrollReveal>
      
      {filteredCourses && filteredCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => {
              const isEnrolled = enrolledCourses.includes(course.id);
              return (
              <ScrollReveal key={course.id} delay={index * 0.1}>
                <Card className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl h-full flex flex-col">
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
                     <p className="text-2xl font-bold text-primary">₹{course.price}</p>
                     <Button asChild>
                        {isEnrolled ? (
                            <Link href={`/dashboard/courses/${course.id}`}>View Course</Link>
                        ) : (
                            <Link href={`/dashboard/payment/${course.id}`}>Buy</Link>
                        )}
                     </Button>
                  </CardFooter>
                </Card>
              </ScrollReveal>
            )})}
          </div>
      ) : (
        <ScrollReveal className="text-center py-16">
            <h2 className="text-2xl font-bold">{searchTerm ? 'No Courses Found' : 'No Courses Available Yet'}</h2>
            <p className="text-muted-foreground mt-2">{searchTerm ? 'Try adjusting your search term.' : 'Check back soon to see courses from our expert teachers!'}</p>
        </ScrollReveal>
      )}
    </div>
  );
}
