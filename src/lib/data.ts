
import type { Grade, Subject, Topic } from "./types";
import { PlaceHolderImages } from "./placeholder-images";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "firebase-admin";

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
  {
    id: 'alg-101',
    subjectId: 'math-10',
    chapter: 'Chapter 1: Foundations',
    name: 'Introduction to Algebra',
    summary: 'Explore the fundamental concepts of algebra, including variables, expressions, and equations. This topic lays the groundwork for all future mathematical studies.',
    coverImage: getImage('algebra-topic'),
    videoUrl: 'https://example.com/video',
    keyPoints: [
      'A variable is a symbol that represents a quantity that can change.',
      'An algebraic expression is a combination of variables, numbers, and at least one operation.',
      'An equation is a statement that two expressions are equal.',
      'Solving an equation means finding the value of the variable that makes the equation true.'
    ],
    questions: [
      { question: 'What is a variable?', answer: 'A variable is a letter or symbol used to represent an unknown value or a value that can change.' },
      { question: 'What is the difference between an expression and an equation?', answer: 'An expression is a mathematical phrase that can contain numbers, variables, and operators, but it does not have an equal sign. An equation sets two expressions equal to each other.' },
    ]
  },
  {
    id: 'geo-101',
    subjectId: 'math-10',
    chapter: 'Chapter 5: Geometry',
    name: 'Basics of Geometry',
    summary: 'Learn about points, lines, planes, and angles. Understand the basic postulates and theorems that form the foundation of Euclidean geometry.',
    coverImage: getImage('geometry-topic'),
    keyPoints: [
      'A point has no dimension. It is represented by a dot.',
      'A line has one dimension. It is represented by a line with two arrowheads, extending without end.',
      'A plane has two dimensions. It is represented by a shape that looks like a floor or a wall, extending without end.',
      'An angle is formed by two rays with a common endpoint, called the vertex.'
    ],
    questions: [
      { question: 'What are parallel lines?', answer: 'Parallel lines are two lines in a plane that never intersect or touch each other at any point.' },
    ]
  },
  {
    id: 'phy-101',
    subjectId: 'science-10',
    chapter: 'Chapter 1: Mechanics',
    name: 'Newton\'s Laws of Motion',
    summary: 'Dive into classical mechanics by studying Newton\'s three laws of motion, which are fundamental principles describing the relationship between an object and the forces acting upon it.',
    coverImage: getImage('physics-topic'),
    videoUrl: 'https://example.com/video',
    keyPoints: [
      'First Law (Inertia): An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.',
      'Second Law: The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object (F=ma).',
      'Third Law: For every action, there is an equal and opposite reaction.'
    ],
    questions: [
      { question: 'What is inertia?', answer: 'Inertia is the resistance of any physical object to any change in its state of motion.' },
    ]
  },
  {
    id: 'chem-101',
    subjectId: 'science-10',
    chapter: 'Chapter 3: The Atom',
    name: 'The Periodic Table',
    summary: 'Understand the organization of the periodic table and how it predicts the properties of elements. Learn about periods, groups, and elemental properties.',
    coverImage: getImage('chemistry-topic'),
    keyPoints: [
      'The periodic table arranges elements in order of increasing atomic number.',
      'Rows are called periods, and columns are called groups.',
      'Elements in the same group have similar chemical properties.',
      'The table can be used to predict trends in atomic size, ionization energy, and electronegativity.'
    ],
    questions: [
      { question: 'Who is credited with creating the first periodic table?', answer: 'Dmitri Mendeleev is most often credited with creating the first modern periodic table in 1869.' },
    ]
  },
];

const subjects: Subject[] = [
  {
    id: 'math-10',
    grade: 'Grade 10',
    name: 'Mathematics',
    icon: 'Calculator',
    coverImage: getImage('math-cover'),
    topics: topics.filter(t => t.subjectId === 'math-10'),
  },
  {
    id: 'science-10',
    grade: 'Grade 10',
    name: 'Science',
    icon: 'FlaskConical',
    coverImage: getImage('science-cover'),
    topics: topics.filter(t => t.subjectId === 'science-10'),
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
// The main data fetching is done via the `useCollection` hook in the components.
export const getStaticTopics = () => topics;

export const getSubjectById = (id: string) => subjects.find(s => s.id === id);
export const getTopicsBySubjectId = (subjectId: string, dbTopics: Topic[]) => dbTopics.filter(t => t.subjectId === subjectId);
export const getTopicById = (id: string, dbTopics: Topic[]) => dbTopics.find(t => t.id === id);
