import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPapersFromFirestore } from '@/lib/actions';
import { FileText } from 'lucide-react';

export default async function PapersPage() {
  const papers = await getPapersFromFirestore();

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Available Exam Papers</h1>
        <p className="text-muted-foreground mt-2">Select a paper to start your preparation.</p>
      </div>

      {papers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {papers.map((paper) => (
            <Card key={paper.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{paper.title}</CardTitle>
                    <CardDescription>{paper.exam} - {paper.year}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button asChild className="w-full">
                  <Link href={`/quiz-selection?paperId=${paper.paperId}`}>
                    Start Preparation
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>No exam papers found.</p>
          <p className="text-sm mt-2">Please check your 'papers' collection in Firestore.</p>
        </div>
      )}
    </div>
  );
}
