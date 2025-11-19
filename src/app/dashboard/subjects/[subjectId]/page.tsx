import { getSubjectById, getTopicsBySubjectId } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { BookmarkButton } from '@/components/BookmarkButton';
import { BookOpen } from 'lucide-react';
import { icons } from 'lucide-react';

const Icon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
};


export default function SubjectPage({ params }: { params: { subjectId: string } }) {
  const subject = getSubjectById(params.subjectId);
  if (!subject) {
    notFound();
  }
  const topics = getTopicsBySubjectId(params.subjectId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="relative h-40 w-40 flex-shrink-0">
          <Image src={subject.coverImage.src} alt={subject.name} fill className="rounded-lg object-cover shadow-md" data-ai-hint={subject.coverImage.hint} />
        </div>
        <div>
          <Badge>{subject.grade}</Badge>
          <h1 className="text-4xl font-bold tracking-tight mt-2 flex items-center gap-2">
            <Icon name={subject.icon} className="w-8 h-8" />
            {subject.name}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">{topics.length} topics to explore in this subject. Dive in and start learning!</p>
        </div>
      </div>

      <div className="grid gap-4">
        {topics.map(topic => (
          <Card key={topic.id} className="hover:bg-card/90 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <Link href={`/dashboard/subjects/${subject.id}/topics/${topic.id}`} className="group">
                    <p className="text-sm text-muted-foreground">{topic.chapter}</p>
                    <CardTitle className="text-lg font-semibold mt-1 group-hover:text-primary transition-colors">{topic.name}</CardTitle>
                    <CardDescription className="mt-2 text-sm line-clamp-2">{topic.summary}</CardDescription>
                  </Link>
                </div>
                <BookmarkButton topicId={topic.id} />
              </div>
            </CardContent>
          </Card>
        ))}
        {topics.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-12 text-center bg-secondary">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Topics Yet</h3>
            <p className="text-muted-foreground mt-2">Check back soon for new content in {subject.name}!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
