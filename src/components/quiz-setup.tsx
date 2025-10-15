
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Loader2 } from "lucide-react";
import { Separator } from "./ui/separator";
import { getAvailableSubjects } from "@/lib/actions";
import type { Paper } from "@/lib/types";

const ALL_DIFFICULTIES = ["easy", "medium", "hard"];
const ALL_QUESTION_TYPES = ['mcq', 'assertion-reason', 'image-mcq', 'puzzle'];

export function QuizSetup({ allPapers }: { allPapers: Paper[] }) {
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(ALL_DIFFICULTIES);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(ALL_QUESTION_TYPES);
  const [subject, setSubject] = useState("all");
  const [timeLimit, setTimeLimit] = useState(15);
  const router = useRouter();

  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const paperOptions = useMemo(() => allPapers.map(p => ({ id: p.id, title: p.title })), [allPapers]);

  useEffect(() => {
    async function fetchFilters() {
      if (selectedPapers.length === 0) {
        setAvailableSubjects([]);
        return;
      }
      setIsLoading(true);
      try {
        const subjects = await getAvailableSubjects(selectedPapers);
        setAvailableSubjects(subjects);
        if (!subjects.includes(subject)) {
            setSubject("all");
        }
      } catch (error) {
        console.error("Failed to fetch filters", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFilters();
  }, [selectedPapers, subject]);

  const handleStartQuiz = () => {
    let url = `/quiz?limit=${numberOfQuestions}&time=${timeLimit}`; // time is in minutes here
    
    if (selectedPapers.length > 0) {
      url += `&papers=${selectedPapers.join(',')}`;
    }
    if (selectedDifficulties.length > 0 && selectedDifficulties.length < ALL_DIFFICULTIES.length) {
      url += `&difficulty=${selectedDifficulties.join(',')}`;
    }
    if (selectedQuestionTypes.length > 0 && selectedQuestionTypes.length < ALL_QUESTION_TYPES.length) {
        url += `&questionType=${selectedQuestionTypes.join(',')}`;
    }
    if (subject !== 'all') {
        url += `&subject=${subject}`;
    }
    router.push(url);
  };
  
  const handleMultiSelectChange = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    allOptions: string[]
  ) => {
    if (value === 'all') {
      setter(list.length === allOptions.length ? [] : allOptions);
    } else {
      setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    }
  };

  const MultiSelectPopover = ({
    label,
    options,
    selected,
    onChange,
    disabled = false,
    displayKey = 'title',
    valueKey = 'id',
  }: {
    label: string;
    options: any[];
    selected: string[];
    onChange: (value: string) => void;
    disabled?: boolean;
    displayKey?: string;
    valueKey?: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal" disabled={disabled || options.length === 0}>
            <span className="truncate">
              {selected.length === 0
                ? `Select ${label.toLowerCase()}...`
                : selected.length === options.length 
                ? `All ${label}`
                : `${selected.length} ${label.toLowerCase()} selected`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
            <div
                className="flex items-center gap-2 font-normal p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={(e) => { e.preventDefault(); onChange('all'); }}
              >
                <Checkbox
                  id={`checkbox-${label}-all`}
                  checked={selected.length === options.length}
                  onCheckedChange={() => onChange('all')}
                />
                <Label htmlFor={`checkbox-${label}-all`} className="font-normal flex-1 cursor-pointer">
                  All {label}
                </Label>
            </div>
            <Separator />
            {options.map((option) => {
               const val = valueKey ? option[valueKey] : option;
               const display = displayKey ? option[displayKey] : option;
               return (
                  <div
                    key={val}
                    className="flex items-center gap-2 font-normal p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={(e) => { e.preventDefault(); onChange(val); }}
                  >
                    <Checkbox
                      id={`checkbox-${label}-${val}`}
                      checked={selected.includes(val)}
                      onCheckedChange={() => onChange(val)}
                    />
                    <Label htmlFor={`checkbox-${label}-${val}`} className="font-normal flex-1 cursor-pointer">
                      {display.charAt(0).toUpperCase() + display.slice(1)}
                    </Label>
                  </div>
               )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <div className="grid gap-6 py-4">
        <MultiSelectPopover
          label="Papers"
          options={paperOptions}
          selected={selectedPapers}
          onChange={(value) => handleMultiSelectChange(value, selectedPapers, setSelectedPapers, paperOptions.map(p => p.id))}
          valueKey="id"
          displayKey="title"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject} disabled={availableSubjects.length === 0 || selectedPapers.length === 0}>
                <SelectTrigger id="subject" className="w-full">
                    <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
             <MultiSelectPopover
                label="Difficulty"
                options={ALL_DIFFICULTIES}
                selected={selectedDifficulties}
                onChange={(value) => handleMultiSelectChange(value, selectedDifficulties, setSelectedDifficulties, ALL_DIFFICULTIES)}
                displayKey=""
                valueKey=""
            />
        </div>
        
        <MultiSelectPopover
            label="Question Type"
            options={ALL_QUESTION_TYPES}
            selected={selectedQuestionTypes}
            onChange={(value) => handleMultiSelectChange(value, selectedQuestionTypes, setSelectedQuestionTypes, ALL_QUESTION_TYPES)}
            displayKey=""
            valueKey=""
        />
        
        <Separator />

        <div className="space-y-4">
            <div className="flex justify-between items-center">
            <Label htmlFor="questions">Number of Questions</Label>
            <span className="font-bold text-primary">{numberOfQuestions}</span>
            </div>
            <Slider
            id="questions"
            min={5}
            max={50}
            step={1}
            value={[numberOfQuestions]}
            onValueChange={(value) => setNumberOfQuestions(value[0])}
            />
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-center">
            <Label htmlFor="time">Time Limit (minutes)</Label>
            <span className="font-bold text-primary">{timeLimit}</span>
            </div>
            <Slider
            id="time"
            min={5}
            max={180}
            step={5}
            value={[timeLimit]}
            onValueChange={(value) => setTimeLimit(value[0])}
            />
        </div>
        
        <Separator />

        <Button onClick={handleStartQuiz} className="w-full mt-2" size="lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Quiz
        </Button>
    </div>
  );
}
