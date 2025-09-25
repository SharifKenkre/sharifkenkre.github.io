
import { Suspense } from 'react';
import ExamClient from '@/components/exam-client';
import type { Question } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { getQuestionsFromFirestore } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

type QuizPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

async function QuizLoader({ searchParams }: QuizPageProps) {
  const limit = parseInt(searchParams.limit as string) || 10;
  const difficulty = searchParams.difficulty as string || 'easy,medium,hard';
  const section = searchParams.section as string | undefined;
  const paperId = searchParams.paperId as string | undefined;
  const subject = searchParams.subject as string | undefined;
  const questionType = searchParams.questionType as string | undefined;
  const time = parseInt(searchParams.time as string) || (limit * 60); // default 1 min per question

  const questions = await getQuestionsFromFirestore(difficulty, limit, section, paperId, subject, questionType);

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
              We couldn't find any questions with the selected criteria. Please adjust your selection or check your 'questions' collection in Firestore.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return <ExamClient questions={questions} totalTime={time} />;
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
