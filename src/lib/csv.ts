
import type { QuizState } from '@/contexts/quiz-context';
import Papa from 'papaparse';

export const exportToCsv = (quizState: QuizState) => {
  const { rounds, teamNames } = quizState;

  const data: (string | number)[][] = [];
  const headers = ['Over', 'Ball', ...teamNames.flatMap(name => [`${name} Runs`, `${name} Wickets`])];
  data.push(headers);

  const grandTotalRuns = Array(teamNames.length).fill(0);
  const grandTotalWickets = Array(teamNames.length).fill(0);

  rounds.forEach(round => {
    const overTotalRuns = Array(teamNames.length).fill(0);
    const overTotalWickets = Array(teamNames.length).fill(0);

    const questionNumbers = Object.keys(round.scores)
      .map(Number)
      .sort((a, b) => a - b);
    
    questionNumbers.forEach(qIndex => {
      const row: (string|number)[] = [round.name, `B${qIndex + 1}`];
      teamNames.forEach((_, teamIndex) => {
        const score = round.scores[qIndex]?.[teamIndex];
        const runs = score?.runs || 0;
        const wicket = score?.isWicket ? 1 : 0;
        row.push(runs);
        row.push(wicket);
        overTotalRuns[teamIndex] += runs;
        overTotalWickets[teamIndex] += wicket;
      });
      data.push(row);
    });

    const overTotalRow: (string|number)[] = [round.name, 'Over Total'];
    overTotalRuns.forEach((runs, i) => {
        overTotalRow.push(runs);
        overTotalRow.push(overTotalWickets[i]);
        grandTotalRuns[i] += runs;
        grandTotalWickets[i] += overTotalWickets[i];
    });
    data.push(overTotalRow);
    data.push([]); 
  });

  const grandTotalRow: (string|number)[] = ['Overall', 'Grand Total'];
  grandTotalRuns.forEach((runs, i) => {
      grandTotalRow.push(runs);
      grandTotalRow.push(grandTotalWickets[i]);
  });
  data.push(grandTotalRow);

  const csv = Papa.unparse(data);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cricket_scores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
