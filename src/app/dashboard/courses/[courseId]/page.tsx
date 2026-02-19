
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirebase, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, onSnapshot, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Lock, FileText, Video, Link as LinkIcon, CheckCircle, Clock, BookOpen, Layers, PlayCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Badge } from '@/components/ui/badge';
import type { Course, Module, Lesson } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const formatDuration = (minutes: number) => {
  if (!minutes || minutes <= 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) return `${hours}h ${remainingMinutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${remainingMinutes}m`;
};

// --- Sub-components for clarity ---

const PublicCourseView = ({ course, courseId, handleAddToLibrary, addingCourseId }: { course: Course, courseId: string, handleAddToLibrary: (courseId: string) => Promise<void>, addingCourseId: string | null }) => {
    const { firestore } = useFirebase();
    const modulesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'courses', courseId, 'modules'), orderBy('order'));
    }, [firestore, courseId]);
    const { data: modules, isLoading: isLoadingModules } = useCollection<Omit<Module, 'lessons'>>(modulesQuery);
    
    const isFree = course.price === '0';

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
             <ScrollReveal>
                <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl font-bold">{course.title}</h1>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{course.category}</Badge>
                    <Badge variant="secondary">{course.difficulty}</Badge>
                </div>
                <p className="text-muted-foreground text-lg">by {course.author}</p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>What you'll learn</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2">
                                {course.learningOutcomes?.map((outcome, i) => <li key={i}>{outcome}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Course Content</CardTitle></CardHeader>
                        <CardContent>
                           {isLoadingModules ? <Skeleton className="h-48 w-full" /> : (
                             <Accordion type="single" collapsible className="w-full">
                                {modules?.map(module => (
                                    <AccordionItem value={`module-${module.id}`} key={module.id}>
                                        <AccordionTrigger>{module.title}</AccordionTrigger>
                                        <AccordionContent>
                                            <p className="text-muted-foreground italic p-4">Enroll to view lessons.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                           )}
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1 space-y-6">
                     <Card className="sticky top-24 shadow-lg">
                        <CardHeader>
                            {isFree ? (
                                <div className="text-3xl font-bold">Free</div>
                            ) : (
                                <div className="text-3xl font-bold">₹{course.price}</div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isFree ? (
                                <Button size="lg" className="w-full" onClick={() => handleAddToLibrary(courseId)} disabled={addingCourseId === courseId}>
                                    {addingCourseId === courseId ? 'Adding...' : 'Add to Library'}
                                </Button>
                            ) : (
                                <Button size="lg" className="w-full" asChild><Link href={`/dashboard/payment/${courseId}`}>Buy now</Link></Button>
                            )}
                             <div className="space-y-3 pt-4 border-t">
                                <p className="font-semibold">This course includes:</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /> {formatDuration(course.totalDuration)} total duration</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Layers className="w-4 h-4" /> {course.modulesCount} modules</div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="w-4 h-4" /> {course.lessonsCount} lessons</div>
                                {course.previewLessonId && <div className="flex items-center gap-2 text-sm text-muted-foreground"><PlayCircle className="w-4 h-4" /> Free preview available</div>}
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
};

const ModuleLessons = ({ courseId, moduleId }: { courseId: string, moduleId: string }) => {
    const { firestore } = useFirebase();
    const lessonsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'courses', courseId, 'modules', moduleId, 'lessons'), orderBy('order'));
    }, [firestore, courseId, moduleId]);

    const { data: lessons, isLoading } = useCollection<Lesson>(lessonsQuery);

    if (isLoading) {
        return <div className="space-y-2 pt-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
    }

    return (
        <ul className="space-y-2 pt-2">
            {lessons?.map(lesson => (
                <li key={lesson.id}>
                    <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-3">
                            {lesson.contentType === 'pdf' ? <FileText className="w-5 h-5 text-destructive" /> : <Video className="w-5 h-5 text-blue-500" />}
                            <span>{lesson.title}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDuration(lesson.duration)}</span>
                    </a>
                </li>
            ))}
             {(!lessons || lessons.length === 0) && <p className="text-muted-foreground text-sm p-3">No lessons in this module yet.</p>}
        </ul>
    );
};


