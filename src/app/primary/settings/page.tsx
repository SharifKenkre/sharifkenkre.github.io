
'use client';

import { useQuiz, initialState } from '@/contexts/quiz-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const { quizState, setQuizState, loadQuiz, isLoaded, createQuiz } = useQuiz();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [customTheme, setCustomTheme] = useState<CustomTheme>(
    quizState?.monitorSettings.customTheme || {
      background: '234 67% 94%',
      card: '234 67% 99%',
      primary: '231 48% 48%',
    }
  );
  
  // Local state for the string representation of point values for the input fields
  const [pointInputValues, setPointInputValues] = useState<(string)[]>([]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
        loadQuiz(id);
    } else {
        router.push('/');
    }
  }, [searchParams, loadQuiz, router]);
  
  useEffect(() => {
    // Sync local state with global quiz state on mount or when quizState changes
    if (quizState) {
        // We only want to manage the numeric point values in this component's inputs
        setPointInputValues(quizState.pointValues.filter((v): v is number => typeof v === 'number').map(String));
        if (quizState.monitorSettings.customTheme) {
            setCustomTheme(quizState.monitorSettings.customTheme);
        }
    }
  }, [quizState]);

  if (!isLoaded || !quizState) {
      return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading Settings...</p>
        </div>
      );
  }

  const handleQuizTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizState(prev => prev ? { ...prev, quizTitle: e.target.value } : null);
  };

  const handleTeamNameChange = (index: number, newName: string) => {
    setQuizState(prev => {
        if (!prev) return null;
        const newTeamNames = [...prev.teamNames];
        newTeamNames[index] = newName;
        return { ...prev, teamNames: newTeamNames };
    });
  };
  
  // Update local state as the user types
  const handlePointValueChange = (indexToChange: number, newValue: string) => {
    const newInputValues = [...pointInputValues];
    newInputValues[indexToChange] = newValue;
    setPointInputValues(newInputValues);
  };
  
  // When the input loses focus, update the global state
  const handlePointValueBlur = (indexToChange: number) => {
     const value = pointInputValues[indexToChange];
     const parsedValue = parseInt(value, 10);

     setQuizState(prev => {
        if (!prev) return null;
        
        const currentNumericValues = prev.pointValues.filter((v): v is number => typeof v === 'number');

        if (!isNaN(parsedValue)) {
            // Update the existing value
            currentNumericValues[indexToChange] = parsedValue;
        } else {
            // If invalid, remove it from the array
            currentNumericValues.splice(indexToChange, 1);
        }
        
        // Re-combine with the 'WICKET' value
        const wicketValue = prev.pointValues.find(v => v === 'WICKET');
        const newPointValues = [...currentNumericValues];
        if(wicketValue) newPointValues.push(wicketValue);

        return { ...prev, pointValues: newPointValues };
     });
  };

  // Add a new point value input field
  const addPointValue = () => {
    setQuizState(prev => {
        if (!prev) return null;
        const numericPointValues = prev.pointValues.filter((v): v is number => typeof v === 'number');
        numericPointValues.push(0); // Add a new value, e.g., 0 as a default
        
        const wicketValue = prev.pointValues.find(v => v === 'WICKET');
        const newPointValues = [...numericPointValues];
        if (wicketValue) newPointValues.push(wicketValue);
        
        return { ...prev, pointValues: newPointValues };
    });
  };

  // Remove a point value from the global state
  const removePointValue = (indexToRemove: number) => {
    setQuizState(prev => {
        if (!prev) return null;
        const numericPointValues = prev.pointValues.filter((v): v is number => typeof v === 'number');
        numericPointValues.splice(indexToRemove, 1);
        
        const wicketValue = prev.pointValues.find(v => v === 'WICKET');
        const newPointValues = [...numericPointValues];
        if (wicketValue) newPointValues.push(wicketValue);
        
        return { ...prev, pointValues: newPointValues };
    });
  };


  const handleThemeChange = (theme: string) => {
    setQuizState(prev => prev ? {
      ...prev,
      monitorSettings: { ...prev.monitorSettings, theme }
    } : null);
  };

  const handleCompactChange = (checked: boolean) => {
    setQuizState(prev => prev ? {
      ...prev,
      monitorSettings: { ...prev.monitorSettings, compact: checked }
    } : null);
  };
  
  const handleShowLogoChange = (checked: boolean) => {
    setQuizState(prev => prev ? {
        ...prev,
        monitorSettings: { ...prev.monitorSettings, showLogo: checked }
    } : null);
  }

  const handleCustomThemeChange = (colorName: keyof CustomTheme, value: string) => {
    setCustomTheme(prev => ({ ...prev, [colorName]: value }));
  };
  
  const applyCustomTheme = () => {
     setQuizState(prev => prev ? {
      ...prev,
      monitorSettings: { ...prev.monitorSettings, theme: 'custom', customTheme }
    } : null);
  };

  const handleCopyCode = () => {
    if (quizState?.id) {
      navigator.clipboard.writeText(quizState.id);
      toast({ title: 'Code Copied!', description: 'The verification code has been copied to your clipboard.' });
    }
  };

  const handleEndQuiz = () => {
    // Ending the quiz now means navigating back to the home page.
    // The state in firestore will remain but will no longer be active.
    router.push('/');
  }

  const handleExport = () => {
    if (!quizState) return;
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
                    {quizState.teamNames.map((name, index) => (
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
                    {pointInputValues.map((value, index) => (
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
                    {themes.map(theme => (
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
                        <Button variant={quizState.monitorSettings.theme === 'custom' ? 'default' : 'outline'}>
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
                    checked={quizState.monitorSettings.compact}
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
                    checked={quizState.monitorSettings.showLogo}
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
                        <p className="text-4xl font-bold font-mono tracking-widest text-primary">
                            {quizState.id}
                        </p>
                        <Button variant="ghost" size="icon" onClick={handleCopyCode}><Copy className="h-5 w-5"/></Button>
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
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will not delete the quiz data, but it will return you to the home screen. You can reconnect to the quiz later using the verification code.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleEndQuiz}>Yes, end session</AlertDialogAction>
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
