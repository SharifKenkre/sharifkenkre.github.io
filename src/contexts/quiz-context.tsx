
'use client';

import { useFirestoreSyncedState } from '@/hooks/use-synced-state';
import type { CustomTheme } from '@/lib/theme';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

export type Score = {
  runs: number;
  isWicket: boolean;
};

export type QuizState = {
  id: string; // This is the verificationCode and the document ID in Firestore
  quizTitle: string;
  numTeams: number;
  teamNames: string[];
  scores: Record<number, Record<number, Score>>; // { [questionIndex]: { [teamIndex]: { runs, isWicket } } }
  activeCell: { question: number; team: number } | null;
  numQuestions: number; // Represents balls in the current over
  rounds: { name: string; scores: Record<number, Record<number, Score>> }[];
  pointValues: (number | 'WICKET')[];
  monitorSettings: {
    theme: string;
    compact: boolean;
    customTheme?: CustomTheme;
    showLogo: boolean;
  };
  monitorHeartbeat: number; // Timestamp of the last ping from the monitor
};

export const initialState: Omit<QuizState, 'id' | 'monitorHeartbeat'> = {
  quizTitle: 'Live Cricket Scoreboard',
  numTeams: 0,
  teamNames: [],
  scores: {},
  activeCell: { question: 0, team: 0 },
  numQuestions: 0,
  rounds: [],
  pointValues: [0, 1, 2, 3, 4, 6, 'WICKET'],
  monitorSettings: {
    theme: 'default',
    compact: false,
    customTheme: {
      background: '234 67% 94%',
      card: '234 67% 99%',
      primary: '231 48% 48%',
    },
    showLogo: true,
  },
};

type QuizContextType = {
  quizState: QuizState | null; // Can be null until a quiz is loaded/created
  setQuizState: Dispatch<SetStateAction<QuizState | null>>;
  createQuiz: () => string;
  loadQuiz: (id: string) => void;
  isLoaded: boolean;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizId, setQuizId] = useState<string | null>(null);
  const { state: quizState, setState: setQuizState, isLoaded } = useFirestoreSyncedState<QuizState>(quizId);

  const createQuiz = () => {
    const newId = Math.floor(100000 + Math.random() * 900000).toString();
    const newState: QuizState = {
      id: newId,
      ...initialState,
      monitorHeartbeat: 0,
    };
    setQuizId(newId);
    setQuizState(newState); // This will also write to Firestore
    return newId;
  };
  
  const loadQuiz = (id: string) => {
    setQuizId(id);
  };

  return (
    <QuizContext.Provider value={{ quizState, setQuizState, createQuiz, loadQuiz, isLoaded }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
