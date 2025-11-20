
"use client";
import { getGrades, getSubjects, getTopics } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { icons, Book, Bookmark, Activity, ChevronRight, Star } from 'lucide-react';
import { BookmarkCounter } from '@/components/BookmarkCounter';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Badge } from '@/components/ui/badge';

const Icon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
};

export default function DashboardPage() {
  const grades = getGrades();
  const subjects = getSubjects();
  const { bookmarkedTopics } = useBookmarks();
  const bookmarkedTopicDetails = bookmarkedTopics.map(id => getTopics().find(t => t.id === id)).filter(Boolean);

  const summaryCards = [
    { title: "Total Subjects", value: subjects.length, icon: Book, color: "text-primary" },
    { title: "Total Topics", value: getTopics().length, icon: Activity, color: "text-green-500" },
    { title: "Bookmarked", value: <BookmarkCounter />, icon: Bookmark, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student!</h1>
        <p className="text-muted-foreground">Let's continue learning where you left off.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section id="grades">
         <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Your Grades</h2>
         </div>
         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
           {grades.map(grade => (
              <Card key={grade.id} className="group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                 <CardHeader>
                    <CardTitle>{grade.name}</CardTitle>
                    <CardDescription>{grade.subjects.length} subjects</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-2">
                    {grade.subjects.slice(0, 3).map(subject => (
                      <Link key={subject.id} href={`#subject-${subject.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                        <Icon name={subject.icon} className="w-5 h-5 text-primary" />
                        <span className="font-medium text-sm">{subject.name}</span>
                      </Link>
                    ))}
                    {grade.subjects.length > 3 && <p className="text-xs text-muted-foreground pt-2">+ {grade.subjects.length - 3} more</p>}
                 </CardContent>
              </Card>
           ))}
         </div>
      </section>

      {subjects.map(subject => (
         <section key={subject.id} id={`subject-${subject.id}`} className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
              <Icon name={subject.icon} className="w-6 h-6 text-primary" />
              {subject.name} <span className="text-base font-normal text-muted-foreground">({subject.grade})</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {subject.topics.map(topic => (
              <Card key={topic.id} className="group overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                <div className="relative h-32 w-full">
                   <Image src={topic.coverImage.src} alt={topic.name} fill className="object-cover" data-ai-hint={topic.coverImage.hint} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <div className="absolute top-2 right-2">
                     <BookmarkButton topicId={topic.id} />
                   </div>
                </div>

                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="flex-grow">
                      <CardTitle className="text-md font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">{topic.name}</CardTitle>
                      <CardDescription className="mt-2 text-xs line-clamp-2">{topic.summary}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            ))}
             {subject.topics.length === 0 && 
              <Card className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex flex-col items-center justify-center p-12 text-center bg-secondary">
                <Book className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Topics Yet</h3>
                <p className="text-muted-foreground mt-2">Topics for {subject.name} will be available soon.</p>
              </Card>
             }
          </div>
        </section>
      ))}

       <section id="bookmarks">
         <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Your Bookmarks</h2>
         </div>
        {bookmarkedTopicDetails.length > 0 ? (
           <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {bookmarkedTopicDetails.map(topic => {
              if (!topic) return null;
              const subject = getSubjects().find(s => s.id === topic.subjectId);
              return (
                 <Card key={topic.id} className="group overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                    <div className="relative h-32 w-full">
                       <Image src={topic.coverImage.src} alt={topic.name} fill className="object-cover" data-ai-hint={topic.coverImage.hint} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                       <div className="absolute top-2 right-2">
                         <BookmarkButton topicId={topic.id} />
                       </div>
                    </div>
                    <CardContent className="p-4 flex-grow">
                      {subject && (
                        <div className="flex items-center gap-2 mb-2">
                           <Icon name={subject.icon} className="w-4 h-4 text-muted-foreground" />
                           <Badge variant="outline">{subject.name}</Badge>
                        </div>
                      )}
                      <CardTitle className="text-md font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">{topic.name}</CardTitle>
                    </CardContent>
                  </Card>
              );
            })}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center bg-secondary">
            <Star className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Bookmarks Yet</h3>
            <p className="text-muted-foreground mt-2">
              Click the <Bookmark className="inline-block h-4 w-4 align-text-bottom" /> icon on any topic to save it here.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
