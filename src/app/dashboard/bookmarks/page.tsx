"use client";

import { useBookmarks } from '@/contexts/BookmarkContext';
import { getTopicById, getSubjectById } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookmarkX, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Badge } from '@/components/ui/badge';

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
        <div className="grid gap-4">
          {topics.map(topic => {
            if (!topic) return null;
            const subject = getSubjectById(topic.subjectId);
            return (
              <Card key={topic.id} className="hover:bg-card/90 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <Link href={`/dashboard/subjects/${topic.subjectId}/topics/${topic.id}`} className="group">
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary">{subject?.name}</Badge>
                           <p className="text-sm text-muted-foreground">{topic.chapter}</p>
                        </div>
                        <CardTitle className="text-lg font-semibold mt-2 group-hover:text-primary transition-colors">{topic.name}</CardTitle>
                        <CardDescription className="mt-2 text-sm line-clamp-2">{topic.summary}</CardDescription>
                      </Link>
                    </div>
                    <BookmarkButton topicId={topic.id} />
                  </div>
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
