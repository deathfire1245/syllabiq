
"use client";

import * as React from "react";
import { getSubjectById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Video,
  FileText,
} from "lucide-react";
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
} from "@/components/ui/accordion";
import { useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopicDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ subjectId: string; topicId: string }>;
}) {
  // ✅ REQUIRED in Next.js 15
  const params = React.use(paramsPromise);

  const { firestore } = useFirebase();

  const topicDocRef = useMemoFirebase(() => {
    if (!firestore || !params.topicId) return null;
    // Fetch the topic directly by its ID from the top-level collection
    return doc(firestore, "topics", params.topicId);
  }, [firestore, params.topicId]);

  const { data: topic, isLoading } = useDoc<Topic>(topicDocRef);

  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();

  const subject = getSubjectById(params.subjectId);

  // ⏳ Prevent premature 404
  if (isLoading) {
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

  // ❌ Only call notFound() after data fetching is complete and the document is confirmed to not exist.
  if (!topic || !subject) {
    notFound();
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
            <Link
              href={`/dashboard/subjects/${subject.id}`}
              className="text-sm text-primary hover:underline"
            >
              {subject.name}
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              {topic.name}
            </h1>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ScrollReveal>
            <Card className="overflow-hidden">
              <Image
                src={topic.coverImage?.src ?? "/placeholder.png"}
                alt={topic.name}
                width={1200}
                height={600}
                className="object-cover w-full h-64"
                data-ai-hint={topic.coverImage?.hint}
              />
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit">
                  {topic.chapter}
                </Badge>
                <CardTitle className="text-2xl">{topic.name}</CardTitle>
                <CardDescription>{topic.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                {topic.pdfUrl ? (
                  <Button asChild size="lg">
                    <Link href={topic.pdfUrl} target="_blank">
                      <FileText className="mr-2 h-5 w-5" />
                      View Document
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
        </div>

        <div className="lg:col-span-1 space-y-8">
          <ScrollReveal>
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
                  <Bookmark
                    className={cn(
                      "h-5 w-5",
                      isBookmarked(topic.id)
                        ? "fill-primary text-primary"
                        : ""
                    )}
                  />
                  {isBookmarked(topic.id)
                    ? "Remove Bookmark"
                    : "Add Bookmark"}
                </Button>

                {topic.videoUrl && (
                  <Button
                    variant="secondary"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link href={topic.videoUrl} target="_blank">
                      <Video className="h-5 w-5" />
                      Watch Video Lesson
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
