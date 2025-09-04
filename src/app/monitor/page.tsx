
'use client';

import { useQuiz } from '@/contexts/quiz-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, type FormEvent, useEffect } from 'react';
import { TeamTotalScores } from '@/components/quiz/team-total-scores';
import { useToast } from '@/hooks/use-toast';
import { Tv, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { RoundScores } from '@/components/quiz/round-scores';
import { cn } from '@/lib/utils';
import { QuizLabsLogo } from '@/components/quiz/quiz-labs-logo';

export default function MonitorPage() {
  const { quizState, setQuizState } = useQuiz();
  const [verified, setVerified] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!verified) return;

    // Start sending heartbeat when connected
    const heartbeatInterval = setInterval(() => {
        setQuizState(prev => ({...prev, monitorHeartbeat: Date.now()}))
    }, 2000); // Send heartbeat every 2 seconds

    return () => clearInterval(heartbeatInterval);
  }, [verified, setQuizState]);

  const handleVerify = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputCode === quizState.verificationCode) {
      setVerified(true);
      toast({
        title: 'Successfully Connected!',
        description: 'Now displaying scores from the primary device.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'The verification code is incorrect. Please try again.',
      });
    }
  };
  
  if (!verified) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
             <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back Home
            </Button>
            <div className="flex justify-center mb-4 pt-8">
              <Tv className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-center font-headline">Connect to Quiz</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit verification code from the Primary (Scoring) device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleVerify}>
              <div className="space-y-2">
                <Label htmlFor="code" className="sr-only">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="------"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="text-center text-2xl font-mono tracking-[0.5em] h-14"
                />
              </div>
              <Button type="submit" className="w-full">
                Connect
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizState.numTeams === 0) {
      return (
        <div className="flex min-h-screen items-center justify-center text-center p-4">
            <div>
                <Zap className="mx-auto h-16 w-16 text-primary animate-pulse" />
                <h2 className="mt-4 text-2xl font-bold font-headline">Waiting for Setup...</h2>
                <p className="text-muted-foreground">The primary device is currently setting up the number of teams.</p>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen relative">
        <QuizLabsLogo />
        <main className={cn("flex-grow p-4 md:p-8 flex flex-col items-center justify-center gap-8 w-full")}>
            <header className="w-full max-w-7xl mx-auto text-center">
                <h1 className="text-5xl font-bold font-headline text-primary">{quizState.quizTitle}</h1>
                <p className="text-muted-foreground">Scores update in real-time as they are entered.</p>
            </header>
            
            <div className="w-full max-w-7xl mx-auto">
                <TeamTotalScores />
            </div>
            
            {(quizState.rounds || []).length > 0 && (
                <div className="w-full max-w-7xl mx-auto">
                    <RoundScores />
                </div>
            )}
        </main>
        <footer className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Made by Sharif</p>
        </footer>
    </div>
  );
}
