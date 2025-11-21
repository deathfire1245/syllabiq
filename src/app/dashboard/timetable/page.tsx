
"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjects } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Download, RefreshCw, Save, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

interface TimeSlot {
    subject: string;
    duration: string;
}

interface Timetable {
    [key: string]: TimeSlot[];
}

export default function TimetableGeneratorPage() {
    const subjects = getSubjects().slice(0, 8); // Using placeholder subjects
    const { toast } = useToast();
    const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);
    const [studyHours, setStudyHours] = React.useState([3]);
    const [selectedDays, setSelectedDays] = React.useState<Day[]>([]);
    
    const [generatedTimetable, setGeneratedTimetable] = React.useState<Timetable | null>(null);

    const handleSubjectToggle = (subjectId: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleDayToggle = (day: Day) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleGenerate = () => {
        if (selectedSubjects.length === 0 || selectedDays.length === 0) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please select at least one subject and one day to generate a timetable.",
            });
            return;
        }

        const timetable: Timetable = {};
        const dailyHours = studyHours[0];
        const totalSlots = selectedDays.length * selectedSubjects.length;
        // Simple distribution: allocate subjects sequentially across the selected days.
        let subjectIndex = 0;

        // Shuffle subjects for variety
        const shuffledSubjects = [...selectedSubjects].sort(() => Math.random() - 0.5);

        selectedDays.forEach(day => {
            timetable[day] = [];
            // Assign subjects to slots for the day
            for (let i = 0; i < shuffledSubjects.length; i++) {
                const subjectId = shuffledSubjects[subjectIndex % shuffledSubjects.length];
                const subject = subjects.find(s => s.id === subjectId);
                
                if (subject) {
                     timetable[day].push({
                        subject: subject.name,
                        duration: `${(dailyHours / shuffledSubjects.length).toFixed(1)} hrs`,
                    });
                }
                subjectIndex++;
            }
            // Shuffle the daily slots for more randomness
            timetable[day].sort(() => Math.random() - 0.5);
        });

        setGeneratedTimetable(timetable);
    };

    const daysOrder: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div className="space-y-8">
            <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Timetable Generator</h1>
                <p className="text-muted-foreground mt-2 text-lg">Plan your study schedule in minutes.</p>
            </ScrollReveal>

            {/* Step 1: Subject Selection */}
            <ScrollReveal delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Choose Your Subjects</CardTitle>
                        <CardDescription>Select the subjects you want to include in your study plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {subjects.map(subject => (
                            <div key={subject.id}
                                className={cn("rounded-lg border p-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center",
                                    selectedSubjects.includes(subject.id) ? "bg-primary/10 border-primary" : "hover:bg-accent"
                                )}
                                onClick={() => handleSubjectToggle(subject.id)}
                            >
                                <Checkbox
                                    id={`subject-${subject.id}`}
                                    checked={selectedSubjects.includes(subject.id)}
                                    className="h-5 w-5"
                                    onCheckedChange={() => handleSubjectToggle(subject.id)}
                                />
                                <Label htmlFor={`subject-${subject.id}`} className="font-medium text-sm cursor-pointer">{subject.name}</Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </ScrollReveal>

            {/* Step 2: Time Configuration */}
            <ScrollReveal delay={0.2}>
                <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Set Your Schedule</CardTitle>
                        <CardDescription>Define when and for how long you want to study.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-semibold">Days of the Week</h4>
                            <div className="flex flex-wrap gap-2">
                                {(daysOrder).map(day => (
                                    <Button
                                        key={day}
                                        variant={selectedDays.includes(day) ? "default" : "outline"}
                                        onClick={() => handleDayToggle(day)}
                                        className="transition-all hover:shadow-primary/20"
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold">Daily Study Duration</h4>
                             <div className="flex items-center gap-4">
                               <Slider
                                    value={studyHours}
                                    onValueChange={setStudyHours}
                                    max={8}
                                    min={1}
                                    step={0.5}
                                />
                                <span className="font-medium text-lg w-24 text-right">{studyHours[0]} hours</span>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </ScrollReveal>

            {/* Step 3: Generate */}
            {!generatedTimetable && (
                <ScrollReveal delay={0.3} className="text-center">
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow transform hover:scale-105"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Timetable
                    </Button>
                </ScrollReveal>
            )}

            {/* Output */}
            <AnimatePresence>
                {generatedTimetable && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <CalendarCheck className="w-6 h-6 text-primary"/>
                                  Your Generated Timetable
                                </CardTitle>
                                <CardDescription>Here is your personalized study plan. You can save or download it.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${selectedDays.length > 4 ? 4 : selectedDays.length}`}>
                                    {daysOrder.filter(day => generatedTimetable[day]).map((day, dayIndex) => (
                                        <ScrollReveal key={day} delay={dayIndex * 0.1}>
                                            <div className="bg-card rounded-lg border p-4 min-w-[200px] sm:min-w-0 h-full">
                                                <h3 className="font-bold text-center mb-4">{day}</h3>
                                                <div className="space-y-3">
                                                    {generatedTimetable[day].map((slot: any, slotIndex: number) => (
                                                         <motion.div
                                                            key={slotIndex}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.2 + slotIndex * 0.1 }}
                                                        >
                                                            <div className="bg-secondary p-3 rounded-md shadow-sm">
                                                                <p className="font-semibold text-sm">{slot.subject}</p>
                                                                <p className="text-xs text-muted-foreground">{slot.duration}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                                </div>

                                <div className="flex flex-wrap gap-4 mt-8 justify-center items-center">
                                    <Button
                                      size="lg"
                                      onClick={handleGenerate}
                                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow transform hover:scale-105"
                                    >
                                      <RefreshCw className="mr-2 h-5 w-5" />
                                      Generate New Timetable
                                    </Button>
                                    <div className="flex flex-wrap gap-3">
                                      <Button variant="outline" disabled><Download className="mr-2 h-4 w-4"/>Download PDF</Button>
                                      <Button variant="outline" disabled><Save className="mr-2 h-4 w-4"/>Save to Profile</Button>
                                      <Button variant="outline" disabled><Share2 className="mr-2 h-4 w-4"/>Share</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
