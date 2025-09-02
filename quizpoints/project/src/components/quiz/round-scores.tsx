
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function RoundScores() {
  const { quizState } = useQuiz();
  const { numTeams, rounds, teamNames } = quizState;

  if (!rounds || rounds.length === 0) {
    return null;
  }
  
  const roundTotals = rounds.map(round => {
    return Array.from({ length: numTeams }, (_, teamIndex) => {
      let totalRuns = 0;
      let totalWickets = 0;
      Object.values(round.scores).forEach((questionScores) => {
        const score = questionScores[teamIndex];
        if (score) {
          totalRuns += score.runs || 0;
          if (score.isWicket) {
            totalWickets += 1;
          }
        }
      });
      return { runs: totalRuns, wickets: totalWickets };
    });
  });

  return (
    <Card className={cn("shadow-lg", quizState.monitorSettings.compact && "p-2")}>
        <CardHeader>
            <CardTitle className={cn("text-3xl font-bold font-headline text-center", quizState.monitorSettings.compact && "text-xl")}>
                Over Summary
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="font-headline">Over</TableHead>
                        {teamNames.map((name, teamIndex) => (
                        <TableHead key={teamIndex} className="text-center font-headline">
                            {name}
                        </TableHead>
                        ))}
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {rounds.map((round, roundIndex) => (
                        <TableRow key={roundIndex}>
                        <TableCell className="font-medium font-headline">{round.name}</TableCell>
                        {roundTotals[roundIndex].map((total, teamIndex) => (
                            <TableCell key={teamIndex} className="text-center font-mono text-lg">
                                {total.runs}/{total.wickets}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
      </CardContent>
    </Card>
  );
}
