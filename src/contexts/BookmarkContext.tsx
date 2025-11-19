"use client";

import type { Topic } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface BookmarkContextType {
  bookmarkedTopics: string[];
  addBookmark: (topicId: string) => void;
  removeBookmark: (topicId: string) => void;
  isBookmarked: (topicId: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
  const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedBookmarks = localStorage.getItem('bookmarkedTopics');
      if (storedBookmarks) {
        setBookmarkedTopics(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      console.error("Failed to parse bookmarks from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('bookmarkedTopics', JSON.stringify(bookmarkedTopics));
    }
  }, [bookmarkedTopics, isMounted]);

  const addBookmark = (topicId: string) => {
    setBookmarkedTopics((prev) => [...new Set([...prev, topicId])]);
  };

  const removeBookmark = (topicId: string) => {
    setBookmarkedTopics((prev) => prev.filter((id) => id !== topicId));
  };

  const isBookmarked = (topicId: string) => {
    return bookmarkedTopics.includes(topicId);
  };
  
  const value = { bookmarkedTopics, addBookmark, removeBookmark, isBookmarked };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
