"use client";

import { useBookmarks } from '@/contexts/BookmarkContext';

export const BookmarkCounter = () => {
    const { bookmarkedTopics } = useBookmarks();
    return <>{bookmarkedTopics.length}</>;
}
