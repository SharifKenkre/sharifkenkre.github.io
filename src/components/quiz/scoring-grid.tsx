
'use client';

import { useQuiz } from '@/contexts/quiz-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export function ScoringGrid() {
  const { quizState, setQuizState } = useQuiz();
  const { scores, activeCell, teamNames, numQuestions, rounds, monitorSettings } = quizState;
  const activeCellRef = useRef<HTMLTableCellElement>(null);
  
  const numTeams = teamNames?.length || 0;
  const questionRows = Array.from({ length: numQuestions + 1 }, (_, i) => i);


  useEffect(() => {
    activeCellRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  }, [activeCell]);

  const handleCellClick = (question: number, team: number) => {
    if (question > numQuestions) return;

    setQuizState(prev => ({
      ...prev,
      activeCell: { question, team }
    }));
  };

 const getTeamTotals = (teamIndex: number): { runs: number; wickets: number } => {
    let totalRuns = 0;
    let totalWickets = 0;

    const processScores = (scoreData: Record<number, Record<number, any>>) => {
        Object.values(scoreData).forEach(questionScores => {
            const score = questionScores[teamIndex];
            if (score) {
                totalRuns += score.runs || 0;
                if (score.isWicket) {
                    totalWickets += 1;
                }
            }
        });
    };

    (rounds || []).forEach(round => processScores(round.scores));
    processScores(scores);
    
    return { runs: totalRuns, wickets: totalWickets };
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] font-headline">Ball</TableHead>
            {teamNames && teamNames.map((name, teamIndex) => {
                const totals = getTeamTotals(teamIndex);
                const isOut = totals.wickets >= 10;
                return (
                  <TableHead key={teamIndex} className={cn("text-center font-headline",
                    isOut ? 'text-destructive' : 'text-success',
                    isOut && (monitorSettings.theme === 'dark' ? 'theme-light' : 'theme-dark')
                  )}>
                    {name} ({totals.runs}/{totals.wickets})
                  </TableHead>
                )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {questionRows.map(questionIndex => (
            <TableRow key={questionIndex} className={cn(questionIndex > numQuestions && "opacity-50 cursor-not-allowed")}>
              <TableCell className="font-medium font-headline">B{questionIndex + 1}</TableCell>
              {Array.from({ length: numTeams }).map((_, teamIndex) => {
                const isActive =
                  activeCell?.question === questionIndex && activeCell?.team === teamIndex;
                const score = scores[questionIndex]?.[teamIndex];

                const totalWickets = getTeamTotals(teamIndex).wickets;
                const isOut = totalWickets >= 10;

                let displayValue = '-';
                if (score) {
                    if (score.isWicket) {
                        displayValue = 'W';
                    } else {
                        displayValue = score.runs.toString();
                    }
                }

                return (
                  <TableCell
                    key={teamIndex}
                    ref={isActive ? activeCellRef : null}
                    className={cn(
                      'text-center font-mono text-lg transition-all duration-200 cursor-pointer hover:bg-muted/50',
                      isActive && 'bg-accent/20 ring-2 ring-accent rounded-md',
                      score !== undefined ? 'font-bold' : 'text-muted-foreground',
                      score?.isWicket && 'text-destructive',
                      questionIndex > numQuestions && 'cursor-not-allowed',
                      isOut && (monitorSettings.theme === 'dark' ? 'theme-light' : 'theme-dark')
                    )}
                    onClick={() => handleCellClick(questionIndex, teamIndex)}
                  >
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
