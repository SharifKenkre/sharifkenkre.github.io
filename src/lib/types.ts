
export type Question = {
  id: string;
  paperId?: string;
  exam?: string;
  examType?: string;
  year?: number;
  subject?: string;
  section?: string;
  number?: number;
  questionType?: 'mcq' | 'assertion-reason' | 'image' | 'puzzle';
  passageId?: string;
  instruction?: string;
  statement: string;
  statements?: string[];
  bullets?: string[];
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
  sections?: string[];
};
