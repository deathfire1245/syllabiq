
"use client";

import * as React from "react";
import { getSubjectById, getTopicsBySubjectId } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useToast } from "@/hooks/use-toast";
import type { Topic } from "@/lib/types";

export default function SubjectDetailsPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const subject = getSubjectById(params.subjectId);
  const topics = getTopicsBySubjectId(params.subjectId);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();

  if (!subject) {
    notFound();
  }
  
  const handleBookmarkToggle = (topic: Topic) => {
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/subjects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, index) => (
          <Card
            key={topic.id}
            className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl animate-pop-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Link href={`/dashboard/subjects/${subject.id}/${topic.id}`}>
              <Image
                src={topic.coverImage.src}
                alt={topic.name}
                width={600}
                height={400}
                className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-110"
                data-ai-hint={topic.coverImage.hint}
              />
            </Link>
            <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-3 right-3 z-10 bg-card/80 backdrop-blur-sm rounded-full h-9 w-9 text-muted-foreground hover:text-primary transition-all group-hover:opacity-100 opacity-80"
                onClick={() => handleBookmarkToggle(topic)}
            >
                <Bookmark className={cn("h-5 w-5", isBookmarked(topic.id) ? "fill-primary text-primary" : "")} />
            </Button>
            <CardHeader>
              <Badge variant="outline" className="mb-1 w-fit">{topic.chapter}</Badge>
              <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                <Link href={`/dashboard/subjects/${subject.id}/${topic.id}`}>
                  {topic.name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {topic.summary}
              </p>
            </CardContent>
          </Card>
        ))}
        {topics.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">No topics yet.</h3>
            <p className="text-muted-foreground">Check back soon for content in {subject.name}!</p>
          </div>
        )}
      </div>
    </div>
  );
}
