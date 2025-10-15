import Link from 'next/link';
import { BrainCircuit, Menu } from 'lucide-react';
import { AuthNav } from './auth-nav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about">About</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/papers">Papers</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">ExamVibe</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
