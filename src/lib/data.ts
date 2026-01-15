
import type { Grade, Subject, Topic } from "./types";
import { PlaceHolderImages } from "./placeholder-images";

const getImage = (id: string) => {
  const img = PlaceHolderImages.find((p) => p.id === id);
  if (!img) {
    return {
      src: "https://picsum.photos/seed/placeholder/600/400",
      hint: "placeholder",
    };
  }
  return { src: img.imageUrl, hint: img.imageHint };
};

// This static data is now a fallback or for UI structure reference.
// The app will primarily use real-time data from Firestore.
const topics: Topic[] = [
  // This can be kept empty or as a reference, as real data comes from Firestore
];

const subjects: Subject[] = [
  {
    id: 'math-10',
    grade: 'Grade 10',
    name: 'Mathematics',
    icon: 'Calculator',
    coverImage: getImage('math-cover'),
    topics: [], // Topics are now fetched from Firestore
  },
  {
    id: 'science-10',
    grade: 'Grade 10',
    name: 'Science',
    icon: 'FlaskConical',
    coverImage: getImage('science-cover'),
    topics: [],
  },
  {
    id: 'history-10',
    grade: 'Grade 10',
    name: 'History',
    icon: 'Scroll',
    coverImage: getImage('history-cover'),
    topics: [],
  },
  {
    id: 'literature-11',
    grade: 'Grade 11',
    name: 'Literature',
    icon: 'BookMarked',
    coverImage: getImage('literature-cover'),
    topics: [],
  },
  {
    id: 'geography-10',
    grade: 'Grade 10',
    name: 'Geography',
    icon: 'Globe',
    coverImage: getImage('geography-cover'),
    topics: [],
  },
  {
    id: 'biology-11',
    grade: 'Grade 11',
    name: 'Biology',
    icon: 'Dna',
    coverImage: getImage('biology-cover'),
    topics: [],
  },
  {
    id: 'chemistry-11',
    grade: 'Grade 11',
    name: 'Chemistry',
    icon: 'Beaker',
    coverImage: getImage('chemistry-topic'),
    topics: [],
  },
  {
    id: 'physics-12',
    grade: 'Grade 12',
    name: 'Physics',
    icon: 'Atom',
    coverImage: getImage('physics-topic'),
    topics: [],
  },
  {
    id: 'economics-12',
    grade: 'Grade 12',
    name: 'Economics',
    icon: 'Landmark',
    coverImage: getImage('economics-cover'),
    topics: [],
  },
  {
    id: 'art-10',
    grade: 'Grade 10',
    name: 'Art History',
    icon: 'Paintbrush',
    coverImage: getImage('art-cover'),
    topics: [],
  },
  {
    id: 'music-11',
    grade: 'Grade 11',
    name: 'Music Theory',
    icon: 'Music',
    coverImage: getImage('music-cover'),
    topics: [],
  },
  {
    id: 'computer-science-12',
    grade: 'Grade 12',
    name: 'Computer Science',
    icon: 'Code',
    coverImage: getImage('cs-cover'),
    topics: [],
  },
  {
    id: 'calculus-12',
    grade: 'Grade 12',
    name: 'Calculus',
    icon: 'Sigma',
    coverImage: getImage('calculus-cover'),
    topics: [],
  },
  {
    id: 'statistics-11',
    grade: 'Grade 11',
    name: 'Statistics',
    icon: 'BarChart3',
    coverImage: getImage('statistics-cover'),
    topics: [],
  },
  {
    id: 'world-history-11',
    grade: 'Grade 11',
    name: 'World History',
    icon: 'Globe2',
    coverImage: getImage('world-history-cover'),
    topics: [],
  },
  {
    id: 'civics-10',
    grade: 'Grade 10',
    name: 'Civics',
    icon: 'Scale',
    coverImage: getImage('civics-cover'),
    topics: [],
  },
  {
    id: 'psychology-12',
    grade: 'Grade 12',
    name: 'Psychology',
    icon: 'BrainCircuit',
    coverImage: getImage('psychology-cover'),
    topics: [],
  },
  {
    id: 'sociology-12',
    grade: 'Grade 12',
    name: 'Sociology',
    icon: 'Users',
    coverImage: getImage('sociology-cover'),
    topics: [],
  },
  {
    id: 'environmental-science-11',
    grade: 'Grade 11',
    name: 'Environmental Science',
    icon: 'Leaf',
    coverImage: getImage('env-science-cover'),
    topics: [],
  },
  {
    id: 'physical-education-10',
    grade: 'Grade 10',
    name: 'Physical Education',
    icon: 'Bike',
    coverImage: getImage('pe-cover'),
    topics: [],
  },
  {
    id: 'health-10',
    grade: 'Grade 10',
    name: 'Health',
    icon: 'HeartPulse',
    coverImage: getImage('health-cover'),
    topics: [],
  },
  {
    id: 'drama-11',
    grade: 'Grade 11',
    name: 'Drama',
    icon: 'Theater',
    coverImage: getImage('drama-cover'),
    topics: [],
  },
  {
    id: 'creative-writing-12',
    grade: 'Grade 12',
    name: 'Creative Writing',
    icon: 'Pen',
    coverImage: getImage('writing-cover'),
    topics: [],
  },
  {
    id: 'philosophy-12',
    grade: 'Grade 12',
    name: 'Philosophy',
    icon: 'BookOpen',
    coverImage: getImage('philosophy-cover'),
    topics: [],
  },
  {
    id: 'foreign-language-10',
    grade: 'Grade 10',
    name: 'Foreign Language',
    icon: 'Languages',
    coverImage: getImage('language-cover'),
    topics: [],
  }
];


const grades: Grade[] = [
  {
    id: 'grade-10',
    name: 'Grade 10',
    subjects: subjects.filter(s => s.grade === 'Grade 10'),
  },
  {
    id: 'grade-11',
    name: 'Grade 11',
    subjects: subjects.filter(s => s.grade === 'Grade 11'),
  },
  {
    id: 'grade-12',
    name: 'Grade 12',
    subjects: subjects.filter(s => s.grade === 'Grade 12'),
  }
];

// Functions to query the data
export const getGrades = () => grades;
export const getSubjects = () => subjects;

// These functions now primarily serve for static lookups (e.g., getting a subject's name from its ID).
// The main data fetching is done via the `useCollection` and `useDoc` hooks in the components.
export const getTopicById = (topicId: string, allTopics: Topic[]): Topic | undefined => {
    // This function is now deprecated for real-time fetching but can be used for bookmarks or other client-side operations.
    const realTimeTopic = allTopics.find(t => t.id === topicId);
    if (realTimeTopic) {
        return realTimeTopic;
    }
    // Fallback to static topics if not found
    return topics.find(t => t.id === topicId);
}
export const getStaticTopics = () => topics;

export const getSubjectById = (id: string) => subjects.find(s => s.id === id);
export const getTopicsBySubjectId = (subjectId: string, dbTopics: Topic[]) => dbTopics.filter(t => t.subjectId === subjectId);
