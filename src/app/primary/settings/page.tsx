'use client';

import { useQuiz } from '@/contexts/quiz-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor, Palette, AlertTriangle, Users, Pencil, Star, Download, PlusCircle, Trash2, Copy, Image as ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { TeamTotalScores } from '@/components/quiz/team-total-scores';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';
import { CustomTheme, hexToHsl, hslToHex } from '@/lib/theme';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { exportToCsv } from '@/lib/csv';

const themes = ['default', 'dark', 'light'];

type PointValue = number | "WICKET";

export default function SettingsPage() {
  const { quizState, setQuizState, initialState } = useQuiz();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [customTheme, setCustomTheme] = useState<CustomTheme>(
    quizState.monitorSettings.customTheme || {
      background: '234 67% 94%',
      card: '234 67% 99%',
      primary: '231 48% 48%',
    }
  );

  const [pointInputValues, setPointInputValues] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
    setPointInputValues(
      quizState.pointValues.filter((v): v is number => typeof v === 'number').map(String)
    );
  }, []);

  useEffect(() => {
    if (isClient) {
      setPointInputValues(
        quizState.pointValues.filter((v): v is number => typeof v === 'number').map(String)
      );
    }
  }, [quizState.pointValues, isClient]);

  const handleQuizTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizState(prev => ({
      ...prev,
      quizTitle: e.target.value,
    }));
  };

  const handleTeamNameChange = (index: number, newName: string) => {
    setQuizState(prev => {
      const newTeamNames = [...prev.teamNames];
      newTeamNames[index] = newName;
      return { ...prev, teamNames: newTeamNames };
    });
  };

  const handlePointValueChange = (indexToChange: number, newValue: string) => {
    const newInputValues = [...pointInputValues];
    newInputValues[indexToChange] = newValue;
    setPointInputValues(newInputValues);
  };

  const handlePointValueBlur = (indexToChange: number) => {
    const value = pointInputValues[indexToChange];
    const parsedValue = parseInt(String(value), 10);

    setQuizState(prev => {
      const numericPointValues = prev.pointValues.filter(
        (v): v is number => typeof v === 'number'
      );

      if (!isNaN(parsedValue)) {
        numericPointValues[indexToChange] = parsedValue;
      }

      const wicketValue = prev.pointValues.find(
        (v): v is "WICKET" => v === 'WICKET'
      );

      const newPointValues: PointValue[] = [...numericPointValues];
      if (wicketValue) newPointValues.push("WICKET");

      return { ...prev, pointValues: newPointValues };
    });
  };

  const addPointValue = () => {
    setPointInputValues(prev => [...prev, '']);
  };

  const removePointValue = (indexToRemove: number) => {
    setQuizState(prev => {
      const numericPointValues = prev.pointValues.filter(
        (v): v is number => typeof v === 'number'
      );

      numericPointValues.splice(indexToRemove, 1);

      const wicketValue = prev.pointValues.find(
        (v): v is "WICKET" => v === 'WICKET'
      );

      const newPointValues: PointValue[] = [...numericPointValues];
      if (wicketValue) newPointValues.push("WICKET");

      return { ...prev, pointValues: newPointValues };
    });
  };

  const handleThemeChange = (theme: string) => {
    setQuizState(prev => ({
      ...prev,
      monitorSettings: { ...prev.monitorSettings, theme },
    }));
  };

  const handleCompactChange = (checked: boolean) => {
    setQuizState(prev => ({
      ...prev,
      monitorSettings: { ...prev.monitorSettings, compact: checked },
    }));
  };

  const handleShowLogoChange = (checked: boolean) => {
    setQuizState(prev => ({
      ...prev,
      monitorSettings: { ...prev.monitorSettings, showLogo: checked },
    }));
  };

  const handleCustomThemeChange = (colorName: keyof CustomTheme, value: string) => {
    setCustomTheme(prev => ({ ...prev, [colorName]: value }));
  };

  const applyCustomTheme = () => {
    setQuizState(prev => ({
      ...prev,
      monitorSettings: { ...prev.monitorSettings, theme: 'custom', customTheme },
    }));
  };

  const handleCopyCode = () => {
    if (quizState.verificationCode) {
      navigator.clipboard.writeText(quizState.verificationCode);
      toast({ title: 'Code Copied!', description: 'The verification code has been copied to your clipboard.' });
    }
  };

  const handleEndQuiz = () => {
    setQuizState(initialState);
    router.push('/');
  };

  const handleExport = () => {
    try {
      exportToCsv(quizState);
      toast({ title: 'Export Successful', description: 'Your quiz data has been downloaded as a CSV file.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export quiz data.' });
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-4 bg-muted/20">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <Button variant="ghost" size="sm" className="absolute top-4 left-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scoring
          </Button>
          <div className="flex justify-center items-center gap-4 pt-8">
            <Monitor className="w-10 h-10 text-primary" />
            <CardTitle className="text-center font-headline text-4xl">Settings</CardTitle>
          </div>
          <CardDescription className="text-center">
            Customize the look and feel of the monitor and primary screens. Changes are reflected live.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column content */}
          {/* Right column with preview */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Live Preview</Label>
            <div className="rounded-lg border p-4 transition-all h-full">
              <TeamTotalScores />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