const EnrolledCourseView = ({ course, courseId }: { course: Course, courseId: string }) => {
    const router = useRouter();
    const { firestore } = useFirebase();

    const modulesQuery = useMemoFirebase(() => query(collection(firestore, 'courses', courseId, 'modules'), orderBy('order')), [firestore, courseId]);
    const { data: modulesData, isLoading: isLoadingModules } = useCollection<Omit<Module, 'lessons'>>(modulesQuery);

    // --- Backward Compatibility ---
    if (course.content) {
        return <OldCourseFormatView course={course} />;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <ScrollReveal>
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/courses')}><ArrowLeft className="h-4 w-4" /></Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{course.category}</Badge>
                            <Badge variant="secondary">{course.difficulty}</Badge>
                        </div>
                        <h1 className="text-4xl font-bold">{course.title}</h1>
                        <p className="text-muted-foreground text-lg">by {course.author}</p>
                    </div>
                </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                <Card>
                    <CardHeader><CardTitle>Course Description</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">{course.description}</p></CardContent>
                </Card>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
                <Card>
                    <CardHeader><CardTitle>Course Content</CardTitle></CardHeader>
                    <CardContent>
                         {isLoadingModules ? <Skeleton className="h-48 w-full" /> : (
                             <Accordion type="single" collapsible className="w-full" defaultValue={`module-${modulesData?.[0]?.id}`}>
                                {modulesData?.map(module => (
                                    <AccordionItem value={`module-${module.id}`} key={module.id}>
                                        <AccordionTrigger className="text-lg font-semibold">{module.title}</AccordionTrigger>
                                        <AccordionContent>
                                           <ModuleLessons courseId={courseId} moduleId={module.id} />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                           )}
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    );
};


const OldCourseFormatView = ({ course }: { course: Course }) => {
    const router = useRouter();
    return (
         <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <ScrollReveal>
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/courses')}><ArrowLeft className="h-4 w-4" /></Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{course.category}</Badge>
                            <Badge variant="secondary">{course.difficulty}</Badge>
                        </div>
                        <h1 className="text-4xl font-bold">{course.title}</h1>
                        <p className="text-muted-foreground text-lg">by {course.author}</p>
                    </div>
                </div>
            </ScrollReveal>
             <ScrollReveal delay={0.2}>
                <Card>
                    <CardHeader><CardTitle>Lessons ({course.lessons})</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {course.content?.map((item, index) => (
                        <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/80 transition-colors">
                            <div className="flex items-center gap-4">
                            {item.type === 'pdf' ? <FileText className="w-6 h-6 text-destructive" /> : <Video className="w-6 h-6 text-blue-500" />}
                            <p className="font-semibold">{item.title}</p>
                            </div>
                            <LinkIcon className="w-5 h-5 text-muted-foreground" />
                        </a>
                        ))}
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    );
};


export default function CourseContentPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();

  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  const courseDocRef = useMemoFirebase(() => doc(firestore, 'courses', courseId), [firestore, courseId]);
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);

  const { data: course, isLoading: isCourseLoading } = useDoc<Course>(courseDocRef);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [addingCourseId, setAddingCourseId] = React.useState<string | null>(null);

  const handleAddToLibrary = async (courseId: string) => {
    if (!user || !firestore || !userProfile) {
      toast({ variant: "destructive", title: "You must be logged in and profile loaded." });
      return;
    }
    setAddingCourseId(courseId);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const currentEnrolled = userProfile.studentProfile?.enrolledCourses || [];
      if (currentEnrolled.includes(courseId)) {
        toast({ title: "Already in Library", description: "This course is already in your library." });
        setAddingCourseId(null);
        return;
      }
      const newEnrolledCourses = [...currentEnrolled, courseId];
      
      const updatedData = {
          ...userProfile,
          studentProfile: {
              ...userProfile.studentProfile,
              enrolledCourses: newEnrolledCourses
          }
      };
      delete updatedData.id;

      await setDoc(userRef, updatedData, { merge: true });

      toast({ title: "Success!", description: "The course has been added to your library." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not add course to library." });
    } finally {
      setAddingCourseId(null);
    }
  };

  const isEnrolled = React.useMemo(() => {
    return userProfile?.studentProfile?.enrolledCourses?.includes(courseId) || false;
  }, [userProfile, courseId]);

  if (isUserLoading || isCourseLoading || isProfileLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
      </div>
    );
  }

  return isEnrolled ? <EnrolledCourseView course={course} courseId={courseId} /> : <PublicCourseView course={course} courseId={courseId} handleAddToLibrary={handleAddToLibrary} addingCourseId={addingCourseId} />;
}
