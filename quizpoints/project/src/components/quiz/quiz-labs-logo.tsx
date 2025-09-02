
'use client';

import { useQuiz } from '@/contexts/quiz-context';
import { cn } from '@/lib/utils';

export function QuizLabsLogo({ className }: { className?: string }) {
  const { quizState } = useQuiz();
  const { theme } = quizState.monitorSettings;

  // In dark theme, text should be white, in light theme, text should be black
  const textColor = theme === 'dark' ? '#FFFFFF' : '#000000';

  if (!quizState.monitorSettings.showLogo) {
      return null;
  }

  return (
    <div className={cn("pointer-events-none absolute top-4 left-4 z-20", className)}>
        <svg
            width="200"
            height="50"
            viewBox="0 0 300 75"
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 md:w-48"
        >
            <defs>
                <style>
                    {`
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');
                    .logo-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
                    `}
                </style>
            </defs>
            
            {/* Icon */}
            <g transform="translate(25, 37.5)">
                <circle cx="0" cy="0" r="18" fill="#FF0000" stroke={textColor} strokeWidth="2" />
                <g stroke={textColor} strokeWidth="1.5">
                    <path d="M-10 -12 L10 12 M-10 12 L10 -12 M-12 0 L12 0" strokeWidth="1" />
                </g>
                
                {[0, 72, 144, 216, 288].map(angle => (
                    <g key={angle} transform={`rotate(${angle})`}>
                        <line x1="0" y1="0" x2="30" y2="0" stroke={textColor} strokeWidth="2" />
                        <circle cx="30" cy="0" r="6" fill="#FF0000" stroke={textColor} strokeWidth="2" />
                    </g>
                ))}
            </g>

            {/* Text */}
            <g transform="translate(80, 45)">
                <text x="0" y="0" fontSize="18" fill={textColor} className="logo-text">The</text>
                <text x="35" y="0" fontSize="28" fill={textColor} className="logo-text">quiz</text>
                <circle cx="81.5" cy="-14" r="3" fill="#FF0000" />
                <text x="110" y="0" fontSize="28" fill="#FF0000" className="logo-text">Labs</text>
            </g>
        </svg>
    </div>
  );
}
