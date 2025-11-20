

"use client";

import * as React from "react";
import {
  Clock,
  History,
  MessageSquare,
  Target,
  TrendingUp,
} from "lucide-react";
import { getSubjects } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AIChat } from "./_components/ai-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ScrollReveal";

const iconMap: { [key: string]: React.ElementType } = {
  // Your existing icon map
};

const SubjectProgress = ({ subject, delay = 0 }: { subject: ReturnType<typeof getSubjects>[0], delay?: number }) => {
  const [progress, setProgress] = React.useState(0);
  const Icon = iconMap[subject.icon] || TrendingUp;

  React.useEffect(() => {
    const timer = setTimeout(() => {
        setProgress(Math.floor(Math.random() * 50) + 25);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
     <ScrollReveal delay={delay}>
        <Card
        key={subject.id}
        className="group relative overflow-hidden transform transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/20"
        >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
        <Image
            src={subject.coverImage.src}
            alt={subject.name}
            width={600}
            height={400}
            className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-110"
            data-ai-hint={subject.coverImage.hint}
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
        <CardContent className="p-4 pt-0">
            <div className="space-y-2">
                {progress > 0 ? (
                <>
                    <div className="flex justify-between items-center text-sm">
                    <p className="text-muted-foreground">Progress</p>
                    <p className="font-medium text-primary">{progress}%</p>
                    </div>
                    <Progress value={progress} className="h-2" />
                </>
                ) : (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                </div>
                )}
            </div>
        </CardContent>
        </Card>
    </ScrollReveal>
  );
};


export default function DashboardPage() {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const subjects = getSubjects().slice(0, 3); // Placeholder for "Your Subjects"
  const recentTopics = getSubjects().flatMap(s => s.topics).slice(0,3);

  const userStats = {
    topicsCompleted: 18,
    totalTopics: 50,
    studyHours: 42,
    quizzesTaken: 12,
    avgScore: 88,
  }

  const statCards = [
      {
          title: "Topics Completed",
          icon: TrendingUp,
          value: `${userStats.topicsCompleted} / ${userStats.totalTopics}`,
          footer: "+5 from last week",
      },
      {
          title: "Study Hours",
          icon: Clock,
          value: `${userStats.studyHours}`,
          footer: "Total time spent learning",
      },
      {
          title: "Average Score",
          icon: Target,
          value: `${userStats.avgScore}%`,
          footer: `Across ${userStats.quizzesTaken} quizzes`,
      }
  ]

  return (
    <div className="space-y-8">
      {/* Your Subjects Section */}
      <ScrollReveal>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Your Subjects</h2>
      </ScrollReveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, index) => (
            <SubjectProgress key={subject.id} subject={subject} delay={index * 0.1} />
        ))}
      </div>

      {/* User Stats Section */}
       <div>
        <ScrollReveal>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Your Progress</h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <ScrollReveal key={stat.title} delay={index * 0.1}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.footer}</p>
                            </CardContent>
                        </Card>
                    </ScrollReveal>
                )
            })}
             <ScrollReveal className="sm:col-span-2 lg:col-span-1" delay={0.3}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Recently Accessed</CardTitle>
                        <History className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                    {recentTopics.map(topic => (
                        <div key={topic.id} className="flex items-center gap-3 group">
                            <Image src={topic.coverImage.src} alt={topic.name} width={40} height={40} className="rounded-md object-cover"/>
                            <div>
                            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{topic.name}</p>
                            <p className="text-xs text-muted-foreground">{topic.chapter}</p>
                            </div>
                        </div>
                    ))}
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
      </div>


      {/* AI Chat Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
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
