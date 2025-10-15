
import { Suspense } from 'react';
import ExamClient from '@/components/exam-client';
import type { Question, Paper } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { getQuestionsFromFirestore, getPaperById } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

type QuizPageProps = {
  searchParams: { 
    limit?: string;
    difficulty?: string;
    paperId?: string;
    subject?: string;
    questionType?: string;
    time?: string;
  };
};

async function QuizLoader({ searchParams }: QuizPageProps) {
  const { 
    limit: limitParam, 
    difficulty: difficultyParam, 
    paperId, 
    subject, 
    questionType,
    time: timeParam 
  } = searchParams;

  const limit = paperId ? 60 : parseInt(limitParam || '10');
  const difficulty = difficultyParam || 'easy,medium,hard';
  
  let paper: Paper | null = null;
  if (paperId) {
    paper = await getPaperById(paperId);
  }

  // If a paper is loaded, use its time, otherwise use URL param or default
  const timeInMinutes = paper?.time || (limit * 1); // Default 1 min per question for custom quizzes
  const totalTimeInSeconds = timeInMinutes * 60;

  const questions = await getQuestionsFromFirestore(
    difficulty, 
    limit, 
    paperId, 
    subject, 
    questionType
  );

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto flex items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              No Questions Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We couldn't find any questions with the selected criteria. Please adjust your selection or check the questions subcollection for your paper in Firestore.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <ExamClient questions={questions} totalTime={totalTimeInSeconds} paperSubjects={paper?.subjects || []} paperId={paperId} />;
}

function QuizSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
             <CardFooter>
              <Skeleton className="h-10 w-48 ml-auto" />
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-5 w-20 mb-3" />
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="w-9 h-9 rounded" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}


export default function QuizPage({ searchParams }: QuizPageProps) {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizLoader searchParams={searchParams} />
    </Suspense>
  );
}
