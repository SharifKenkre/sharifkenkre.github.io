
'use client';

import { useQuiz, type Score, type QuizState } from '@/contexts/quiz-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Copy, Settings, ArrowRight } from 'lucide-react';
import { ScoringGrid } from '@/components/quiz/scoring-grid';
import { PointButtons } from '@/components/quiz/point-buttons';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PingIndicator } from '@/components/quiz/ping-indicator';

const getWicketsForTeam = (teamIndex: number, rounds: QuizState['rounds'], scores: QuizState['scores']): number => {
    let totalWickets = 0;
    
    const processScores = (scoreData: Record<number, Record<number, any>>) => {
        if (!scoreData) return;
        Object.values(scoreData).forEach(questionScores => {
            const score = questionScores[teamIndex];
            if (score && score.isWicket) {
                totalWickets += 1;
            }
        });
    };

    (rounds || []).forEach(round => processScores(round.scores));
    processScores(scores);
    
    return totalWickets;
};


export default function PrimaryPage() {
  const { quizState, setQuizState, loadQuiz, isLoaded } = useQuiz();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [roundName, setRoundName] = useState('');
  const [isEndRoundAlertOpen, setIsEndRoundAlertOpen] = useState(false);
  const [isMonitorConnected, setIsMonitorConnected] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadQuiz(id);
    } else {
        router.push('/');
    }
  }, [searchParams, loadQuiz, router]);

  useEffect(() => {
      if (quizState?.monitorHeartbeat) {
          const timeSinceHeartbeat = Date.now() - quizState.monitorHeartbeat;
          setIsMonitorConnected(timeSinceHeartbeat < 10000);
      } else {
          setIsMonitorConnected(false);
      }
  }, [quizState?.monitorHeartbeat]);

  const handleCopyCode = () => {
    if (quizState?.id) {
      navigator.clipboard.writeText(quizState.id);
      toast({ title: 'Code Copied!', description: 'The verification code has been copied to your clipboard.' });
    }
  };

  const handleSetTeams = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quizState) return;

    const formData = new FormData(e.currentTarget);
    const teams = Number(formData.get('teams'));
    if (teams > 0 && teams <= 20) {
      setQuizState((prev) => {
        if (!prev) return null;
        return {
            ...prev,
            numTeams: teams,
            teamNames: Array.from({ length: teams }, (_, i) => `Team ${i + 1}`),
            scores: {},
            rounds: prev.rounds || [],
            numQuestions: 0,
            activeCell: { question: 0, team: 0 },
        }
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid number of teams',
        description: 'Please enter a number between 1 and 20.',
      });
    }
  };


  const handleScore = (points: number | 'WICKET') => {
    if (!quizState?.activeCell) return;
    const { question, team } = quizState.activeCell;

    setQuizState((prev) => {
      if (!prev) return null;

      const advanceToNextAvailableCell = (currentTeam: number, currentQuestion: number, scores: QuizState['scores'], rounds: QuizState['rounds'], numTeams: number) => {
          let nextTeam = currentTeam + 1;
          let nextQuestion = currentQuestion;

          // Find the next team that is not out
          while (nextTeam < numTeams && getWicketsForTeam(nextTeam, rounds, scores) >= 10) {
              nextTeam++;
          }

          if (nextTeam >= numTeams) {
              nextTeam = 0;
              nextQuestion = currentQuestion + 1;
               while (nextTeam < numTeams && getWicketsForTeam(nextTeam, rounds, scores) >= 10) {
                  nextTeam++;
              }
          }
          
          return { question: nextQuestion, team: nextTeam };
      };

      const wicketsForTeam = getWicketsForTeam(team, prev.rounds, prev.scores);
      
      const score: Score = {
        runs: points === 'WICKET' ? 0 : points,
        isWicket: points === 'WICKET',
      };
      
      // If team is already out, assign 0 runs and move on
      if (wicketsForTeam >= 10) {
          score.runs = 0;
          score.isWicket = false;
      }

      const newScores = { ...prev.scores };
      if (!newScores[question]) {
        newScores[question] = {};
      }
      newScores[question][team] = score;

      // Recalculate wickets with the new score included to check if they are now out
      const newWickets = getWicketsForTeam(team, prev.rounds, newScores);
      
      const newActiveCell = advanceToNextAvailableCell(team, question, newScores, prev.rounds, prev.numTeams);
      const newNumQuestions = Math.max(prev.numQuestions, newActiveCell.question);

      return { ...prev, scores: newScores, activeCell: newActiveCell, numQuestions: newNumQuestions };
    });
  };

  const handleNextQuestion = () => {
     if (!quizState?.activeCell) return;
     const currentQuestion = quizState.activeCell.question;

     setQuizState(prev => {
        if (!prev) return null;
        const newScores = { ...prev.scores };
        if (!newScores[currentQuestion]) {
            newScores[currentQuestion] = {};
        }
        
        let nextQuestion = currentQuestion + 1;
        let nextTeam = 0;

        // Skip any teams that are out at the start of the new "ball"
        while (nextTeam < prev.numTeams && getWicketsForTeam(nextTeam, prev.rounds, newScores) >= 10) {
            nextTeam++;
        }

        const newNumQuestions = Math.max(prev.numQuestions, nextQuestion);
        const newActiveCell = { question: nextQuestion, team: nextTeam };

        return {
            ...prev,
            scores: newScores,
            activeCell: newActiveCell,
            numQuestions: newNumQuestions,
        };
     });
  };

  const handleEndRound = () => {
    if (!quizState) return;
    if (!roundName.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Over Name', description: 'Please enter a name for this over.' });
      return;
    }
    setQuizState(prev => {
        if (!prev) return null;
      const roundToAdd = {
        name: roundName,
        scores: prev.scores
      };
      
      let nextTeam = 0;
      while (nextTeam < prev.numTeams && getWicketsForTeam(nextTeam, [...(prev.rounds || []), roundToAdd], {}) >= 10) {
          nextTeam++;
      }

      return {
        ...prev,
        rounds: [...(prev.rounds || []), roundToAdd],
        scores: {},
        activeCell: { question: 0, team: nextTeam },
        numQuestions: 0,
      };
    });
    setRoundName('');
    setIsEndRoundAlertOpen(false);
    toast({ title: 'Over Ended', description: `Over "${roundName}" has been saved.` });
  };
  
  if (!isLoaded || !quizState) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading Quiz...</p>
      </div>
    );
  }

  if (quizState.numTeams === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader>
            <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <CardTitle className="text-center font-headline pt-8">Setup Your Match</CardTitle>
            <CardDescription className="text-center">First, share the code with the Monitor. Then, set the number of teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center space-y-2">
                <Label className="text-sm text-muted-foreground">Verification Code</Label>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-5xl font-bold font-mono tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-lg">
                        {quizState.id}
                    </p>
                    <Button variant="ghost" size="icon" onClick={handleCopyCode}><Copy className="h-5 w-5"/></Button>
                </div>
            </div>
            <form className="space-y-4" onSubmit={handleSetTeams}>
                <div className="space-y-2">
                    <Label htmlFor="teams">Number of Teams</Label>
                    <Input id="teams" name="teams" type="number" min="1" max="20" placeholder="e.g., 2" required />
                </div>
                <Button type="submit" className="w-full">Start Match</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <header className="flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Scoring</h1>
        <div className="flex items-center gap-4">
            <PingIndicator isConnected={isMonitorConnected} />
             <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Over</p>
                <p className="font-bold">{quizState.numQuestions} Balls</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => router.push(`/primary/settings?id=${quizState.id}`)}>
                <Settings />
                <span className="sr-only">Settings</span>
            </Button>
        </div>
      </header>

      <main className="flex-grow overflow-auto relative">
        <ScoringGrid />
      </main>
      
      <footer className="flex-shrink-0">
        <PointButtons onScore={handleScore} />
        <div className="mt-4 flex justify-between items-center">
             <AlertDialog open={isEndRoundAlertOpen} onOpenChange={setIsEndRoundAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">End Over</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Current Over?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will save the current scores as a completed over. Please provide a name for this over.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="round-name">Over Name</Label>
                    <Input
                        id="round-name"
                        value={roundName}
                        onChange={(e) => setRoundName(e.target.value)}
                        placeholder={`e.g., Over ${(quizState.rounds || []).length + 1}`}
                    />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndRound}>End Over</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleNextQuestion}>
                Next Ball <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </footer>
    </div>
  )
}
