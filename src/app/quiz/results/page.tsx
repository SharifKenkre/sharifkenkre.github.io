'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, BarChart, RotateCcw } from 'lucide-react';

type ResultData = {
  score: number;
  total: number;
  answers: { question: string; answer: string; isCorrect: boolean }[];
};

export default function ResultsPage() {
  const [results, setResults] = useState<ResultData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const resultsData = sessionStorage.getItem('quizResults');
    if (resultsData) {
      setResults(JSON.parse(resultsData));
      // sessionStorage.removeItem('quizResults');
    } else {
      router.push('/quiz-selection');
    }
  }, [router]);

  if (!results) {
    return <div className="container mx-auto p-4 text-center animate-pulse">Loading results...</div>;
  }

  const percentage = Math.round((results.score / results.total) * 100);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Quiz Completed!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Here's how you did.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-around p-6 bg-secondary/50 rounded-lg">
            <div className="flex flex-col items-center">
              <p className="text-xl font-medium">Your Score</p>
              <p className="text-6xl font-bold text-primary">{results.score}<span className="text-4xl text-muted-foreground">/{results.total}</span></p>
            </div>
            <div className="w-full sm:w-px h-px sm:h-24 bg-border my-4 sm:my-0"></div>
            <div className="flex flex-col items-center">
              <p className="text-xl font-medium">Accuracy</p>
              <p className="text-6xl font-bold text-accent">{percentage}%</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <BarChart className="h-6 w-6" />
              Review Your Answers
            </h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {results.answers.map((item, index) => (
                <div key={index} className="flex items-start p-3 border rounded-lg bg-card">
                  {item.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">{item.question}</p>
                    <p className="text-sm text-muted-foreground">Your answer: {item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/quiz-selection">
              <RotateCcw className="mr-2 h-4 w-4" />
              Take Another Quiz
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
