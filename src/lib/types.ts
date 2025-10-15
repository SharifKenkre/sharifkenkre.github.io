
export type Question = {
  id: string;
  paperId?: string;
  exam?: string;
  examType?: string;
  year?: number;
  subject?: string;
  section?: string;
  number: number; // Now mandatory and used for ordering
  questionType?: 'mcq' | 'assertion-reason' | 'image-mcq' | 'puzzle' | 'cause-effect' | 'data-points' | 'assumption';
  passageId?: string;
  instruction?: string;
  statement: string;
  texts?: string[]; // Renamed from statements/bullets
  options: string[];
  answer: string; // The correct option key, e.g., "A", "B"
  marks?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageUrls?: string[];
  imageAlt?: string;
  tags?: string[];
  createdAt?: any; // Firestore timestamp
  
  // Populated after fetching
  passageText?: string;
};

export type Passage = {
    id: string;
    paperId: string;
    section: string;
    text: string;
    source: string;
    createdAt: any; // Firestore timestamp
}

export type AnswerState = {
  response: string; // e.g. "A", "B"
  status: 'not-visited' | 'not-answered' | 'answered' | 'marked-for-review' | 'answered-and-marked';
  isCorrect: boolean;
};

export type QuizAttemptSummary = {
  uid: string;
  attemptId: string;
  paperId: string;
  paperTitle?: string;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score?: number;
  durationSec?: number;
  startedAt: any;
  completedAt?: any;
  lastUpdatedAt: any;
}

export type Attempt = {
  uid: string;
  qid: string;
  selected: string;
  isCorrect: boolean;
  timestamp: any;
}

export type Paper = {
  id: string;
  paperId: string;
  title: string;
  year: number;
  exam: string;
  durationMin?: number;
  sections?: string[];
  subjects?: string[];
  questionTypes?: string[];
  time?: number; // in minutes
  totalQuestions?: number;
  totalMarks?: number;
};
