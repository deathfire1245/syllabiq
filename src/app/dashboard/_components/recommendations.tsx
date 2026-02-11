'use client';

import * as React from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getSubjects } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Topic, Subject } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    author: string;
    description: string;
    price: string;
    category: string;
    difficulty: string;
    createdAt?: any;
}

const RecommendationCard = ({ title, description, badge, link, onLinkClick }: { title: string, description: string, badge?: string, link: string, onLinkClick?: () => void }) => {
    const isExternalLink = link.startsWith('http');
    return (
        <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-primary/50">
            <div className="flex-grow">
                <CardHeader>
                    {badge && <Badge variant="outline" className="mb-2 w-fit">{badge}</Badge>}
                    <CardTitle className="text-lg font-semibold line-clamp-2">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                </CardContent>
            </div>
            <CardFooter>
                 <Button variant="ghost" size="sm" asChild={!onLinkClick}>
                    <Link href={link} onClick={onLinkClick} target={isExternalLink ? "_blank" : "_self"} rel={isExternalLink ? "noopener noreferrer" : ""}>
                       Explore <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

const SectionSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
    </div>
);

export function Recommendations({ userProfile }: { userProfile: any }) {
    const { firestore } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    
    const [recommendedCourses, setRecommendedCourses] = React.useState<Course[]>([]);
    const [recommendedSubjects, setRecommendedSubjects] = React.useState<Subject[]>([]);
    const [recommendedTopics, setRecommendedTopics] = React.useState<Topic[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    
    const allSubjects = getSubjects();

    React.useEffect(() => {
        const fetchRecommendations = async () => {
            if (!firestore || !userProfile) return;
            setIsLoading(true);

            const enrolledCourseIds: string[] = userProfile.studentProfile?.enrolledCourses || [];

            if (enrolledCourseIds.length > 0) {
                // --- Personalized Recommendations ---
                const safeEnrolledCourseIds = enrolledCourseIds.slice(0, 30);
                const enrolledCoursesSnap = await getDocs(query(collection(firestore, 'courses'), where('__name__', 'in', safeEnrolledCourseIds)));
                const enrolledCoursesData = enrolledCoursesSnap.docs.map(doc => doc.data() as Course);
                
                const categories = [...new Set(enrolledCoursesData.map(c => c.category))];
                const difficulties = [...new Set(enrolledCoursesData.map(c => c.difficulty))];
                
                // 1. Recommended Courses
                const categoryQuery = query(collection(firestore, 'courses'), where('category', 'in', categories), limit(5));
                const difficultyQuery = query(collection(firestore, 'courses'), where('difficulty', 'in', difficulties), limit(5));
                
                const [categoryCoursesSnap, difficultyCoursesSnap] = await Promise.all([getDocs(categoryQuery), getDocs(difficultyQuery)]);
                
                const courseMap = new Map<string, Course>();
                [...categoryCoursesSnap.docs, ...difficultyCoursesSnap.docs].forEach(doc => {
                    const course = { id: doc.id, ...doc.data() } as Course;
                    if (!enrolledCourseIds.includes(course.id)) {
                        courseMap.set(course.id, course);
                    }
                });
                setRecommendedCourses(Array.from(courseMap.values()).slice(0, 5));

                // 2. Recommended Subjects
                const relatedSubjectIds = new Set<string>();
                allSubjects.forEach(subject => {
                    if (categories.includes(subject.name)) {
                        relatedSubjectIds.add(subject.id);
                    }
                });
                setRecommendedSubjects(allSubjects.filter(s => relatedSubjectIds.has(s.id)).slice(0, 5));
                
                // 3. Recommended Topics
                if (relatedSubjectIds.size > 0) {
                    const topicsQuery = query(collection(firestore, 'topics'), where('subjectId', 'in', Array.from(relatedSubjectIds)), orderBy('createdAt', 'desc'), limit(5));
                    const topicsSnap = await getDocs(topicsQuery);
                    setRecommendedTopics(topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic)));
                }

            } else {
                // --- Generic Recommendations for new users ---
                const coursesQuery = query(collection(firestore, 'courses'), orderBy('createdAt', 'desc'), limit(5));
                const topicsQuery = query(collection(firestore, 'topics'), orderBy('createdAt', 'desc'), limit(5));

                const [coursesSnap, topicsSnap] = await Promise.all([getDocs(coursesQuery), getDocs(topicsQuery)]);
                
                setRecommendedCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
                setRecommendedTopics(topicsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic)));
                setRecommendedSubjects(allSubjects.slice(0, 5));
            }

            setIsLoading(false);
        };

        fetchRecommendations();
    }, [firestore, userProfile, allSubjects]);

    const handleTopicClick = (topic: Topic) => {
        try {
            sessionStorage.setItem('activeTopic', JSON.stringify(topic));
            router.push('/dashboard/subjects/topic-content');
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Could not open the topic." });
        }
    };
    
    const sections = [
        { title: "Recommended Courses", data: recommendedCourses, type: 'course' },
        { title: "Explore Subjects", data: recommendedSubjects, type: 'subject' },
        { title: "Popular Topics", data: recommendedTopics, type: 'topic' },
    ];

    return (
        <div className="space-y-12">
            {sections.map(section => (
                (section.data.length > 0 || isLoading) && (
                    <ScrollReveal key={section.title}>
                        <Card className="bg-transparent border-none shadow-none">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle>{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoading ? (
                                    <SectionSkeleton />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {section.data.map((item: any) => {
                                            if (section.type === 'course') {
                                                const isEnrolled = userProfile.studentProfile?.enrolledCourses?.includes(item.id);
                                                return (
                                                    <RecommendationCard 
                                                        key={item.id}
                                                        title={item.title}
                                                        description={item.description}
                                                        badge={item.category}
                                                        link={isEnrolled ? `/dashboard/courses/${item.id}` : `/dashboard/payment/${item.id}`}
                                                    />
                                                );
                                            }
                                            if (section.type === 'subject') {
                                                return (
                                                    <RecommendationCard 
                                                        key={item.id}
                                                        title={item.name}
                                                        description={`Explore topics in ${item.name}`}
                                                        link={`/dashboard/subjects/${item.id}`}
                                                    />
                                                );
                                            }
                                            if (section.type === 'topic') {
                                                const subjectName = allSubjects.find(s => s.id === item.subjectId)?.name;
                                                return (
                                                     <RecommendationCard 
                                                        key={item.id}
                                                        title={item.name}
                                                        description={item.summary}
                                                        badge={subjectName}
                                                        link="#"
                                                        onLinkClick={() => handleTopicClick(item)}
                                                    />
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                )
            ))}
        </div>
    );
}
