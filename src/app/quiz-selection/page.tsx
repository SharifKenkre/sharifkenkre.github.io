
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QuizSetup } from '@/components/quiz-setup';
import { Zap, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function QuizSelectionContent() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get('paperId');

  const baseQuizUrl = `/quiz?limit=10&difficulty=easy&time=600${paperId ? `&paperId=${paperId}` : ''}`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Prepare for your Exam</CardTitle>
        <CardDescription>Choose how you want to start your quiz.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild size="lg">
          <Link href={baseQuizUrl}>
            <Zap className="mr-2" /> Start Instant Test
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              <SlidersHorizontal className="mr-2" /> Customise Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Customize Your Quiz</DialogTitle>
              <DialogDescription>
                Tailor the quiz to your needs. Choose the difficulty, time, and number of questions.
              </DialogDescription>
            </DialogHeader>
            <QuizSetup paperId={paperId} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}


export default function QuizSelectionPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 md:px-6">
        <QuizSelectionContent />
    </div>
  );
}
