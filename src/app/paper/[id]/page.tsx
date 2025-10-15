import Link from 'next/link';
import { getPaperById, getQuestionsForPaper } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Clock, FileText, HelpCircle, Trophy } from 'lucide-react';

export default async function PaperDetailsPage({ params }: { params: { id: string } }) {
  const paper = await getPaperById(params.id);

  if (!paper) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        <h1 className="text-2xl font-bold">Paper not found</h1>
        <p className="text-muted-foreground mt-2">The requested exam paper could not be found.</p>
        <Button asChild className="mt-6">
          <Link href="/papers">
            <ArrowLeft className="mr-2" />
            Back to Papers
          </Link>
        </Button>
      </div>
    );
  }

  const questions = await getQuestionsForPaper(params.id);
  const totalQuestions = questions.length;
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 max-w-4xl">
      <Link href="/papers" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Papers
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{paper.title}</h1>
          <p className="text-muted-foreground mt-1">
            {paper.exam} - {paper.year}
          </p>
        </div>
        <Button asChild>
          <Link href={`/quiz?paperId=${paper.id}`}>
            Attempt Test
          </Link>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paper.time} <span className="text-sm font-normal">min</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMarks}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Instructions</h2>
        <div className="prose prose-sm max-w-none text-muted-foreground bg-secondary/30 p-6 rounded-lg">
            <ul>
                <li>The test contains a total of <strong>{totalQuestions} questions</strong>.</li>
                <li>The total duration of the test is <strong>{paper.time} minutes</strong>.</li>
                <li>Each question has a designated mark. The total score for this test is <strong>{totalMarks}</strong>.</li>
                <li>There is no negative marking for incorrect answers.</li>
                <li>You can navigate between questions and mark them for review.</li>
                <li>Your test will be automatically submitted when the time runs out.</li>
                <li>Ensure you have a stable internet connection before starting the test.</li>
            </ul>
            <p className="font-semibold text-foreground mt-6">All the best!</p>
        </div>
      </div>

    </div>
  );
}
