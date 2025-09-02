
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
  
  const [pointInputValues, setPointInputValues] = useState<(string)[]>([]);

  useEffect(() => {
    setIsClient(true);
    // Sync local input state with global quiz state on mount
    setPointInputValues(quizState.pointValues.filter((v): v is number => typeof v === 'number').map(String));
  }, []);
  
  useEffect(() => {
    // Keep local state in sync when global state changes from another source
    if (isClient) {
        setPointInputValues(quizState.pointValues.filter((v): v is number => typeof v === 'number').map(String));
    }
  }, [quizState.pointValues, isClient])


  const handleQuizTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizState(prev => ({
        ...prev,
        quizTitle: e.target.value
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
        const numericPointValues = prev.pointValues.filter((v): v is number => typeof v === 'number');
        if (!isNaN(parsedValue)) {
            numericPointValues[indexToChange] = parsedValue;
        } else {
            // If input is not a valid number, we can either revert or remove.
            // For now, let's just ensure the global state has valid numbers.
            // The local state `pointInputValues` will hold the potentially invalid string temporarily.
        }
        
        const wicketValue = prev.pointValues.find(v => v === 'WICKET');
        const newPointValues = [...numericPointValues.filter(v => !isNaN(v))];
        if(wicketValue) newPointValues.push(wicketValue);

        return { ...prev, pointValues: newPointValues };
     });
  };


  const addPointValue = () => {
    // Add an empty string to allow user to input a new value
    setPointInputValues(prev => [...prev, '']);
  };

  const removePointValue = (indexToRemove: number) => {
    setQuizState(prev => {
        const numericPointValues = prev.pointValues.filter((v): v is number => typeof v === 'number');
        numericPointValues.splice(indexToRemove, 1);
        
        const wicketValue = prev.pointValues.find(v => v === 'WICKET');
        const newPointValues = [...numericPointValues];
        if (wicketValue) newPointValues.push(wicketValue);
        
        return { ...prev, pointValues: newPointValues };
    });
  };


  const handleThemeChange = (theme: string) => {
    setQuizState(prev => ({
      ...prev,
      monitorSettings: { ...prev.monitorSettings, theme }
    }));
  };

  const handleCompactChange = (checked: boolean) => {
    setQuizState(prev => ({
      ...prev,
      monitorSettings: { ...prev.monitorSettings, compact: checked }
    }));
  };
  
  const handleShowLogoChange = (checked: boolean) => {
    setQuizState(prev => ({
        ...prev,
        monitorSettings: { ...prev.monitorSettings, showLogo: checked }
    }));
  }

  const handleCustomThemeChange = (colorName: keyof CustomTheme, value: string) => {
    setCustomTheme(prev => ({ ...prev, [colorName]: value }));
  };
  
  const applyCustomTheme = () => {
     setQuizState(prev => ({
      ...prev,
      monitorSettings: { ...prev.monitorSettings, theme: 'custom', customTheme }
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
  }

  const handleExport = () => {
    try {
        exportToCsv(quizState);
        toast({ title: 'Export Successful', description: 'Your quiz data has been downloaded as a CSV file.' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export quiz data.' });
        console.error(e);
    }
  }


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
          <div className="space-y-6">
            
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2"><Pencil /> General</Label>
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input id="quiz-title" value={quizState.quizTitle} onChange={handleQuizTitleChange} />
              </div>
               <div className="space-y-2">
                <Label className="flex items-center gap-2"><Users /> Team Names</Label>
                <div className="grid grid-cols-2 gap-2">
                    {isClient && quizState.teamNames.map((name, index) => (
                        <Input key={index} value={name} onChange={(e) => handleTeamNameChange(index, e.target.value)} />
                    ))}
                </div>
              </div>
               <div className="space-y-2">
                <div className="flex items-center gap-2 justify-between">
                    <Label className="flex items-center gap-2"><Star /> Score Button Values</Label>
                    <Button variant="ghost" size="sm" onClick={addPointValue}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {isClient && pointInputValues.map((value, index) => (
                        <div key={`point-value-${index}`} className="relative group">
                            <Input 
                                type="text"
                                value={value} 
                                onChange={(e) => handlePointValueChange(index, e.target.value)} 
                                onBlur={() => handlePointValueBlur(index)}
                                className="text-center pr-6"
                                placeholder="Value"
                            />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-0 top-0 h-full w-8 opacity-0 group-hover:opacity-100"
                                onClick={() => removePointValue(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                     <Button variant="destructive" disabled className="h-10 text-base font-bold">
                        WICKET
                    </Button>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center gap-2"><Palette /> Appearance</Label>
                 <div className="grid grid-cols-2 gap-2">
                    {isClient && themes.map(theme => (
                    <Button
                        key={theme}
                        variant={quizState.monitorSettings.theme === theme ? 'default' : 'outline'}
                        onClick={() => handleThemeChange(theme)}
                        className="capitalize"
                    >
                        {theme}
                    </Button>
                    ))}
                    <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={isClient && quizState.monitorSettings.theme === 'custom' ? 'default' : 'outline'}>
                        <Palette className="mr-2" /> Custom
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Create Custom Theme</DialogTitle>
                        <DialogDescription>
                            Pick your own colors to create a unique theme.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <Label>Background Color</Label>
                            <Input
                            type="color"
                            value={hslToHex(customTheme.background)}
                            onChange={(e) => handleCustomThemeChange('background', hexToHsl(e.target.value))}
                            className="w-24"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Card Color</Label>
                            <Input
                            type="color"
                            value={hslToHex(customTheme.card)}
                            onChange={(e) => handleCustomThemeChange('card', hexToHsl(e.target.value))}
                            className="w-24"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Primary/Accent Color</Label>
                            <Input
                            type="color"
                            value={hslToHex(customTheme.primary)}
                            onChange={(e) => handleCustomThemeChange('primary', hexToHsl(e.target.value))}
                            className="w-24"
                            />
                        </div>
                        </div>
                        <DialogFooter>
                        <Button onClick={applyCustomTheme}>Apply Custom Theme</Button>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        Reduces spacing on the monitor to fit more on screen.
                    </p>
                </div>
                <Switch
                    checked={isClient && quizState.monitorSettings.compact}
                    onCheckedChange={handleCompactChange}
                />
               </div>
               <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Show Logo on Monitor</Label>
                    <p className="text-sm text-muted-foreground">
                        Display the QuizLabs logo in the top-left corner.
                    </p>
                </div>
                <Switch
                    checked={isClient && quizState.monitorSettings.showLogo}
                    onCheckedChange={handleShowLogoChange}
                />
               </div>
            </div>

            <Separator />
            
             <div className="space-y-4 pt-4">
                <Label className="text-lg font-semibold text-destructive flex items-center gap-2"><AlertTriangle /> Danger Zone</Label>
                 <Button variant="secondary" className="w-full" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export to Excel (.csv)
                </Button>
                <div className="space-y-2 rounded-lg border p-4 bg-background">
                     <Label className="text-base font-semibold">Verification Code</Label>
                     <div className="flex items-center justify-center gap-2">
                        {isClient && (
                          <>
                            <p className="text-4xl font-bold font-mono tracking-widest text-primary">
                                {quizState.verificationCode}
                            </p>
                            <Button variant="ghost" size="icon" onClick={handleCopyCode}><Copy className="h-5 w-5"/></Button>
                          </>
                        )}
                    </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <AlertTriangle className="mr-2 h-4 w-4" /> End This Quiz
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all current quiz data, including all rounds and scores. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleEndQuiz}>Yes, end the quiz</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
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
