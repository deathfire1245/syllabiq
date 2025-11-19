"use client";

import { useBookmarks } from '@/contexts/BookmarkContext';
import { getTopicById, getSubjectById } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookmarkX, Bookmark, icons } from 'lucide-react';
import Link from 'next/link';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const Icon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
};


export default function BookmarksPage() {
  const { bookmarkedTopics } = useBookmarks();
  const topics = bookmarkedTopics.map(id => getTopicById(id)).filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Bookmarks</h1>
        <p className="text-muted-foreground">All your saved topics in one place for easy access.</p>
      </div>

      {topics.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {topics.map(topic => {
            if (!topic) return null;
            const subject = getSubjectById(topic.subjectId);
            return (
              <Card key={topic.id} className="group overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                <div className="relative h-32 w-full">
                   <Link href={`/dashboard/subjects/${topic.subjectId}/topics/${topic.id}`}>
                      <Image src={topic.coverImage.src} alt={topic.name} fill className="object-cover" data-ai-hint={topic.coverImage.hint} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   </Link>
                   <div className="absolute top-2 right-2">
                     <BookmarkButton topicId={topic.id} />
                   </div>
                </div>

                <CardContent className="p-4 flex-grow flex flex-col">
                  <Link href={`/dashboard/subjects/${topic.subjectId}/topics/${topic.id}`} className="flex-grow">
                      {subject && (
                        <div className="flex items-center gap-2 mb-2">
                           <Icon name={subject.icon} className="w-4 h-4 text-muted-foreground" />
                           <Badge variant="outline">{subject.name}</Badge>
                        </div>
                      )}
                      <CardTitle className="text-md font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">{topic.name}</CardTitle>
                      <CardDescription className="mt-2 text-xs line-clamp-2">{topic.summary}</CardDescription>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center bg-secondary">
          <BookmarkX className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No Bookmarks Yet</h3>
          <p className="text-muted-foreground mt-2">
            Click the <Bookmark className="inline-block h-4 w-4 align-text-bottom" /> icon on any topic to save it here.
          </p>
        </Card>
      )}
    </div>
  );
}
