
"use client";

import { getSubjects } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { BookOpen, Calculator, FlaskConical, Scroll } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const iconMap: { [key: string]: React.ElementType } = {
  Calculator,
  FlaskConical,
  Scroll,
  BookOpen,
};

export default function SubjectsPage() {
  const subjects = getSubjects();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">All Subjects</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {subjects.map((subject, index) => {
            const Icon = iconMap[subject.icon] || BookOpen;
            return (
              <Link href={`/dashboard/subjects/${subject.id}`} key={subject.id}>
                <Card
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
                        <CardDescription>{`${subject.topics.length} topics`}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
