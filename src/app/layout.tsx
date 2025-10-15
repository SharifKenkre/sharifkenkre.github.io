import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { UserProvider } from '@/context/user-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ExamVibe',
  description: 'Custom quizzes and AI-powered exam predictions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full bg-background`}>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <UserProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
