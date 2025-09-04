
'use client';

import { useQuiz, type Score } from '@/contexts/quiz-context';
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
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Copy, RefreshCw, Settings, ArrowRight, WifiOff, Wifi } from 'lucide-react';
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


const HEARTBEAT_TIMEOUT = 5000; // 5 seconds

export default function PrimaryPage() {
  const { quizState, setQuizState, initialState } = useQuiz();
  const router = useRouter();
  const { toast } = useToast();
  const [roundName, setRoundName] = useState('');
  const [isEndRoundAlertOpen, setIsEndRoundAlertOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMonitorConnected, setIsMonitorConnected] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !quizState.verificationCode) {
      router.push('/');
    }
  }, [quizState.verificationCode, router, isClient]);

   useEffect(() => {
    if (!quizState.monitorHeartbeat) {
        setIsMonitorConnected(false);
        return;
    }

    const checkConnection = () => {
       if (quizState.monitorHeartbeat && (Date.now() - quizState.monitorHeartbeat) < HEARTBEAT_TIMEOUT) {
        setIsMonitorConnected(true);
      } else {
        setIsMonitorConnected(false);
      }
    }

    checkConnection();
    const connectionCheckInterval = setInterval(checkConnection, 3000); 

    return () => clearInterval(connectionCheckInterval);
  }, [quizState.monitorHeartbeat]);

  const handleNewCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setQuizState((prev) => ({ ...prev, verificationCode: newCode }));
    toast({ title: 'New code generated', description: `The new code is ${newCode}` });
  };

  const handleCopyCode = () => {
    if (quizState.verificationCode) {
      navigator.clipboard.writeText(quizState.verificationCode);
      toast({ title: 'Code Copied!', description: 'The verification code has been copied to your clipboard.' });
    }
  };

  const handleSetTeams = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teams = Number(formData.get('teams'));
    if (teams > 0 && teams <= 20) {
      setQuizState((prev) => ({
        ...prev,
        numTeams: teams,
        teamNames: Array.from({ length: teams }, (_, i) => `Team ${i + 1}`),
        activeCell: { question: 0, team: 0 },
        scores: {},
        rounds: prev.rounds || [],
        numQuestions: 0,
      }));
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid number of teams',
        description: 'Please enter a number between 1 and 20.',
      });
    }
  };

  const handleScore = (points: number | 'WICKET') => {
    if (!quizState.activeCell) return;

    const { question, team } = quizState.activeCell;

    setQuizState((prev) => {
      const newScores = { ...prev.scores };
      const score: Score = {
        runs: points === 'WICKET' ? 0 : points,
        isWicket: points === 'WICKET',
      };
      
      if (!newScores[question]) {
        newScores[question] = {};
      }
      newScores[question][team] = score;

      let nextTeam = team + 1;
      let nextQuestion = question;
      let newNumQuestions = prev.numQuestions;

      if (nextTeam >= prev.numTeams) {
        nextTeam = 0;
        nextQuestion = question + 1;
      }
      
      if (nextQuestion > newNumQuestions) {
          newNumQuestions = nextQuestion;
      }

      const newActiveCell = { question: nextQuestion, team: nextTeam };

      return { ...prev, scores: newScores, activeCell: newActiveCell, numQuestions: newNumQuestions };
    });
  };

  const handleNextQuestion = () => {
     if (!quizState.activeCell) return;
     const currentQuestion = quizState.activeCell.question;

     setQuizState(prev => {
        const newScores = { ...prev.scores };
        if (!newScores[currentQuestion]) {
            newScores[currentQuestion] = {};
        }

        for (let i = 0; i < prev.numTeams; i++) {
            if (newScores[currentQuestion][i] === undefined) {
                newScores[currentQuestion][i] = { runs: 0, isWicket: false };
            }
        }
        
        const nextQuestion = currentQuestion + 1;
        const newNumQuestions = Math.max(prev.numQuestions, nextQuestion);

        return {
            ...prev,
            scores: newScores,
            activeCell: { question: nextQuestion, team: 0 },
            numQuestions: newNumQuestions,
        };
     });
  };

  const handleEndRound = () => {
    if (!roundName.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Over Name', description: 'Please enter a name for this over.' });
      return;
    }
    setQuizState(prev => {
      const roundToAdd = {
        name: roundName,
        scores: prev.scores
      };
      
      return {
        ...prev,
        rounds: [...(prev.rounds || []), roundToAdd],
        scores: {},
        activeCell: { question: 0, team: 0 },
        numQuestions: 0,
      };
    });
    setRoundName('');
    setIsEndRoundAlertOpen(false);
    toast({ title: 'Over Ended', description: `Over "${roundName}" has been saved.` });
  };
  
  if (!isClient || !quizState.verificationCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
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
                        {quizState.verificationCode}
                    </p>
                    <Button variant="ghost" size="icon" onClick={handleCopyCode}><Copy className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" onClick={handleNewCode}><RefreshCw className="h-5 w-5"/></Button>
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
            <Button variant="outline" size="icon" onClick={() => router.push('/primary/settings')}>
                <Settings />
                <span className="sr-only">Settings</span>
            </Button>
        </div>
      </header>

      <main className="flex-grow overflow-auto relative">
        {!isMonitorConnected && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center">
                <WifiOff className="h-16 w-16 text-destructive" />
                <h2 className="mt-4 text-2xl font-bold font-headline">Monitor Disconnected</h2>
                <p className="text-muted-foreground">Scoring is paused. Please ensure the monitor device is connected.</p>
            </div>
        )}
        <ScoringGrid />
      </main>
      
      <footer className="flex-shrink-0">
        <PointButtons onScore={handleScore} disabled={!isMonitorConnected} />
        <div className="mt-4 flex justify-between items-center">
             <AlertDialog open={isEndRoundAlertOpen} onOpenChange={setIsEndRoundAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" disabled={!isMonitorConnected}>End Over</Button>
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
            <Button onClick={handleNextQuestion} disabled={!isMonitorConnected}>
                Next Ball <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </footer>
    </div>
  )
}
