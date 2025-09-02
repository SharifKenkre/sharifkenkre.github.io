
'use client';

import { useSyncedState } from '@/hooks/use-synced-state';
import type { CustomTheme } from '@/lib/theme';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext } from 'react';

export type Score = {
  runs: number;
  isWicket: boolean;
};

export type QuizState = {
  verificationCode: string | null;
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
  monitorHeartbeat: number | null;
};

export const initialState: QuizState = {
  verificationCode: null,
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
  monitorHeartbeat: null,
};

type QuizContextType = {
  quizState: QuizState;
  setQuizState: Dispatch<SetStateAction<QuizState>>;
  initialState: QuizState;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizState, setQuizState] = useSyncedState('quiz-state', initialState);

  return (
    <QuizContext.Provider value={{ quizState, setQuizState, initialState }}>
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
