
'use client';

import { useQuiz } from '@/contexts/quiz-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type PreviewScore = {
  name: string;
  runs: number;
  wickets: number;
  height: number;
};

const TeamScoreCard = ({ name, runs, wickets, isCompact }: { name: string; runs: number; wickets: number, isCompact: boolean; }) => (
    <Card
      className={cn(
        "shadow-lg transition-all duration-300 hover:shadow-2xl relative overflow-hidden w-full",
         isCompact ? 'sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]' : 'sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]'
      )}
    >
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-headline text-center">{name}</CardTitle>
      </CardHeader>
      <CardContent className="relative text-center">
        <p className={cn(
          "text-7xl font-bold font-mono text-primary",
          isCompact && "text-5xl"
        )}>
          {runs}/{wickets}
        </p>
      </CardContent>
    </Card>
);

const SkeletonCard = ({ isCompact }: { isCompact: boolean }) => (
     <Card className={cn(
        "shadow-lg animate-pulse",
        "w-full",
         isCompact ? 'sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] lg:w-[calc(25%-0.75rem)] xl:w-[calc(20%-0.8rem)]' : 'sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]'
      )}>
        <CardHeader><CardTitle className="text-2xl h-8 rounded-md bg-muted/50 font-headline text-center"></CardTitle></CardHeader>
        <CardContent><div className="h-16 w-1/2 mx-auto rounded-md bg-muted/50" /></CardContent>
     </Card>
)

export function TeamTotalScores() {
  const { quizState } = useQuiz();
  const { numTeams, scores, rounds, teamNames, monitorSettings } = quizState;
  const [isMounted, setIsMounted] = useState(false);
  const [previewScores, setPreviewScores] = useState<PreviewScore[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setPreviewScores(
      Array.from({ length: 4 }).map((_, i) => ({
        name: `Team ${i + 1}`,
        runs: Math.floor(Math.random() * 200),
        wickets: Math.floor(Math.random() * 10),
        height: Math.random() * 60 + 20, 
      }))
    );
  }, []);

  const containerClasses = cn(
    'flex flex-wrap justify-center',
    monitorSettings.compact ? 'gap-2' : 'gap-4 md:gap-6'
  );

  if (!isMounted) {
    return (
        <div className={containerClasses}>
          {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} isCompact={monitorSettings.compact} />)}
        </div>
    );
  }
  
  if (numTeams === 0) {
    return (
      <Card className={cn("shadow-lg", quizState.monitorSettings.compact && "p-2")}>
        <CardHeader>
            <CardTitle className={cn("text-3xl font-bold font-headline text-center", quizState.monitorSettings.compact && "text-xl")}>
                Scoreboard
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className={containerClasses}>
                {previewScores.map((preview, index) => (
                    <TeamScoreCard 
                        key={index} 
                        name={preview.name} 
                        runs={preview.runs}
                        wickets={preview.wickets}
                        isCompact={monitorSettings.compact}
                    />
                ))}
            </div>
        </CardContent>
      </Card>
    );
  }

  const teamTotals = Array.from({ length: numTeams }, (_, teamIndex) => {
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
  });

  return (
     <Card className={cn("shadow-lg", quizState.monitorSettings.compact && "p-2")}>
        <CardHeader>
            <CardTitle className={cn("text-3xl font-bold font-headline text-center", quizState.monitorSettings.compact && "text-xl")}>
                Scoreboard
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className={containerClasses}>
            {teamTotals.map((total, index) => (
                <TeamScoreCard 
                    key={index} 
                    name={teamNames[index] || `Team ${index + 1}`} 
                    runs={total.runs}
                    wickets={total.wickets}
                    isCompact={monitorSettings.compact}
                />
            ))}
            </div>
        </CardContent>
    </Card>
  );
}
