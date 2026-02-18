
export type Lesson = {
  id: string;
  title: string;
  order: number;
  moduleId: string;
  courseId: string;
  contentType: 'pdf' | 'video';
  contentUrl: string;
  isPreview: boolean;
  duration: number; // in minutes
};

export type Module = {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
};

export type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  price: string;
  coverImage: string;
  imageHint: string;
  authorId: string;
  author: string;
  createdAt?: any;
  learningOutcomes: string[];
  modulesCount: number;
  lessonsCount: number;
  totalDuration: number; // in minutes
  previewLessonId?: string;
  hasPracticeQuestions: boolean;
  hasFinalTest: boolean;
  // For backward compatibility
  content?: { title: string; type: 'pdf' | 'video'; url: string }[];
  lessons?: number;
};


export type Topic = {
  id: string;
  subjectId: string;
  chapter: string;
  name:string;
  summary: string;
  content?: string; // Markdown text for written content
  pdfUrl?: string; // URL for linked PDF/Doc
  contentType?: 'text' | 'pdf' | 'video' | 'link';
  coverImage: {
    src: string;
    hint: string;
  };
  videoUrl?: string;
  keyPoints: string[];
  questions: {
    question: string;
    answer: string;
  }[];
  createdAt?: any;
  createdBy?: string;
};

export type Subject = {
  id: string;
  grade: string;
  name: string;
  icon: string;
  coverImage: {
    src: string;
    hint: string;
  };
  topics: Topic[];
};

export type Grade = {
  id: 'grade-10' | 'grade-11' | 'grade-12';
  name: string;
  subjects: Subject[];
};

export type Ticket = {
  id: string;
  userId: string;
  teacherId: string;
  meetingId: string;
  role: 'student' | 'teacher';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'FREE' | 'REFUNDED';
  price: number;
  createdAt: any;
}

    
