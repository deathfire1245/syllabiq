
"use client";

import * as React from "react";
import { getSubjectById, getTopicsBySubjectId } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Bookmark, PlusCircle, Upload, FileText, Video, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useToast } from "@/hooks/use-toast";
import type { Topic } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SubjectDetailsPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const subject = getSubjectById(params.subjectId);
  const topics = getTopicsBySubjectId(params.subjectId);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  if (!subject) {
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
  
  if (userRole === null) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
            <p>Loading...</p>
        </div>
      );
  }

  // Teacher View
  if (userRole === 'Teacher') {
    return (
      <div className="space-y-8">
        <ScrollReveal className="flex items-center gap-4">
           <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/subjects">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
              </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Content for {subject.name}</h1>
            <p className="text-muted-foreground">Add new topics, notes, videos, and questions.</p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 <ScrollReveal>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PlusCircle className="w-5 h-5 text-primary"/> Add New Topic / Lesson</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic-title">Topic Title</Label>
                                <Input id="topic-title" placeholder="e.g., Introduction to Photosynthesis" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topic-chapter">Chapter / Unit</Label>
                                <Input id="topic-chapter" placeholder="e.g., Chapter 4" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topic-summary">Short Summary</Label>
                                <Textarea id="topic-summary" placeholder="Briefly describe what this topic covers." />
                            </div>
                             <div className="flex justify-end">
                                <Button>Add Topic</Button>
                             </div>
                        </CardContent>
                    </Card>
                 </ScrollReveal>

                 <ScrollReveal delay={0.2}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary"/> Upload Content</CardTitle>
                            <CardDescription>Attach notes, videos or other resources to a topic.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="select-topic">Select Topic</Label>
                                <select id="select-topic" className="w-full h-10 border-input bg-background rounded-md border px-3 py-2 text-sm">
                                    <option>Select a topic to add content to...</option>
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    {topics.length === 0 && <option disabled>No topics created yet.</option>}
                                </select>
                            </div>
                             <div className="grid sm:grid-cols-3 gap-4">
                                <Button variant="outline"><FileText className="mr-2 h-4 w-4"/> Add Text Notes</Button>
                                <Button variant="outline"><Video className="mr-2 h-4 w-4"/> Upload Video</Button>
                                <Button variant="outline"><HelpCircle className="mr-2 h-4 w-4"/> Add Questions</Button>
                            </div>
                        </CardContent>
                    </Card>
                 </ScrollReveal>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <ScrollReveal delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topics.length > 0 ? (
                            <ul className="space-y-3">
                                {topics.map(topic => (
                                    <li key={topic.id} className="flex justify-between items-center bg-secondary p-3 rounded-md">
                                        <div>
                                            <p className="font-semibold">{topic.name}</p>
                                            <p className="text-sm text-muted-foreground">{topic.chapter}</p>
                                        </div>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No topics created for this subject yet.</p>
                        )}
                    </CardContent>
                </Card>
                </ScrollReveal>
            </div>
        </div>
      </div>
    );
  }
  
  // Student View
  return (
    <div className="space-y-8">
      <ScrollReveal className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/subjects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, index) => (
          <ScrollReveal key={topic.id} delay={index * 0.1}>
            <Link href={`/dashboard/subjects/${subject.id}/${topic.id}`}>
              <Card
                className="group relative overflow-hidden transform transition-all duration-300 hover:shadow-xl h-full"
              >
                <Image
                  src={topic.coverImage.src}
                  alt={topic.name}
                  width={600}
                  height={400}
                  className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-110"
                  data-ai-hint={topic.coverImage.hint}
                />
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-3 right-3 z-10 bg-card/80 backdrop-blur-sm rounded-full h-9 w-9 text-muted-foreground hover:text-primary transition-all group-hover:opacity-100 opacity-80"
                    onClick={(e) => handleBookmarkToggle(e, topic)}
                >
                    <Bookmark className={cn("h-5 w-5", isBookmarked(topic.id) ? "fill-primary text-primary" : "")} />
                </Button>
                <CardHeader>
                  <Badge variant="outline" className="mb-1 w-fit">{topic.chapter}</Badge>
                  <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    {topic.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {topic.summary}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </ScrollReveal>
        ))}
        {topics.length === 0 && (
          <ScrollReveal className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">No topics yet.</h3>
            <p className="text-muted-foreground">Check back soon for content in {subject.name}!</p>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
