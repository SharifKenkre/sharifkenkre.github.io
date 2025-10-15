
"use client";

import { useState, useEffect } from "react";
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

const ALL_DIFFICULTIES = ["easy", "medium", "hard"];
const ALL_QUESTION_TYPES = ['mcq', 'assertion-reason', 'image-mcq', 'puzzle'];

export function QuizSetup({ paperId }: { paperId: string | null }) {
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(ALL_DIFFICULTIES);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(ALL_QUESTION_TYPES);
  const [subject, setSubject] = useState("all");
  const [timeLimit, setTimeLimit] = useState(15);
  const router = useRouter();

  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      setIsLoading(true);
      try {
        const subjects = await getAvailableSubjects(paperId || undefined);
        setAvailableSubjects(subjects);
      } catch (error) {
        console.error("Failed to fetch filters", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFilters();
  }, [paperId]);

  const handleStartQuiz = () => {
    let url = `/quiz?limit=${numberOfQuestions}&time=${timeLimit * 60}`;
    if (selectedDifficulties.length > 0 && selectedDifficulties.length < ALL_DIFFICULTIES.length) {
      url += `&difficulty=${selectedDifficulties.join(',')}`;
    }
    if (selectedQuestionTypes.length > 0 && selectedQuestionTypes.length < ALL_QUESTION_TYPES.length) {
        url += `&questionType=${selectedQuestionTypes.join(',')}`;
    }
    if (subject !== 'all') {
        url += `&subject=${subject}`;
    }
    if (paperId) {
      url += `&paperId=${paperId}`;
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
      if (list.length === allOptions.length) {
        setter([]);
      } else {
        setter(allOptions);
      }
    } else {
      let newList: string[];
      if (list.includes(value)) {
        newList = list.filter((item) => item !== value);
      } else {
        newList = [...list, value];
      }
      setter(newList);
    }
  };

  const MultiSelectPopover = ({
    label,
    options,
    selected,
    onChange,
    disabled = false,
  }: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (value: string) => void;
    disabled?: boolean;
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
                ? "All"
                : selected.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
            <div
                className="flex items-center gap-2 font-normal p-2 rounded-md hover:bg-accent"
                onClick={(e) => {
                  e.preventDefault();
                  onChange('all');
                }}
              >
                <Checkbox
                  id={`checkbox-${label}-all`}
                  checked={selected.length === options.length}
                  onCheckedChange={() => onChange('all')}
                />
                <Label htmlFor={`checkbox-${label}-all`} className="font-normal flex-1 cursor-pointer">
                  All
                </Label>
            </div>
            <Separator />
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center gap-2 font-normal p-2 rounded-md hover:bg-accent"
                onClick={(e) => {
                  e.preventDefault();
                  onChange(option);
                }}
              >
                <Checkbox
                  id={`checkbox-${label}-${option}`}
                  checked={selected.includes(option)}
                  onCheckedChange={() => onChange(option)}
                />
                <Label htmlFor={`checkbox-${label}-${option}`} className="font-normal flex-1 cursor-pointer">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading filters...</span>
        </div>
    );
  }

  return (
    <div className="grid gap-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject} disabled={availableSubjects.length === 0}>
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
            />
        </div>
        
        <MultiSelectPopover
            label="Question Type"
            options={ALL_QUESTION_TYPES}
            selected={selectedQuestionTypes}
            onChange={(value) => handleMultiSelectChange(value, selectedQuestionTypes, setSelectedQuestionTypes, ALL_QUESTION_TYPES)}
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

        <Button onClick={handleStartQuiz} className="w-full mt-2" size="lg">
            Start Quiz
        </Button>
    </div>
  );
}
