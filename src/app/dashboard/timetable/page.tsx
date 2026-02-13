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
import { useUser, useFirebase, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import type { Subject, Topic } from "@/lib/types";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// This will now hold the actual topic object
interface TimeSlot {
    topic: Topic;
    duration: string;
}

// The new structure will group topics by subject for a given day
interface DailySchedule {
    [subjectName: string]: TimeSlot[];
}

interface Timetable {
    [day: string]: DailySchedule;
}


// Helper function to format duration
const formatDuration = (decimalHours: number): string => {
    if (isNaN(decimalHours) || decimalHours <= 0) {
        return "N/A";
    }
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return `${minutes} min`;
    }
};

export default function TimetableGeneratorPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const { firestore } = useFirebase();

    // Course and Profile fetching remains to determine available subjects
    const coursesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'courses') : null, [firestore]);
    const { data: allCourses, isLoading: isLoadingCourses } = useCollection(coursesQuery);

    const userDocRef = useMemoFirebase(() => (user && firestore) ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isLoadingProfile } = useDoc(userDocRef);
    
    // State for user preferences
    const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);
    const [studyHours, setStudyHours] = React.useState([3]);
    const [selectedDays, setSelectedDays] = React.useState<Day[]>([]);
    
    const [generatedTimetable, setGeneratedTimetable] = React.useState<Timetable | null>(null);

    const allStaticSubjects = getSubjects();
    
    // Determine which subjects are available for selection
    const availableSubjects = React.useMemo(() => {
        if (!userProfile || !allCourses) return allStaticSubjects.slice(0, 8);
        
        const enrolledCourseIds = userProfile.studentProfile?.enrolledCourses || [];
        if (enrolledCourseIds.length === 0) {
            return allStaticSubjects.slice(0, 8);
        }

        const enrolledCourses = allCourses.filter(course => enrolledCourseIds.includes(course.id));
        const subjectNames = [...new Set(enrolledCourses.map(course => course.category))];
        
        if (subjectNames.length === 0) return allStaticSubjects.slice(0, 8);
        
        // Return the full subject object
        return allStaticSubjects.filter(s => subjectNames.includes(s.name));
    }, [userProfile, allCourses, allStaticSubjects]);

    // Pre-select subjects based on what's available
    React.useEffect(() => {
        if (availableSubjects.length > 0) {
            setSelectedSubjects(availableSubjects.map(s => s.id));
        }
    }, [availableSubjects]);

    // NEW: Fetch topics based on selected subjects
    const topicsQuery = useMemoFirebase(() => {
        if (!firestore || selectedSubjects.length === 0) return null;
        // Firestore 'in' queries are limited to 30 values. We'll cap it here for safety.
        const queryableSubjects = selectedSubjects.slice(0, 30);
        return query(collection(firestore, 'topics'), where('subjectId', 'in', queryableSubjects));
    }, [firestore, selectedSubjects]);

    const { data: topics, isLoading: isLoadingTopics } = useCollection<Topic>(topicsQuery);
    
    // Handlers for UI interaction
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

    // Main generation logic
    const handleGenerate = () => {
        if (!topics || topics.length === 0) {
            toast({
                variant: "destructive",
                title: "No Topics Found",
                description: "Could not find any topics for the selected subjects. Please select other subjects.",
            });
            return;
        }
        if (selectedDays.length === 0) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please select at least one day to generate a schedule.",
            });
            return;
        }

        const timetable: Timetable = {};
        const dailyHours = studyHours[0];
        const topicsPerDay = Math.ceil(topics.length / selectedDays.length);
        const shuffledTopics = [...topics].sort(() => Math.random() - 0.5);

        selectedDays.forEach((day, index) => {
            const dayTopics = shuffledTopics.slice(index * topicsPerDay, (index + 1) * topicsPerDay);
            const durationPerTopic = dayTopics.length > 0 ? dailyHours / dayTopics.length : 0;
            const formattedDuration = formatDuration(durationPerTopic);
            
            // Group topics by subject for this day
            const dailySchedule: DailySchedule = {};
            dayTopics.forEach(topic => {
                const subject = allStaticSubjects.find(s => s.id === topic.subjectId);
                const subjectName = subject ? subject.name : "Unknown Subject";
                
                if (!dailySchedule[subjectName]) {
                    dailySchedule[subjectName] = [];
                }
                dailySchedule[subjectName].push({ topic, duration: formattedDuration });
            });
            
            timetable[day] = dailySchedule;
        });

        setGeneratedTimetable(timetable);
    };

    const daysOrder: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const isLoading = isLoadingCourses || isLoadingProfile;

    return (
        <div className="space-y-8">
            <ScrollReveal>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Study Schedule Generator</h1>
                <p className="text-muted-foreground mt-2 text-lg">Plan your study schedule in minutes.</p>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Choose Your Subjects</CardTitle>
                        <CardDescription>Select the subjects you want to include in your study plan. We've pre-selected subjects from your enrolled courses.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {isLoading ? (
                            [...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                        ) : (
                            availableSubjects.map(subject => (
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
                            ))
                        )}
                    </CardContent>
                </Card>
            </ScrollReveal>

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

            {!generatedTimetable && (
                <ScrollReveal delay={0.3} className="text-center">
                    <Button
                        size="lg"
                        onClick={handleGenerate}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow transform hover:scale-105"
                        disabled={isLoadingTopics}
                    >
                        {isLoadingTopics ? <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Fetching Topics...</> : <><Sparkles className="mr-2 h-5 w-5" /> Generate Schedule</>}
                    </Button>
                </ScrollReveal>
            )}

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
                                  Your Generated Schedule
                                </CardTitle>
                                <CardDescription>Here is your personalized study plan. You can save or download it.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${selectedDays.length > 4 ? 4 : Math.max(1, selectedDays.length)}`}>
                                    {daysOrder.filter(day => generatedTimetable[day]).map((day, dayIndex) => (
                                        <ScrollReveal key={day} delay={dayIndex * 0.1}>
                                            <div className="bg-card rounded-lg border p-4 min-w-[200px] sm:min-w-0 h-full">
                                                <h3 className="font-bold text-center mb-4">{day}</h3>
                                                <div className="space-y-4">
                                                    {Object.entries(generatedTimetable[day]).map(([subjectName, timeSlots]) => (
                                                         <div key={subjectName}>
                                                            <h4 className="font-semibold text-md mb-2">{subjectName}</h4>
                                                            <div className="space-y-2 pl-2 border-l-2 border-primary/50">
                                                                {timeSlots.map(({ topic, duration }) => (
                                                                    <motion.div
                                                                        key={topic.id}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: 0.2 + (dayIndex * 0.1) }}
                                                                    >
                                                                        <div className="bg-secondary p-3 rounded-md shadow-sm">
                                                                            <p className="font-semibold text-sm">{topic.name}</p>
                                                                            <p className="text-xs text-muted-foreground">{duration} • {topic.chapter}</p>
                                                                        </div>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
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
                                      Generate New Schedule
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
