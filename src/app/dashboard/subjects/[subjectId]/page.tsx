
"use client";

import * as React from "react";
import { getSubjectById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Bookmark, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { useToast } from "@/hooks/use-toast";
import type { Topic } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirebase, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SubjectDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const params = React.use(paramsPromise);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();

  const [newTopic, setNewTopic] = React.useState({ title: "", chapter: "", summary: "" });
  const [contentValue, setContentValue] = React.useState("");
  const [contentType, setContentType] = React.useState<'write' | 'link'>('write');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const subject = getSubjectById(params.subjectId);

  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "topics"), where("subjectId", "==", params.subjectId));
  }, [firestore, params.subjectId]);

  const { data: topics, isLoading: areTopicsLoading } = useCollection<Topic>(topicsQuery);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const handleTopicClick = (topic: Topic) => {
    try {
      sessionStorage.setItem('currentTopic', JSON.stringify(topic));
    } catch (e) {
      console.error("Failed to save topic to session storage", e);
    }
  };

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

  const handleAddTopic = async () => {
    if (!newTopic.title || !newTopic.chapter || !newTopic.summary || !contentValue) {
      toast({ variant: 'destructive', title: "Error", description: "Please fill all fields for the new topic." });
      return;
    }
    if (!firestore || !user) {
        toast({ variant: 'destructive', title: "Error", description: "You must be logged in to create a topic." });
        return;
    }

    setIsSubmitting(true);
    
    const payload: any = {
      name: newTopic.title,
      chapter: newTopic.chapter,
      summary: newTopic.summary,
      subjectId: params.subjectId,
      createdBy: user.uid,
      coverImage: { 
        src: `https://picsum.photos/seed/${newTopic.title.replace(/\s+/g, '-')}/600/400`,
        hint: "educational content"
      },
      keyPoints: [],
      questions: [],
      createdAt: serverTimestamp(),
      contentType: contentType === 'link' ? 'pdf' : 'text',
      content: contentValue,
    };
    
    if (contentType === 'write') {
        payload.content = contentValue;
        payload.contentType = 'text';
    } else {
        payload.pdfUrl = contentValue;
        payload.contentType = 'pdf';
    }


    try {
      await addDoc(collection(firestore, "topics"), payload);
      toast({ title: "Topic Added!", description: `"${newTopic.title}" has been created.` });
      setNewTopic({ title: "", chapter: "", summary: "" }); // Reset form
      setContentValue("");
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Could not create the topic." });
      console.error("Error creating topic: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (userRole === null || areTopicsLoading) {
      return (
        <div className="space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      );
  }

  // Teacher View
  if (userRole === 'teacher') {
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
            <p className="text-muted-foreground">Add new topics for this free subject.</p>
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
                                <Input id="topic-title" placeholder="e.g., Introduction to Photosynthesis" value={newTopic.title} onChange={(e) => setNewTopic({...newTopic, title: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topic-chapter">Chapter / Unit</Label>
                                <Input id="topic-chapter" placeholder="e.g., Chapter 4" value={newTopic.chapter} onChange={(e) => setNewTopic({...newTopic, chapter: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topic-summary">Short Summary</Label>
                                <Textarea id="topic-summary" placeholder="Briefly describe what this topic covers." value={newTopic.summary} onChange={(e) => setNewTopic({...newTopic, summary: e.target.value})} />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Content Type</Label>
                                <Select value={contentType} onValueChange={(value: 'write' | 'link') => setContentType(value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select content type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="write">Write Content</SelectItem>
                                    <SelectItem value="link">Paste a PDF/Doc Link</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="topic-content">
                                  {contentType === 'write' ? 'Main Content' : 'PDF or Google Doc Link'}
                                </Label>
                                {contentType === 'write' ? (
                                    <Textarea id="topic-content" placeholder="Write the full lesson content here..." className="min-h-[200px]" value={contentValue} onChange={(e) => setContentValue(e.target.value)} />
                                ) : (
                                    <Input id="topic-content" placeholder="https://example.com/your-document.pdf" value={contentValue} onChange={(e) => setContentValue(e.target.value)} />
                                )}
                            </div>

                             <div className="flex justify-end">
                                <Button onClick={handleAddTopic} disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Topic"}</Button>
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
                        {topics && topics.length > 0 ? (
                            <ul className="space-y-3">
                                {topics.map(topic => (
                                    <li key={topic.id} className="flex justify-between items-center bg-secondary p-3 rounded-md">
                                        <div>
                                            <p className="font-semibold">{topic.name}</p>
                                            <p className="text-sm text-muted-foreground">{topic.chapter}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                          <Link href={`/dashboard/subjects/${subject.id}/${topic.id}`} onClick={() => handleTopicClick(topic)}>View</Link>
                                        </Button>
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
        {topics && topics.map((topic, index) => (
          <ScrollReveal key={topic.id} delay={index * 0.1}>
            <Link href={`/dashboard/subjects/${subject.id}/${topic.id}`} onClick={() => handleTopicClick(topic)}>
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
        {topics && topics.length === 0 && (
          <ScrollReveal className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium">No topics yet.</h3>
            <p className="text-muted-foreground">Check back soon for content in {subject.name}!</p>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
