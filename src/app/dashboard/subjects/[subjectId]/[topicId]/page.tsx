
"use client";

import * as React from "react";
import { getSubjectById, getTopicById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Bookmark, CheckCircle, HelpCircle, Lightbulb, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useToast } from "@/hooks/use-toast";
import type { Topic } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export default function TopicDetailsPage({
  params: paramsProp,
}: {
  params: { subjectId: string; topicId: string };
}) {
  const params = React.use(paramsProp);
  const { firestore } = useFirebase();

  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "topics"), where("subjectId", "==", params.subjectId));
  }, [firestore, params.subjectId]);
  
  const { data: topics, isLoading: areTopicsLoading } = useCollection<Topic>(topicsQuery);

  const subject = getSubjectById(params.subjectId);
  const topic = React.useMemo(() => {
    if(!topics) return getTopicById(params.topicId, []);
    return topics.find(t => t.id === params.topicId) ?? getTopicById(params.topicId, []);
  }, [topics, params.topicId]);

  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();

  if (!subject || (!topic && !areTopicsLoading)) {
    notFound();
  }
  
  const handleBookmarkToggle = (e: React.MouseEvent, topic: Topic) => {
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
  
  if (areTopicsLoading || !topic) {
      return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
        <ScrollReveal>
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/subjects/${subject.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <div>
                  <Link href={`/dashboard/subjects/${subject.id}`} className="text-sm text-primary hover:underline">{subject.name}</Link>
                  <h1 className="text-3xl font-bold tracking-tight">{topic.name}</h1>
                </div>
            </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <ScrollReveal>
                    <Card className="overflow-hidden">
                        <Image
                            src={topic.coverImage.src}
                            alt={topic.name}
                            width={1200}
                            height={600}
                            className="object-cover w-full h-64"
                            data-ai-hint={topic.coverImage.hint}
                        />
                        <CardHeader>
                            <Badge variant="outline" className="mb-2 w-fit">{topic.chapter}</Badge>
                            <CardTitle className="text-2xl">{topic.name}</CardTitle>
                            <CardDescription>{topic.summary}</CardDescription>
                        </CardHeader>
                    </Card>
                </ScrollReveal>

                 <ScrollReveal delay={0.2}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary"/> Key Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-3">
                                {topic.keyPoints.map((point, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
            
            <div className="lg:col-span-1 space-y-8">
                 <ScrollReveal delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             <Button 
                                variant="outline" 
                                className="w-full justify-start gap-2"
                                onClick={(e) => handleBookmarkToggle(e, topic)}
                            >
                                <Bookmark className={cn("h-5 w-5", isBookmarked(topic.id) ? "fill-primary text-primary" : "")} />
                                {isBookmarked(topic.id) ? 'Remove Bookmark' : 'Add Bookmark'}
                            </Button>
                            {topic.videoUrl && (
                                <Button variant="secondary" className="w-full justify-start gap-2" asChild>
                                    <Link href={topic.videoUrl} target="_blank">
                                        <Video className="h-5 w-5" />
                                        Watch Video Lesson
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </ScrollReveal>

                 <ScrollReveal delay={0.3}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-primary"/> Important Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Accordion type="single" collapsible className="w-full">
                                {topic.questions.map((q, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>{q.question}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">
                                        {q.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                 </ScrollReveal>
            </div>
        </div>
    </div>
  );
}
