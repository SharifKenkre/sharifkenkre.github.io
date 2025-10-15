
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import QuestionSidebar from './question-sidebar';
import type { Question, AnswerState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/user-context';
import { ScrollArea } from './ui/scroll-area';
import { saveAttempts } from '@/lib/actions';

type ExamClientProps = {
  questions: Question[];
  totalTime: number; // in seconds
  paperSubjects: string[];
  paperId?: string;
};

export default function ExamClient({ questions: initialQuestions, totalTime, paperSubjects, paperId }: ExamClientProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isMarkedForReview, setIsMarkedForReview] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  
  useEffect(() => {
    // Enforce uniqueness with a Set and use the pre-sorted array from Firestore
    const uniqueQuestions = Array.from(new Map(initialQuestions.map(q => [q.id, q])).values());
    
    setQuestions(uniqueQuestions);

    const initialAnswerStates = uniqueQuestions.map(() => ({
      response: "",
      status: "not-visited",
      isCorrect: false,
    }));

    if (initialAnswerStates.length > 0) {
      initialAnswerStates[0].status = 'not-answered';
    }
    setAnswerStates(initialAnswerStates);
  }, [initialQuestions]);
  
  useEffect(() => {
    if (questions.length > 0) {
      const currentAnswer = answerStates[currentQuestionIndex];
      if (currentAnswer) {
        setCurrentResponse(currentAnswer.response);
        setIsMarkedForReview(currentAnswer.status === 'marked-for-review' || currentAnswer.status === 'answered-and-marked');
      }
    }
  }, [currentQuestionIndex, questions, answerStates]);

  const updateAnswerState = (index: number, response: string, markedForReview: boolean, overrideStatus?: AnswerState['status']) => {
    setAnswerStates(prev => {
      if (index === undefined || index < 0 || index >= prev.length) return prev;
      const newStates = [...prev];
      const hasResponse = response.trim() !== "";
      let status: AnswerState['status'];

      if(overrideStatus) {
        status = overrideStatus;
      } else if (hasResponse && markedForReview) {
        status = 'answered-and-marked';
      } else if (hasResponse) {
        status = 'answered';
      } else if (markedForReview) {
        status = 'marked-for-review';
      } else {
        status = 'not-answered';
      }
      
      const question = questions[index];
      const selectedOptionIndex = question.options ? question.options.findIndex(opt => opt === response) : -1;
      const selectedOptionChar = String.fromCharCode(65 + selectedOptionIndex);
      const isCorrect = hasResponse ? selectedOptionChar === question.answer : false;

      newStates[index] = { response, status, isCorrect };
      return newStates;
    });
  };

  const handleSaveAndNext = () => {
    updateAnswerState(currentQuestionIndex, currentResponse, isMarkedForReview);

    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
       if (answerStates[nextIndex].status === 'not-visited') {
        updateAnswerState(nextIndex, answerStates[nextIndex].response, false, 'not-answered');
      }
      setCurrentQuestionIndex(nextIndex);
    } else {
      toast({ title: "You are at the last question." });
    }
  };

  const handleClearResponse = () => {
    setCurrentResponse("");
  };

  const handleSaveAndMarkForReview = () => {
    updateAnswerState(currentQuestionIndex, currentResponse, true);
    if (currentQuestionIndex < questions.length - 1) {
       const nextIndex = currentQuestionIndex + 1;
       if (answerStates[nextIndex].status === 'not-visited') {
         updateAnswerState(nextIndex, answerStates[nextIndex].response, false, 'not-answered');
       }
       setCurrentQuestionIndex(nextIndex);
    } else {
      toast({ title: "You are at the last question." });
    }
  };
  
  const handleSubmitExam = async () => {
    // Save final answer state before calculating results
    updateAnswerState(currentQuestionIndex, currentResponse, isMarkedForReview);
    
    setTimeout(async () => {
      const score = answerStates.filter(a => a.isCorrect).length;
      
      // if (user) {
      //   const attemptSummary = {
      //     score: score,
      //     total: questions.length,
      //     paperId: paperId || 'custom',
      //   };
      //   try {
      //     await saveAttempts(user.uid, attemptSummary);
      //   } catch (error) {
      //     console.error("Failed to save attempts:", error);
      //     if (error instanceof Error && error.message.includes('permission-denied')) {
      //        toast({ variant: "destructive", title: "Permission Denied", description: "You do not have permission to save quiz history. Please check your Firestore rules." });
      //     } else {
      //       toast({ variant: "destructive", title: "Error", description: "Could not save your progress." });
      //     }
      //   }
      // }

      const results = {
          score: score,
          total: questions.length,
          answers: questions.map((q, i) => ({
              question: q.statement,
              answer: answerStates[i]?.response || "Not Answered",
              isCorrect: answerStates[i]?.isCorrect,
          })),
      };
      sessionStorage.setItem('quizResults', JSON.stringify(results));
      router.push('/quiz/results');
    }, 100);
  };
  
  const navigateToQuestion = (index: number) => {
    updateAnswerState(currentQuestionIndex, currentResponse, isMarkedForReview);
    if (answerStates[index].status === 'not-visited') {
        updateAnswerState(index, '', false, 'not-answered');
    }
    setCurrentQuestionIndex(index);
  };

  if (questions.length === 0) {
    return <div className="container mx-auto p-4 text-center">Preparing exam...</div>;
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
      return <div className="container mx-auto p-4 text-center">Loading question...</div>;
  }
  const optionChars = (currentQuestion.options || []).map((_, i) => String.fromCharCode(65 + i));
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-primary">Question {currentQuestion.number}</p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {currentQuestion.id}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col">
                <ScrollArea className="flex-grow pr-4 -mr-4">
                  {currentQuestion.passageText && (
                    <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
                      <h4 className="font-semibold mb-2 text-muted-foreground">Comprehension Passage</h4>
                      <p className="text-sm whitespace-pre-wrap">{currentQuestion.passageText}</p>
                    </div>
                  )}

                  {currentQuestion.instruction && <p className="text-sm text-muted-foreground mb-4">{currentQuestion.instruction}</p>}
                  
                  <p className="text-xl mb-4 font-medium">{currentQuestion.statement}</p>

                  {currentQuestion.texts && currentQuestion.texts.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {currentQuestion.texts.map((text, i) => (
                        <p key={i} className="text-base">{text}</p>
                      ))}
                    </div>
                  )}

                  {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {currentQuestion.imageUrls.map((url, i) => {
                        if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
                          return null;
                        }
                        return (
                          <div key={i} className="relative w-full h-64 rounded-lg overflow-hidden border">
                            <Image
                              src={url}
                              alt={currentQuestion.imageAlt || `Question Image ${i + 1}`}
                              fill
                              style={{ objectFit: 'contain' }}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <RadioGroup value={currentResponse} onValueChange={setCurrentResponse} className="space-y-4">
                    {(currentQuestion.options || []).map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-md border border-input has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-base flex-1 cursor-pointer">
                          <span className="font-bold mr-2">{optionChars[index]}.</span>{option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea>
                
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mark-for-review"
                      checked={isMarkedForReview}
                      onCheckedChange={(checked) => setIsMarkedForReview(checked as boolean)}
                    />
                    <label htmlFor="mark-for-review" className="text-sm font-medium">Mark for Review</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleClearResponse}>Clear Response</Button>
                    <Button variant="outline" onClick={handleSaveAndMarkForReview}>Save & Mark for Review</Button>
                    <Button onClick={handleSaveAndNext}>Save & Next</Button>
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <QuestionSidebar
            questions={questions}
            answerStates={answerStates}
            currentQuestionIndex={currentQuestionIndex}
            onQuestionSelect={navigateToQuestion}
            onSubmit={handleSubmitExam}
            totalTime={totalTime}
          />
        </div>
      </div>
    </div>
  );
}
