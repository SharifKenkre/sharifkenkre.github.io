
'use server';

import { predictNextYearsPaper, PredictNextYearsPaperInput, PredictNextYearsPaperOutput } from "@/ai/flows/predict-next-years-paper";

export async function getPrediction(input: PredictNextYearsPaperInput): Promise<PredictNextYearsPaperOutput> {
  return await predictNextYearsPaper(input);
}
