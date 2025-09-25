'use server';

/**
 * @fileOverview Predicts potential questions for the next year's exam based on historical data.
 *
 * - predictNextYearsPaper - A function that predicts next year's paper.
 * - PredictNextYearsPaperInput - The input type for the predictNextYearsPaper function.
 * - PredictNextYearsPaperOutput - The return type for the predictNextYearsPaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictNextYearsPaperInputSchema = z.object({
  examType: z.string().describe('The type of exam (e.g., JEE, NEET, Board Exam).'),
  subject: z.string().describe('The subject for which to predict questions (e.g., Physics, Chemistry, Math).'),
  historicalData: z.string().describe('Historical data of previous years papers, including question patterns and important topics.'),
});
export type PredictNextYearsPaperInput = z.infer<typeof PredictNextYearsPaperInputSchema>;

const PredictNextYearsPaperOutputSchema = z.object({
  predictedQuestions: z.string().describe('A list of predicted questions for the next year\'s exam.'),
  rationale: z.string().describe('The rationale behind the predicted questions, based on historical trends and patterns.'),
});
export type PredictNextYearsPaperOutput = z.infer<typeof PredictNextYearsPaperOutputSchema>;

export async function predictNextYearsPaper(input: PredictNextYearsPaperInput): Promise<PredictNextYearsPaperOutput> {
  return predictNextYearsPaperFlow(input);
}

const predictNextYearsPaperPrompt = ai.definePrompt({
  name: 'predictNextYearsPaperPrompt',
  input: {schema: PredictNextYearsPaperInputSchema},
  output: {schema: PredictNextYearsPaperOutputSchema},
  prompt: `You are an expert in predicting exam questions based on historical data.

  Given the following information, predict the questions for the next year's exam:

  Exam Type: {{{examType}}}
  Subject: {{{subject}}}
  Historical Data: {{{historicalData}}}

  Provide a list of predicted questions and a rationale for why these questions are likely to appear.
  `,
});

const predictNextYearsPaperFlow = ai.defineFlow(
  {
    name: 'predictNextYearsPaperFlow',
    inputSchema: PredictNextYearsPaperInputSchema,
    outputSchema: PredictNextYearsPaperOutputSchema,
  },
  async input => {
    const {output} = await predictNextYearsPaperPrompt(input);
    return output!;
  }
);
