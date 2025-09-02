
import type { Metadata } from 'next';
import './globals.css';
import { QuizProvider } from '@/contexts/quiz-context';
import { Toaster } from '@/components/ui/toaster';
import { ThemeManager } from '@/components/quiz/theme-manager';

export const metadata: Metadata = {
  title: 'QuizPoint Central',
  description: 'The central hub for your quiz scoring needs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <QuizProvider>
          <ThemeManager>
            {children}
          </ThemeManager>
        </QuizProvider>
        <Toaster />
      </body>
    </html>
  );
}
