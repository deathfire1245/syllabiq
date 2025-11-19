"use client";

import { useBookmarks } from '@/contexts/BookmarkContext';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function BookmarkButton({ topicId, asIcon = true }: { topicId: string, asIcon?: boolean }) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(topicId);
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (bookmarked) {
      removeBookmark(topicId);
      toast({ title: "Bookmark removed" });
    } else {
      addBookmark(topicId);
      toast({ title: "Bookmark added!" });
    }
  };

  if (asIcon) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        className="text-muted-foreground hover:text-primary"
      >
        <Bookmark className={cn('h-5 w-5', bookmarked && 'fill-primary text-primary')} />
      </Button>
    );
  }

  return (
     <Button
      variant={bookmarked ? "secondary" : "default"}
      onClick={handleClick}
      aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      className="gap-2"
    >
      <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
      <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
    </Button>
  )
}
