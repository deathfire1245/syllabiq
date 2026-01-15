
export type Topic = {
  id: string;
  subjectId: string;
  chapter: string;
  name:string;
  summary: string;
  content?: string; // Markdown text for written content
  pdfUrl?: string; // URL for linked PDF/Doc
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
