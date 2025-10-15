'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuizSetup } from '@/components/quiz-setup';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 md:px-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">GPSC Exam</CardTitle>
          <CardDescription>
            Prepare for your upcoming GPSC exam with our tailored quizzes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
            <Button asChild>
              <Link href="/papers">
                View Available Papers <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
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
                <QuizSetup paperId={null} />
              </DialogContent>
            </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
