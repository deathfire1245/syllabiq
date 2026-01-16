
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bookmark, FileText, Link as LinkIcon, Video, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function TopicContentPage() {
    const router = useRouter();
    const [topic, setTopic] = React.useState<Topic | null>(null);
    const [loading, setLoading] = React.useState(true);
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    const { toast } = useToast();
    const { user, firestore } = useFirebase();

    const userDocRef = useMemoFirebase(() => (user && firestore) ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile } = useDoc(userDocRef);

    const [isCompleted, setIsCompleted] = React.useState(false);

    React.useEffect(() => {
        try {
            const topicJson = sessionStorage.getItem('activeTopic');
            if (topicJson) {
                const parsedTopic: Topic = JSON.parse(topicJson);
                setTopic(parsedTopic);

                // Fire-and-forget update for recently viewed topics
                if (user && firestore && parsedTopic.id) {
                    const userRef = doc(firestore, 'users', user.uid);
                    getDoc(userRef).then(docSnap => {
                        if (docSnap.exists()) {
                            const currentRecent = docSnap.data().studentProfile?.recentlyAccessed || [];
                            const newRecent = [parsedTopic.id, ...currentRecent.filter((id: string) => id !== parsedTopic.id)].slice(0, 10);
                            updateDoc(userRef, { 'studentProfile.recentlyAccessed': newRecent });
                        }
                    }).catch(console.error); // Silently fail on error
                }
            }
        } catch (error) {
            console.error("Failed to parse topic from session storage", error);
            router.replace('/dashboard/subjects');
        } finally {
            setLoading(false);
        }
    }, [user, firestore, router]);
    
    React.useEffect(() => {
        if (userProfile && topic) {
            const completed = userProfile.studentProfile?.completedTopics || [];
            setIsCompleted(completed.includes(topic.id));
        }
    }, [userProfile, topic]);

    if (loading) {
        return (
             <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-1/3" />
                </div>
                {/* Main Content Skeleton */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold">No Topic Selected</h2>
                <p className="text-muted-foreground mt-2">
                    It seems you've landed here directly. Please go back and select a topic to view its content.
                </p>
                <Button onClick={() => router.back()} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }
    
    const handleBookmarkToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isBookmarked(topic.id)) {
            removeBookmark(topic.id);
            toast({
                title: "Bookmark Removed",
                description: `"${topic.name}" has been removed from your bookmarks.`,
            });
        } else {
            addBookmark(topic.id);
            toast({
                title: "Bookmark Added!",
                description: `"${topic.name}" has been added to your bookmarks.`,
            });
        }
    };
    
    const handleMarkAsComplete = async () => {
        if (!user || !firestore || !topic || isCompleted) return;
        const userRef = doc(firestore, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                'studentProfile.completedTopics': arrayUnion(topic.id)
            });
            toast({
                title: "Progress Saved!",
                description: `You've completed "${topic.name}".`,
            });
            setIsCompleted(true);
        } catch (error) {
            console.error("Failed to mark as complete:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not save your progress.",
            });
        }
    };

    const renderContent = () => {
        if ((topic.contentType === 'pdf' || topic.contentType === 'link') && topic.pdfUrl) {
             return (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-destructive" />
                            External Document
                        </CardTitle>
                        <CardDescription>
                            This topic content is provided as an external document. Click the button to open it in a new tab.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild>
                            <a href={topic.pdfUrl} target="_blank" rel="noopener noreferrer">
                                Open Document in New Tab <LinkIcon className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (topic.contentType === 'text' && topic.content) {
            return (
                <Card>
                     <CardHeader>
                        <CardTitle>Lesson Content</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none text-base leading-relaxed">
                        {topic.content.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>  
                        ))}
                    </CardContent>
                </Card>
            );
        }

        if (topic.videoUrl) {
            const videoIdMatch = topic.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;

            if (!videoId) {
                return (
                    <Card>
                        <CardHeader><CardTitle>Invalid Video</CardTitle></CardHeader>
                        <CardContent><p>The provided video link is not a valid YouTube URL.</p></CardContent>
                    </Card>
                )
            }
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Video className="w-6 h-6 text-blue-500" /> Video Lesson</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video w-full overflow-hidden rounded-lg">
                           <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Content Not Available</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The content for this topic is not in a recognizable format.</p>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/subjects/${topic.subjectId}`)}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to topics</span>
                    </Button>
                    <div>
                        <Badge variant="secondary" className="mb-1">{topic.chapter}</Badge>
                        <h1 className="text-3xl font-bold tracking-tight">{topic.name}</h1>
                    </div>
                </div>
                 {userProfile?.role === 'student' && (
                    <Button onClick={handleMarkAsComplete} disabled={isCompleted} variant={isCompleted ? "secondary" : "default"}>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        {isCompleted ? "Completed" : "Mark as Complete"}
                    </Button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={topic.coverImage.src}
                            alt={topic.name}
                            fill
                            className="object-cover"
                            data-ai-hint={topic.coverImage.hint}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                         <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-sm rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-all"
                            onClick={handleBookmarkToggle}
                        >
                            <Bookmark className={cn("h-5 w-5", isBookmarked(topic.id) ? "fill-primary text-primary" : "")} />
                        </Button>
                    </div>

                    {/* Content Renderer */}
                    {renderContent()}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Topic Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{topic.summary}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Accordion type="multiple" defaultValue={["key-points", "questions"]} className="w-full">
                                <AccordionItem value="key-points">
                                    <AccordionTrigger>Key Points</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                           {topic.keyPoints && topic.keyPoints.length > 0 ? topic.keyPoints.map((point, i) => <li key={i}>{point}</li>) : <li>No key points available.</li>}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="questions">
                                    <AccordionTrigger>Practice Questions</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-4 text-muted-foreground">
                                           {topic.questions && topic.questions.length > 0 ? topic.questions.map((q, i) => (
                                                <li key={i}>
                                                    <p className="font-semibold text-foreground">{i + 1}. {q.question}</p>
                                                    <p className="text-sm italic mt-1 pl-4">A: {q.answer}</p>
                                                </li>
                                            )) : <li>No practice questions available.</li>}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
