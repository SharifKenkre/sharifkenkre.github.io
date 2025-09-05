
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuiz } from '@/contexts/quiz-context';
import { Monitor, MousePointerClick, Zap, Link } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function Home() {
  const { createQuiz } = useQuiz();
  const router = useRouter();
  const [resumeId, setResumeId] = useState('');

  const handleSelectPrimary = () => {
    const newQuizId = createQuiz();
    router.push(`/primary?id=${newQuizId}`);
  };

  const handleResumeQuiz = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (resumeId.trim()) {
      router.push(`/primary?id=${resumeId.trim()}`);
    }
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
             <Button className="w-full" variant="outline" onClick={() => router.push('/monitor')}>
                Open Monitor
              </Button>
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
          <CardFooter className="flex-col gap-2">
              <Button className="w-full" onClick={handleSelectPrimary}>
                Start a New Quiz
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full" variant="secondary">
                        <Link className="mr-2 h-4 w-4" /> Resume Session
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Resume Scoring Session</DialogTitle>
                        <DialogDescription>
                            Enter the 6-digit code for the quiz you want to reconnect to.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResumeQuiz}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="quiz-id" className="text-right">
                                    Quiz ID
                                </Label>
                                <Input
                                    id="quiz-id"
                                    value={resumeId}
                                    onChange={(e) => setResumeId(e.target.value)}
                                    className="col-span-3"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Reconnect</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
               </Dialog>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
