
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getPrediction } from "@/lib/ai-actions";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  examType: z.string().min(2, { message: "Exam type must be at least 2 characters." }),
  subject: z.string().min(2, { message: "Subject must be at least 2 characters." }),
  historicalData: z.string().min(50, { message: "Please provide at least 50 characters of historical data." }),
});

type PredictionOutput = {
  predictedQuestions: string;
  rationale: string;
};

export function PredictionForm() {
  const [prediction, setPrediction] = useState<PredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examType: "",
      subject: "",
      historicalData: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await getPrediction(values);
      setPrediction(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "There was an error generating the prediction. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card className="w-full max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Wand2 className="text-primary"/> AI Paper Predictor</CardTitle>
              <CardDescription>
                Input exam details and past trends to generate a potential future paper.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="examType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., JEE, NEET, Board Exam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Physics, Chemistry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Data</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste question patterns, important topics from previous years, chapter weightage, etc."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more detailed the data, the better the prediction.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Predict Questions</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Prediction Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Predicted Questions</h3>
                  <div className="p-4 bg-secondary/50 rounded-md">
                    <pre className="whitespace-pre-wrap font-sans text-sm">{prediction.predictedQuestions}</pre>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Rationale</h3>
                  <div className="p-4 bg-secondary/50 rounded-md">
                     <p className="text-sm">{prediction.rationale}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
