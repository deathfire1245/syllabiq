
"use client";

import * as React from "react";
import { getSubjects, getTopicById } from "@/lib/data";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Topic } from "@/lib/types";

export default function BookmarksPage() {
  const { bookmarkedTopics, removeBookmark } = useBookmarks();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const { data: allTopics } = useCollection<Topic>(useMemoFirebase(() => firestore ? collection(firestore, 'topics') : null, [firestore]));

  const topics = React.useMemo(() => {
    if (!allTopics) return [];
    return bookmarkedTopics.map(id => getTopicById(id, allTopics)).filter((t): t is Topic => !!t);
  }, [bookmarkedTopics, allTopics]);

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
      <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
        <BookmarkX className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">No Bookmarks Yet</h2>
        <p className="text-muted-foreground mt-2">
          You haven&apos;t bookmarked any topics. Start exploring subjects to save your favorites!
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/subjects">Explore Subjects</Link>
        </Button>
      </ScrollReveal>
    );
  }

  return (
    <div className="space-y-8">
       <ScrollReveal>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Your Bookmarks</h1>
      </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => {
            if (!topic) return null;
            const subject = subjects.find(s => s.id === topic.subjectId);
            return (
              <ScrollReveal
                key={topic.id}
                delay={index * 0.1}
              >
                <Card
                  className="group relative transform transition-all duration-300 hover:shadow-lg h-full hover:-translate-y-1"
                >
                  <Link href={`/dashboard/subjects/${subject?.id}/${topic.id}`} className="block h-full p-6">
                      <Badge variant="outline" className="mb-2">{subject?.name}</Badge>
                      <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                          {topic.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                        {topic.summary}
                      </p>
                  </Link>
                  <div className="absolute top-3 right-3">
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
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
    </div>
  );
}

    