
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPaperById } from '@/lib/actions';
import { useEffect, useState } from 'react';
import type { Paper } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function QuizSelectionContent() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get('paperId');
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paperId) {
      setLoading(true);
      getPaperById(paperId)
        .then(setPaper)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [paperId]);

  // Default time is 10 minutes (600 seconds)
  // If a paper is found and has a time, use it (and convert from minutes to seconds)
  const timeInSeconds = paper?.time ? paper.time * 60 : 600;

  const baseQuizUrl = `/quiz?limit=10&difficulty=easy,medium,hard&time=${timeInSeconds}${paperId ? `&paperId=${paperId}` : ''}`;

  if (loading) {
      return (
          <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
              </CardHeader>
              <CardContent className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">{paper ? paper.title : 'Prepare for your Exam'}</CardTitle>
        <CardDescription>{paper ? `${paper.exam} - ${paper.year}` : 'Choose how you want to start your quiz.'}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild size="lg">
          <Link href={baseQuizUrl}>
            <Zap className="mr-2" /> Start Instant Test
          </Link>
        </Button>
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
