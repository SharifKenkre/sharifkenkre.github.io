
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuiz } from '@/contexts/quiz-context';

interface PointButtonsProps {
  onScore: (points: number | 'WICKET') => void;
  disabled?: boolean;
}

export function PointButtons({ onScore, disabled = false }: PointButtonsProps) {
    const { quizState } = useQuiz();
    const { pointValues } = quizState;
    const activeTeamIndex = quizState.activeCell ? quizState.activeCell.team : null;
    const activeTeamName = activeTeamIndex !== null ? quizState.teamNames[activeTeamIndex] : '';
    const activeQuestion = quizState.activeCell ? quizState.activeCell.question + 1 : null;

  if (!quizState.activeCell) {
    return (
        <Card className="text-center p-8">
            <CardTitle className="font-headline">Ready for next ball</CardTitle>
            <CardDescription>Click the "Next Ball" button to continue.</CardDescription>
        </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-headline">
          Scoring Ball {activeQuestion} for {activeTeamName}
        </CardTitle>
        <CardDescription>Select runs or a wicket to assign, or click a cell to edit.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {pointValues.map((point, index) => (
            <Button
              key={index}
              onClick={() => onScore(point)}
              className="h-16 text-xl font-bold transform hover:scale-110 transition-transform"
              variant={point === 'WICKET' ? 'destructive' : point === 0 ? 'secondary' : 'default'}
              disabled={disabled}
            >
              {point}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
