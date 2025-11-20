"use client";

import * as React from "react";
import {
  BookMarked,
  Calculator,
  FlaskConical,
  GraduationCap,
  MessageSquare,
  Scroll,
} from "lucide-react";
import { getSubjects, getTopics } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AIChat } from "./_components/ai-chat";

const iconMap: { [key: string]: React.ElementType } = {
  Calculator,
  FlaskConical,
  Scroll,
  BookMarked,
  GraduationCap,
};

export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const subjects = getSubjects();
  const bookmarkedTopics = getTopics().slice(0, 4); // Placeholder

  return (
    <div className="space-y-8 animate-fade-in">
      {/* All Subjects Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">All Subjects</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((subject, index) => {
            const Icon = iconMap[subject.icon];
            return (
              <Card
                key={subject.id}
                className="group relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-primary/20 animate-pop-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                <Image
                  src={subject.coverImage.src}
                  alt={subject.name}
                  width={600}
                  height={400}
                  className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-110"
                />
                <CardHeader className="relative z-10 p-4 bg-card/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    {Icon && (
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {subject.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{`${subject.topics.length} topics`}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bookmarks Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Your Bookmarks
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {bookmarkedTopics.map((topic, index) => (
            <Card
              key={topic.id}
              className="group flex items-center gap-4 p-4 transform transition-all duration-300 hover:bg-secondary/50 hover:shadow-md animate-pop-in"
               style={{ animationDelay: `${(subjects.length + index) * 100}ms` }}
            >
              <Image
                src={topic.coverImage.src}
                alt={topic.name}
                width={80}
                height={80}
                className="rounded-lg object-cover w-16 h-16 sm:w-20 sm:h-20"
              />
              <div className="flex-grow">
                <Badge
                  variant="outline"
                  className="mb-1 border-primary/50 text-primary"
                >
                  {topic.chapter}
                </Badge>
                <h3 className="font-semibold text-base line-clamp-1">
                  {topic.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {topic.summary}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Chat Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          isIconOnly
          className="rounded-full h-16 w-16 bg-primary shadow-lg text-primary-foreground transform transition-transform hover:scale-110"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open AI Chat"
        >
          <MessageSquare className="w-8 h-8" />
        </Button>
      </div>

      <AIChat isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
