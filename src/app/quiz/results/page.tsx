
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, BarChart, RotateCcw, MinusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

type Answer = { 
  question: string; 
  answer: string; 
  isCorrect: boolean;
};

type ResultData = {
  score: number;
  total: number;
  answers: Answer[];
};

type SortOrder = 'all' | 'correct' | 'incorrect' | 'skipped';

export default function ResultsPage() {
  const [results, setResults] = useState<ResultData | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('all');
  const router = useRouter();

  useEffect(() => {
    const resultsData = sessionStorage.getItem('quizResults');
    if (resultsData) {
      setResults(JSON.parse(resultsData));
    } else {
      router.push('/quiz-selection');
    }
  }, [router]);

  const sortedAnswers = useMemo(() => {
    if (!results) return [];
    
    const answersCopy = [...results.answers];

    switch (sortOrder) {
      case 'correct':
        return answersCopy.sort((a, b) => (b.isCorrect ? 1 : 0) - (a.isCorrect ? 1 : 0));
      case 'incorrect':
        return answersCopy.sort((a, b) => (!b.isCorrect && b.answer !== 'Not Answered' ? 1 : 0) - (!a.isCorrect && a.answer !== 'Not Answered' ? 1 : 0));
      case 'skipped':
        return answersCopy.sort((a, b) => (b.answer === 'Not Answered' ? 1 : 0) - (a.answer === 'Not Answered' ? 1 : 0));
      case 'all':
      default:
        return answersCopy;
    }
  }, [results, sortOrder]);

  if (!results) {
    return <div className="container mx-auto p-4 text-center animate-pulse">Loading results...</div>;
  }

  const percentage = Math.round((results.score / results.total) * 100);
  
  const getIcon = (item: Answer) => {
    if (item.answer === 'Not Answered') {
      return <MinusCircle className="h-5 w-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />;
    }
    return item.isCorrect ? (
      <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
    ) : (
      <XCircle className="h-5 w-5 text-destructive mr-3 mt-1 flex-shrink-0" />
    );
  };

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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <BarChart className="h-6 w-6" />
                Review Your Answers
              </h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort-answers" className="text-sm">Sort by</Label>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                  <SelectTrigger id="sort-answers" className="w-[180px]">
                    <SelectValue placeholder="Sort answers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Default</SelectItem>
                    <SelectItem value="correct">Correct First</SelectItem>
                    <SelectItem value="incorrect">Incorrect First</SelectItem>
                    <SelectItem value="skipped">Skipped First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {sortedAnswers.map((item, index) => (
                <div key={index} className="flex items-start p-3 border rounded-lg bg-card">
                  {getIcon(item)}
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
