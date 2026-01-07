
export type Topic = {
  id: string;
  subjectId: string;
  chapter: string;
  name:string;
  summary: string;
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
  id: string;
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

    