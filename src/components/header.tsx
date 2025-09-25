import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { AuthNav } from './auth-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">ExamSim</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/quiz-selection" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Quiz
          </Link>
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
