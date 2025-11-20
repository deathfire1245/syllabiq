
"use client";

import * as React from "react";
import { getSubjects, getTopics, getTopicById } from "@/lib/data";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { BookmarkX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export default function BookmarksPage() {
  const { bookmarkedTopics, removeBookmark } = useBookmarks();
  const { toast } = useToast();

  const topics = bookmarkedTopics.map(id => getTopicById(id)).filter(Boolean);
  const subjects = getSubjects();

  const handleRemoveBookmark = (topicId: string, topicName: string) => {
    removeBookmark(topicId);
    toast({
      title: "Bookmark Removed",
      description: `"${topicName}" has been removed from your bookmarks.`,
    });
  };

  if (topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <BookmarkX className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">No Bookmarks Yet</h2>
        <p className="text-muted-foreground mt-2">
          You haven&apos;t bookmarked any topics. Start exploring subjects to save your favorites!
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/subjects">Explore Subjects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
       <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Your Bookmarks</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => {
             if (!topic) return null;
            const subject = subjects.find(s => s.id === topic.subjectId);
            return (
              <Card
                key={topic.id}
                className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-lg animate-pop-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                 <Link href={`/dashboard/subjects/${subject?.id}/${topic.id}`}>
                  <Image
                    src={topic.coverImage.src}
                    alt={topic.name}
                    width={600}
                    height={400}
                    className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint={topic.coverImage.hint}
                  />
                </Link>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-1">{topic.chapter}</Badge>
                            <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                <Link href={`/dashboard/subjects/${subject?.id}/${topic.id}`}>
                                    {topic.name}
                                </Link>
                            </CardTitle>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-5 h-5" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove the bookmark for &quot;{topic.name}&quot;.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveBookmark(topic.id, topic.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {topic.summary}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
