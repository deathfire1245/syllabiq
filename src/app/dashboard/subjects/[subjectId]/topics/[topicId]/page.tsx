import { getTopicById, getSubjectById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Film, Lightbulb, HelpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TopicPage({ params }: { params: { subjectId: string, topicId: string } }) {
  const topic = getTopicById(params.topicId);
  const subject = getSubjectById(params.subjectId);

  if (!topic || !subject || topic.subjectId !== subject.id) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-4 text-sm text-muted-foreground flex items-center gap-1.5">
        <Link href="/dashboard" className="hover:underline hover:text-primary">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/dashboard/subjects/${subject.id}`} className="hover:underline hover:text-primary">{subject.name}</Link>
      </div>

      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-8 shadow-lg">
        <Image src={topic.coverImage.src} alt={topic.name} fill className="object-cover" data-ai-hint={topic.coverImage.hint} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <Badge variant="secondary">{topic.chapter}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">{topic.name}</h1>
        </div>
        <div className="flex-shrink-0">
          <BookmarkButton topicId={topic.id} asIcon={false} />
        </div>
      </div>

      <p className="text-lg text-muted-foreground mb-12">{topic.summary}</p>

      <div className="space-y-6">
        {topic.videoUrl && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4"><Film className="w-7 h-7 text-primary" /> Video Lesson</h2>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Video player placeholder</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4"><Lightbulb className="w-7 h-7 text-primary" /> Key Points</h2>
            <ul className="space-y-3 pl-5 list-disc text-foreground/90">
              {topic.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold flex items-center gap-3 mb-4"><HelpCircle className="w-7 h-7 text-primary" /> Important Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {topic.questions.map((q, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{q.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {q.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
