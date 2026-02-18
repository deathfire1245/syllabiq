
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCollection, useFirebase, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/contexts/SearchContext";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/lib/types";
import { Layers, BookOpen } from "lucide-react";

const formatDuration = (minutes: number) => {
  if (!minutes || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) return `${hours}h ${remainingMinutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${remainingMinutes}m`;
};


export default function CoursesPage() {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { searchTerm } = useSearch();
  const { toast } = useToast();
  const [addingCourseId, setAddingCourseId] = React.useState<string | null>(null);

  const coursesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'courses');
  }, [firestore]);

  const { data: courses, isLoading } = useCollection<Course>(coursesQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, mutate: mutateUserProfile } = useDoc(userDocRef);
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

  const handleAddToLibrary = async (courseId: string) => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "You must be logged in." });
      return;
    }
    setAddingCourseId(courseId);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        'studentProfile.enrolledCourses': arrayUnion(courseId)
      });

      // Optimistically update local state
      if (userProfile?.studentProfile) {
        mutateUserProfile({
            ...userProfile,
            studentProfile: {
                ...userProfile.studentProfile,
                enrolledCourses: [...(userProfile.studentProfile.enrolledCourses || []), courseId]
            }
        })
      }

      toast({ title: "Success!", description: "The course has been added to your library." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not add course to library." });
    } finally {
      setAddingCourseId(null);
    }
  };


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
              const isFree = course.price === '0';
              const durationText = formatDuration(course.totalDuration);
              return (
              <ScrollReveal key={course.id} delay={index * 0.1}>
                <Card className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                  <Link href={`/dashboard/courses/${course.id}`} className="flex flex-col flex-grow">
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
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 pt-4 border-t">
                            {course.modulesCount > 0 && <span className="flex items-center gap-1.5"><Layers className="w-4 h-4" />{course.modulesCount} modules</span>}
                            {course.lessonsCount > 0 && <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{course.lessonsCount} lessons</span>}
                            {durationText && <span className="flex items-center gap-1.5">{durationText}</span>}
                        </div>
                    </CardContent>
                  </Link>
                  <CardFooter className="flex justify-between items-center bg-secondary/50 p-4 mt-auto">
                     {isFree ? (
                        <p className="text-2xl font-bold text-primary">Free</p>
                      ) : (
                        <div className="flex flex-col">
                            <p className="text-2xl font-bold text-primary">₹{course.price}</p>
                            <Badge variant="destructive" className="w-fit mt-1 text-xs">20% OFF with promo</Badge>
                        </div>
                      )}
                     
                     {isEnrolled ? (
                        <Button asChild>
                            <Link href={`/dashboard/courses/${course.id}`}>View Course</Link>
                        </Button>
                      ) : isFree ? (
                        <Button onClick={() => handleAddToLibrary(course.id)} disabled={addingCourseId === course.id}>
                            {addingCourseId === course.id ? 'Adding...' : 'Add to Library'}
                        </Button>
                      ) : (
                        <Button asChild>
                            <Link href={`/dashboard/payment/${course.id}`}>Buy</Link>
                        </Button>
                      )}
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
