'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useQuiz } from '@/contexts/quiz-context';
import { Monitor, MousePointerClick, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { setQuizState, initialState } = useQuiz();

  const handleSelectPrimary = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setQuizState({
      ...initialState,
      verificationCode: newCode,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-4 mb-4">
           <Zap className="h-12 w-12 text-primary" />
           <h1 className="text-5xl font-bold font-headline text-foreground">
            QuizPoint Central
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome! Please select your role to begin. The Primary interface controls the scoring, while the Monitor interface displays the results.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-2xl">
          <CardHeader className="items-center text-center">
            <Monitor className="w-16 h-16 mb-4 text-accent" />
            <CardTitle className="text-2xl font-headline">Monitor</CardTitle>
            <CardDescription>
              Displays scores in real-time. Connects to a primary device using a verification code.
            </CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter>
            <Link href="/monitor" className="w-full">
              <Button className="w-full" variant="outline">
                Open Monitor
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card className="transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-2xl">
          <CardHeader className="items-center text-center">
            <MousePointerClick className="w-16 h-16 mb-4 text-accent" />
            <CardTitle className="text-2xl font-headline">Primary (Scoring)</CardTitle>
            <CardDescription>
              Manages team setup and point allocation. Generates a code for the monitor to connect.
            </CardDescription>
          </CardHeader>
          <CardContent />
          <CardFooter>
            <Link href="/primary" className="w-full">
              <Button className="w-full" onClick={handleSelectPrimary}>
                Start Scoring
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
