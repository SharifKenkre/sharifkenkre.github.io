
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Question, AnswerState } from '@/lib/types';

type QuestionSidebarProps = {
  questions: Question[];
  answerStates: AnswerState[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  onSubmit: () => void;
  totalTime: number; // in seconds
};

function Timer({ timeLeft, setTimeLeft }: { timeLeft: number; setTimeLeft: (time: number) => void }) {
  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, setTimeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return <div className="text-2xl font-bold font-mono tracking-widest text-blue-600">{formatTime(timeLeft)}</div>;
}

export default function QuestionSidebar({
  questions,
  answerStates,
  currentQuestionIndex,
  onQuestionSelect,
  onSubmit,
  totalTime,
}: QuestionSidebarProps) {
  const [timeLeft, setTimeLeft] = useState(totalTime);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onSubmit();
    }
  }, [timeLeft, onSubmit]);

  const getStatusClasses = (status: AnswerState['status']) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white';
      case 'not-answered':
        return 'bg-red-500 text-white';
      case 'marked-for-review':
        return 'bg-purple-500 text-white';
      case 'answered-and-marked':
        return 'bg-purple-500 text-white relative after:content-["✓"] after:text-xs after:absolute after:bottom-0.5 after:right-0.5';
      case 'not-visited':
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusCount = (status: AnswerState['status']) => 
    answerStates.filter(s => s.status === status).length;

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">Time Left</CardTitle>
          <Timer timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Answered ({getStatusCount('answered')})</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Not Answered ({getStatusCount('not-answered')})</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-200 mr-2"></span>Not Visited ({answerStates.filter(s => s.status === 'not-visited').length})</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>Marked ({getStatusCount('marked-for-review') + getStatusCount('answered-and-marked')})</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-base mb-3 border-t pt-4">Questions</h4>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded text-sm font-medium transition-colors",
                  getStatusClasses(answerStates[index]?.status),
                  index === currentQuestionIndex && "ring-2 ring-blue-500 ring-offset-1"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={onSubmit} disabled={timeLeft <= 0}>
          Submit Exam
        </Button>
      </CardFooter>
    </Card>
  );
}
