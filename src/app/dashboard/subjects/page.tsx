import { getSubjects } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { icons } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Icon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
};

export default function AllSubjectsPage() {
  const subjects = getSubjects();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Subjects</h1>
        <p className="text-muted-foreground">Explore all the subjects available on SyllabiQ.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {subjects.map(subject => (
          <Link key={subject.id} href={`/dashboard/subjects/${subject.id}`} className="group block">
            <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
              <div className="relative h-40 w-full">
                <Image src={subject.coverImage.src} alt={subject.name} fill className="object-cover" data-ai-hint={subject.coverImage.hint} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <Badge variant="secondary" className="absolute top-2 right-2">{subject.grade}</Badge>
              </div>
              <CardContent className="p-4 flex-grow flex flex-col">
                 <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Icon name={subject.icon} className="w-5 h-5 text-primary" />
                    {subject.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-muted-foreground flex-grow">{subject.topics.length} topics to explore</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
        {subjects.length === 0 && <p className="text-muted-foreground">No subjects available yet.</p>}
      </div>
    </div>
  );
}
