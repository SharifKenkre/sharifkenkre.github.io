import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { UserProvider } from '@/context/user-context';

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
    <html lang="en" className="h-full bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
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
