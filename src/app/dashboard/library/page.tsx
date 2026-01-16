
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
import { BookCopy } from "lucide-react";

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

export default function LibraryPage() {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: allCourses, isLoading: areCoursesLoading } = useCollection<Course>(coursesQuery);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const enrolledCourses = React.useMemo(() => {
    if (!allCourses || !userProfile?.studentProfile?.enrolledCourses) {
        return [];
    }
    const enrolledIds = userProfile.studentProfile.enrolledCourses;
    return allCourses.filter(course => enrolledIds.includes(course.id));
  }, [allCourses, userProfile]);

  const isLoading = areCoursesLoading || isProfileLoading || isUserLoading;

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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Library</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          All your purchased courses, ready for you to dive in.
        </p>
      </ScrollReveal>
      
      {enrolledCourses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course, index) => (
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
                  <CardFooter className="flex justify-end bg-secondary/50 p-4">
                     <Button asChild>
                        <Link href={`/dashboard/courses/${course.id}`}>View Course</Link>
                     </Button>
                  </CardFooter>
                </Card>
              </ScrollReveal>
            ))}
          </div>
      ) : (
        <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
            <BookCopy className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold">Your Library is Empty</h2>
            <p className="text-muted-foreground mt-2">
              You haven't purchased any courses yet.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/courses">Explore Courses</Link>
            </Button>
        </ScrollReveal>
      )}
    </div>
  );
}
