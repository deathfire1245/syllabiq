"use client";

import * as React from "react";
import { getSubjects } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { BookOpen, Calculator, FlaskConical, Scroll, Globe, Dna, Beaker, Atom, Landmark, Paintbrush, Music, Code, Sigma, BarChart3, Globe2, Scale, BrainCircuit, Users, Leaf, Bike, HeartPulse, Theater, Pen, Languages } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Topic } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/contexts/SearchContext";

const iconMap: { [key: string]: React.ElementType } = {
  Calculator,
  FlaskConical,
  Scroll,
  BookOpen,
  Globe,
  Dna,
  Beaker,
  Atom,
  Landmark,
  Paintbrush,
  Music,
  Code,
  Sigma,
  BarChart3,
  Globe2,
  Scale,
  BrainCircuit,
  Users,
  Leaf,
  Bike,
  HeartPulse,
  Theater,
  Pen,
  Languages,
};

export default function SubjectsPage() {
  const allSubjects = getSubjects();
  const { firestore } = useFirebase();
  const { searchTerm } = useSearch();

  const topicsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'topics');
  }, [firestore]);

  const { data: allTopics, isLoading } = useCollection<Topic>(topicsQuery);

  const topicCounts = React.useMemo(() => {
    if (!allTopics) return {};
    return allTopics.reduce((acc, topic) => {
      if (topic.subjectId) {
        acc[topic.subjectId] = (acc[topic.subjectId] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
  }, [allTopics]);

  const subjects = React.useMemo(() => {
    if (!searchTerm) return allSubjects;
    return allSubjects.filter(subject => 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSubjects, searchTerm]);

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl font-bold tracking-tight mb-4">All Subjects</h1>
      </ScrollReveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          [...Array(allSubjects.length)].map((_, index) => (
            <ScrollReveal key={index} delay={index * 0.05}>
                <Skeleton className="h-[152px] w-full" />
            </ScrollReveal>
          ))
        ) : subjects.length > 0 ? (
            subjects.map((subject, index) => {
                const Icon = iconMap[subject.icon] || BookOpen;
                const count = topicCounts[subject.id] || 0;
                return (
                    <ScrollReveal key={subject.id} delay={index * 0.05}>
                    <Link href={`/dashboard/subjects/${subject.id}`}>
                        <Card
                        className="group relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-primary/20 h-full"
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
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                                {subject.name}
                                </CardTitle>
                                <CardDescription>{`${count} topics`}</CardDescription>
                            </div>
                            </div>
                        </CardHeader>
                        </Card>
                    </Link>
                    </ScrollReveal>
                );
            })
        ) : (
           <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">No Subjects Found</h3>
              <p className="text-muted-foreground">Try adjusting your search term.</p>
           </div>
        )}
      </div>
    </div>
  );
}
