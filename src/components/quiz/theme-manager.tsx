
'use client';

import { useQuiz } from '@/contexts/quiz-context';
import { useEffect } from 'react';
import { type CustomTheme } from '@/lib/theme';

// Helper function to get contrasting text color (black or white)
const getContrastingColor = (hsl: string): string => {
    try {
        const l = parseFloat(hsl.split(' ')[2].replace('%', ''));
        return l > 50 ? '0 0% 10%' : '0 0% 98%'; // Return HSL string for black or white
    } catch(e) {
        return '0 0% 10%'; // Default to black
    }
};

const setCssVariables = (customTheme: CustomTheme) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const backgroundHsl = customTheme.background;
    const cardHsl = customTheme.card;
    const primaryHsl = customTheme.primary;

    const foregroundHsl = getContrastingColor(backgroundHsl);
    const cardForegroundHsl = getContrastingColor(cardHsl);
    const primaryForegroundHsl = getContrastingColor(primaryHsl);
    
    // Slightly darker/lighter versions for secondary/muted colors
    const bgL = parseFloat(backgroundHsl.split(' ')[2].replace('%', ''));
    const secondaryL = bgL > 50 ? bgL - 5 : bgL + 5;
    const mutedL =  bgL > 50 ? bgL - 2 : bgL + 2;
    const borderL = bgL > 50 ? bgL - 10 : bgL + 10;
    
    const bgParts = backgroundHsl.split(' ');
    const secondaryHsl = `${bgParts[0]} ${bgParts[1]} ${secondaryL}%`;
    const mutedHsl = `${bgParts[0]} ${bgParts[1]} ${mutedL}%`;
    const borderHsl = `${bgParts[0]} ${bgParts[1]} ${borderL}%`;

    const accentHsl = primaryHsl;
    const accentForegroundHsl = primaryForegroundHsl;


    root.style.setProperty('--custom-background-val', backgroundHsl);
    root.style.setProperty('--custom-foreground-val', foregroundHsl);
    root.style.setProperty('--custom-card-val', cardHsl);
    root.style.setProperty('--custom-primary-val', primaryHsl);
    root.style.setProperty('--custom-primary-foreground-val', primaryForegroundHsl);
    root.style.setProperty('--custom-secondary-val', secondaryHsl);
    root.style.setProperty('--custom-muted-foreground-val', getContrastingColor(secondaryHsl));
    root.style.setProperty('--custom-accent-val', accentHsl);
    root.style.setProperty('--custom-accent-foreground-val', accentForegroundHsl);
    root.style.setProperty('--custom-border-val', borderHsl);
};

export function ThemeManager({ children }: { children: React.ReactNode }) {
  const { quizState, isLoaded } = useQuiz();
  
  // We can only get theme settings if quizState is loaded.
  const monitorSettings = quizState?.monitorSettings;

  useEffect(() => {
    // Default to 'default' theme to ensure server and client match initially
    const theme = monitorSettings?.theme || 'default';
    const customTheme = monitorSettings?.customTheme;
    
    const body = document.body;
    body.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-custom');
    
    if (theme === 'custom' && customTheme) {
        setCssVariables(customTheme);
    }
    body.classList.add(`theme-${theme}`);

  }, [monitorSettings]);

  return <>{children}</>;
}
