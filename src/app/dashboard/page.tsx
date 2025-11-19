import { getGrades } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { icons } from 'lucide-react';

const Icon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
};


export default function DashboardPage() {
  const grades = getGrades();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student!</h1>
        <p className="text-muted-foreground">Let's continue learning where you left off.</p>
      </div>

      {grades.map(grade => (
         <section key={grade.id} id={grade.id}>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">{grade.name} Subjects</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grade.subjects.map(subject => (
              <Link key={subject.id} href={`/dashboard/subjects/${subject.id}`} className="group block">
                <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
                  <div className="relative h-40 w-full">
                    <Image src={subject.coverImage.src} alt={subject.name} fill className="object-cover" data-ai-hint={subject.coverImage.hint} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <CardHeader className="absolute bottom-0 left-0 text-white">
                        <CardTitle className="flex items-center gap-2">
                          <Icon name={subject.icon} className="w-6 h-6 text-white" />
                          {subject.name}
                        </CardTitle>
                        <CardDescription className="text-white/80">{subject.topics.length} topics</CardDescription>
                      </CardHeader>
                  </div>
                </Card>
              </Link>
            ))}
            {grade.subjects.length === 0 && <p className="text-muted-foreground">No subjects available for this grade yet.</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
