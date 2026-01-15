
"use client";

import * as React from "react";
import { getSubjectById } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Bookmark, CheckCircle, HelpCircle, Lightbulb, Video, FileText } from "lucide-react";
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
import { useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";

function isUrl(text: string) {
    try {
        new URL(text);
        return true;
    } catch (_) {
        return false;
    }
}

export default function TopicDetailsPage({
  params: paramsProp,
}: {
  params: { subjectId: string; topicId: string };
}) {
  const params = React.use(paramsProp);
  const { firestore } = useFirebase();
  const router = useRouter();

  const topicDocRef = useMemoFirebase(() => {
    if (!firestore || !params.topicId) return null;
    return doc(firestore, 'topics', params.topicId);
  }, [firestore, params.topicId]);

  const { data: topic, isLoading: isTopicLoading } = useDoc<Topic>(topicDocRef);
  const subject = getSubjectById(params.subjectId);

  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();

  if (isTopicLoading) {
      return (
          <div className="space-y-8">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                  <div className="lg:col-span-1 space-y-8">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
              </div>
          </div>
      );
  }

  if (!subject || !topic) {
    notFound();
  }
  
  const handleBookmarkToggle = (e: React.MouseEvent) => {
    if (!topic) return;
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

  const contentIsUrl = isUrl(topic.content);
  
  const handleStartLearning = () => {
    if (contentIsUrl) {
      window.open(topic.content, '_blank', 'noopener,noreferrer');
    } else {
      // For written content, we can assume we are on the learning page,
      // or implement a specific learning view if needed.
      // For now, we just ensure the content is displayed.
    }
  };

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
                        <CardContent>
                           {contentIsUrl ? (
                                <Button asChild size="lg">
                                    <Link href={topic.content} target="_blank" rel="noopener noreferrer">
                                       <FileText className="mr-2 h-5 w-5" /> View Document
                                    </Link>
                                </Button>
                           ) : (
                                <div className="prose prose-stone dark:prose-invert max-w-none">
                                    <p>{topic.content}</p>
                                </div>
                           )}
                        </CardContent>
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
                                {topic.keyPoints.length === 0 && <p className="text-muted-foreground">No key points added yet.</p>}
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
                                onClick={handleBookmarkToggle}
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
                             {topic.questions.length === 0 && <p className="text-muted-foreground text-center py-4">No questions added yet.</p>}
                        </CardContent>
                    </Card>
                 </ScrollReveal>
            </div>
        </div>
    </div>
  );
}
