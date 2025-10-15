
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { useEffect, useState } from 'react';
import { getPapersFromFirestore } from '@/lib/actions';
import type { Paper } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function LandingPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPapersFromFirestore()
      .then(setPapers)
      .finally(() => setLoading(false));
  }, []);

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
                {loading ? (
                  <Button variant="outline" disabled>
                    <Skeleton className="h-5 w-5 mr-2" />
                    <Skeleton className="h-4 w-24" />
                  </Button>
                ) : (
                  <Button variant="outline">
                    <SlidersHorizontal className="mr-2" /> Customise Test
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Customize Your Quiz</DialogTitle>
                  <DialogDescription>
                    Tailor the quiz to your needs. Choose papers, difficulty, and more.
                  </DialogDescription>
                </DialogHeader>
                <QuizSetup allPapers={papers} />
              </DialogContent>
            </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
