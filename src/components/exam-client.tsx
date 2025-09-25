
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
import { saveAttempts } from '@/lib/actions';
import { ScrollArea } from './ui/scroll-area';

type ExamClientProps = {
  questions: Question[];
  totalTime: number; // in seconds
};

function shuffleArray(array: any[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function ExamClient({ questions: initialQuestions, totalTime }: ExamClientProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [isMarkedForReview, setIsMarkedForReview] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    const shuffledQuestions = initialQuestions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));

    setQuestions(shuffledQuestions);
    setAnswerStates(
      shuffledQuestions.map(() => ({
        response: "",
        status: "not-visited",
        isCorrect: false,
      }))
    );
  }, [initialQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      const currentAnswer = answerStates[currentQuestionIndex];
      setCurrentResponse(currentAnswer.response);
      setIsMarkedForReview(currentAnswer.status === 'marked-for-review' || currentAnswer.status === 'answered-and-marked');
      
      if (answerStates[0].status === 'not-visited') {
        updateAnswerState(0, answerStates[0].response, false, 'not-answered');
      }
    }
  }, [currentQuestionIndex, questions, answerStates]);
  
  const updateAnswerState = (index: number, response: string, markedForReview: boolean, overrideStatus?: AnswerState['status']) => {
    setAnswerStates(prev => {
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
      const selectedOptionIndex = question.options.findIndex(opt => opt === response);
      const selectedOptionChar = String.fromCharCode(65 + selectedOptionIndex);
      const isCorrect = hasResponse ? selectedOptionChar === question.answer : false;

      newStates[index] = { response, status, isCorrect };
      return newStates;
    });
  };

  const handleSaveAndNext = () => {
    updateAnswerState(currentQuestionIndex, currentResponse, isMarkedForReview);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      toast({ title: "You are at the last question." });
    }
  };
  
  const handleSubmitExam = async () => {
    // Final update for the current question
    updateAnswerState(currentQuestionIndex, currentResponse, isMarkedForReview);
    
    // Use a timeout to ensure state update is processed before submission
    setTimeout(async () => {
      // 1. Save attempts to Firestore
      if (user) {
        const attemptsToSave = questions.map((q, i) => ({
          uid: user.uid,
          qid: q.id,
          selected: answerStates[i].response || "",
          isCorrect: answerStates[i].isCorrect,
        }));
        try {
          await saveAttempts(attemptsToSave);
        } catch (error) {
          console.error("Failed to save attempts:", error);
          toast({ variant: "destructive", title: "Error", description: "Could not save your progress." });
        }
      }

      // 2. Calculate results for session storage
      const score = answerStates.filter(a => a.isCorrect).length;
      const results = {
          score: score,
          total: questions.length,
          answers: questions.map((q, i) => ({
              question: q.statement,
              answer: answerStates[i].response || "Not Answered",
              isCorrect: answerStates[i].isCorrect,
          })),
      };
      sessionStorage.setItem('quizResults', JSON.stringify(results));
      router.push('/quiz/results');
    }, 100);
  };
  
  const navigateToQuestion = (index: number) => {
    updateAnswerState(currentQuestionIndex, currentResponse, isMarkedForReview);
    setCurrentQuestionIndex(index);
  };

  if (questions.length === 0) {
    return <div className="container mx-auto p-4 text-center">Preparing exam...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const optionChars = questions[currentQuestionIndex].options.map((_, i) => String.fromCharCode(65 + i));

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-primary">Question {currentQuestionIndex + 1}</p>
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

                  {currentQuestion.statements && (
                    <div className="space-y-2 mb-4">
                      {currentQuestion.statements.map((stmt, i) => (
                        <p key={i} className="text-base"><b>Statement {i+1}:</b> {stmt}</p>
                      ))}
                    </div>
                  )}

                  {currentQuestion.bullets && (
                     <ul className="list-disc list-inside space-y-1 mb-4">
                       {currentQuestion.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                     </ul>
                  )}

                  {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {currentQuestion.imageUrls.map((url, i) => (
                        url && !url.includes('YOUR_STORAGE_URL') && (
                         <div key={i} className="relative w-full h-64 rounded-lg overflow-hidden border">
                           <Image 
                             src={url} 
                             alt={currentQuestion.imageAlt || `Question Image ${i + 1}`}
                             fill
                             style={{ objectFit: 'contain' }}
                             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                           />
                         </div>
                        )
                      ))}
                    </div>
                  )}
                  
                  <RadioGroup value={currentResponse} onValueChange={setCurrentResponse} className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
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
