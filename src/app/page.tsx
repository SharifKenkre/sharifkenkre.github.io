import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 md:px-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">GPSC Exam</CardTitle>
          <CardDescription>
            Prepare for your upcoming GPSC exam with our tailored quizzes.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/papers">
              View Available Papers <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
