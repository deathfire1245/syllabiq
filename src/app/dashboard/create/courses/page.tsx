
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, IndianRupee, Book, Layers, PlusCircle, Trash2, Link as LinkIcon, FileText, Video, Sparkles, AlertCircle, Info, Star } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useFirebase, useUser } from "@/firebase";
import { addDoc, collection, serverTimestamp, getDoc, doc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getSubjects } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const steps = [
  { id: 1, name: "Basic Info", icon: Book },
  { id: 2, name: "Structure", icon: Layers },
  { id: 3, name: "Pricing", icon: IndianRupee },
  { id: 4, name: "Publish", icon: Sparkles },
];

interface LessonData {
  id: string;
  title: string;
  contentType: 'pdf' | 'video';
  contentUrl: string;
  duration: string; // in minutes
  isPreview: boolean;
}
interface ModuleData {
  id: string;
  title: string;
  lessons: LessonData[];
}
const priceTiers = [0, 300, 500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 5000];

export default function CreateCoursePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, user } = useFirebase();
  const allSubjects = getSubjects();

  const [currentStep, setCurrentStep] = React.useState(1);
  
  const [courseData, setCourseData] = React.useState({
      title: "",
      description: "",
      category: "",
      difficulty: "Beginner",
      price: "",
      learningOutcomes: [''],
      hasPracticeQuestions: false,
      hasFinalTest: false,
  });
  
  const [modules, setModules] = React.useState<ModuleData[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);

  // --- Step Navigation ---
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  
  // --- Learning Outcomes Management ---
  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...courseData.learningOutcomes];
    newOutcomes[index] = value;
    setCourseData({...courseData, learningOutcomes: newOutcomes});
  };
  const addOutcome = () => setCourseData({...courseData, learningOutcomes: [...courseData.learningOutcomes, '']});
  const removeOutcome = (index: number) => {
    if (courseData.learningOutcomes.length > 1) {
        setCourseData({...courseData, learningOutcomes: courseData.learningOutcomes.filter((_, i) => i !== index)});
    }
  };

  // --- Module and Lesson Management ---
  const addModule = () => {
    setModules([...modules, { id: `m-${Date.now()}`, title: "", lessons: [] }]);
  };
  const removeModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };
  const updateModuleTitle = (moduleId: string, title: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, title } : m));
  };
  const addLesson = (moduleId: string, type: 'pdf' | 'video') => {
    const newLesson: LessonData = { id: `l-${Date.now()}`, title: "", contentType: type, contentUrl: "", duration: "", isPreview: false };
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m));
  };
  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
  };
  const updateLesson = (moduleId: string, lessonId: string, field: keyof Omit<LessonData, 'id'>, value: any) => {
    setModules(modules.map(m => 
        m.id === moduleId 
            ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, [field]: value } : l) }
            : m
    ));
  };
  const setPreviewLesson = (moduleId: string, lessonId: string) => {
     setModules(modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => ({
            ...l,
            isPreview: (m.id === moduleId && l.id === lessonId)
        }))
     })));
  };

  // --- Validation ---
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0), 0);
  const hasPreview = modules.some(m => m.lessons.some(l => l.isPreview));

  const validation = React.useMemo(() => {
    const isStep1Valid = courseData.title.trim() !== '' && courseData.description.trim() !== '' && courseData.category.trim() !== '' && courseData.learningOutcomes.every(o => o.trim() !== '');
    const isStep2Valid = modules.length > 0 && modules.every(m => m.title.trim() !== '' && m.lessons.length > 0 && m.lessons.every(l => l.title.trim() !== '' && l.contentUrl.trim() !== '' && Number(l.duration) > 0)) && hasPreview;
    const isStep3Valid = courseData.price !== "";

    const priceValidation = {
        meetsRequirements: true,
        errors: [] as string[]
    };
    if (courseData.price === '500') {
        if (modules.length < 5) {
            priceValidation.meetsRequirements = false;
            priceValidation.errors.push("Requires at least 5 modules.");
        }
        if (totalLessons < 20) {
            priceValidation.meetsRequirements = false;
            priceValidation.errors.push("Requires at least 20 lessons total.");
        }
        if (!courseData.hasPracticeQuestions) {
             priceValidation.meetsRequirements = false;
            priceValidation.errors.push("Practice questions must be included.");
        }
        if (!courseData.hasFinalTest) {
             priceValidation.meetsRequirements = false;
            priceValidation.errors.push("A final test must be included.");
        }
    }
    
    return { isStep1Valid, isStep2Valid, isStep3Valid, priceValidation };
  }, [courseData, modules, totalLessons, hasPreview]);

  const { isStep1Valid, isStep2Valid, isStep3Valid, priceValidation } = validation;

  const isNextStepDisabled = () => {
    if (currentStep === 1) return !isStep1Valid;
    if (currentStep === 2) return !isStep2Valid;
    if (currentStep === 3) return !isStep3Valid || !priceValidation.meetsRequirements;
    return false;
  };
  
  const handlePublish = async () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !priceValidation.meetsRequirements) {
        toast({ variant: 'destructive', title: "Missing Information", description: "Please complete all previous steps correctly and meet all requirements." });
        return;
    }
     if (!firestore || !user) {
        toast({ variant: 'destructive', title: "Error", description: "You must be logged in to create a course." });
        return;
    }
    setIsPublishing(true);

    try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const authorName = userDoc.exists() ? userDoc.data().name : "Anonymous";
        const previewLesson = modules.flatMap(m => m.lessons).find(l => l.isPreview);

        // 1. Create main course document
        const courseDocRef = await addDoc(collection(firestore, 'courses'), {
            ...courseData,
            authorId: user.uid,
            author: authorName,
            createdAt: serverTimestamp(),
            modulesCount: modules.length,
            lessonsCount: totalLessons,
            totalDuration: totalDuration,
            previewLessonId: previewLesson?.id || null, // Will be replaced by actual Firestore ID
        });
        
        const batch = writeBatch(firestore);
        let finalPreviewLessonId: string | null = null;

        // 2. Create all module and lesson sub-collection documents
        for (const [moduleIndex, moduleData] of modules.entries()) {
            const moduleDocRef = doc(collection(firestore, 'courses', courseDocRef.id, 'modules'));
            batch.set(moduleDocRef, {
                title: moduleData.title,
                order: moduleIndex + 1,
                courseId: courseDocRef.id
            });
            
            for (const [lessonIndex, lessonData] of moduleData.lessons.entries()) {
                const lessonDocRef = doc(collection(firestore, 'courses', courseDocRef.id, 'modules', moduleDocRef.id, 'lessons'));
                 batch.set(lessonDocRef, {
                    title: lessonData.title,
                    order: lessonIndex + 1,
                    moduleId: moduleDocRef.id,
                    courseId: courseDocRef.id,
                    contentType: lessonData.contentType,
                    contentUrl: lessonData.contentUrl,
                    isPreview: lessonData.isPreview,
                    duration: Number(lessonData.duration),
                });

                if (lessonData.isPreview) {
                    finalPreviewLessonId = lessonDocRef.id;
                }
            }
        }
        
        // 3. Update main course doc with the real preview lesson ID
        if (finalPreviewLessonId) {
             batch.update(courseDocRef, { previewLessonId: finalPreviewLessonId });
        }
        
        // 4. Commit all writes at once
        await batch.commit();

        toast({ title: "Course Published!", description: `"${courseData.title}" is now live.` });
        router.push('/dashboard/courses');

    } catch (error) {
        console.error("Error publishing course:", error);
        toast({ variant: 'destructive', title: "Publishing Failed", description: "Could not save the course. Please try again." });
    } finally {
        setIsPublishing(false);
    }
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Info
        return (
          <Card>
              <CardHeader>
                <CardTitle>Basic Course Information</CardTitle>
                <CardDescription>Give your course a name and describe what it's about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2"><Label htmlFor="title">Course Title</Label><Input id="title" value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="desc">Description</Label><Textarea id="desc" value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} /></div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Category</Label><Select value={courseData.category} onValueChange={v => setCourseData({...courseData, category:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{allSubjects.map(s=><SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Difficulty</Label><Select value={courseData.difficulty} onValueChange={v => setCourseData({...courseData, difficulty:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Beginner">Beginner</SelectItem><SelectItem value="Intermediate">Intermediate</SelectItem><SelectItem value="Advanced">Advanced</SelectItem></SelectContent></Select></div>
                </div>
                 <div className="space-y-4 pt-4 border-t">
                    <Label>What will students learn?</Label>
                    {courseData.learningOutcomes.map((o, i) => <div key={i} className="flex items-center gap-2"><Input value={o} onChange={e => handleOutcomeChange(i, e.target.value)} /><Button variant="ghost" size="icon" onClick={() => removeOutcome(i)} className="text-destructive"><Trash2 className="w-4 h-4"/></Button></div>)}
                    <Button variant="outline" size="sm" onClick={addOutcome}><PlusCircle className="mr-2 h-4 w-4"/>Add Outcome</Button>
                </div>
              </CardContent>
            </Card>
        );
      case 2: // Structure
        return (
            <Card>
              <CardHeader>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>Organize your course into modules and lessons. You must select one lesson as a free preview.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="multiple" className="w-full space-y-4">
                    {modules.map((module, moduleIndex) => (
                        <AccordionItem value={module.id} key={module.id} className="border rounded-lg bg-secondary/50 px-4">
                           <AccordionTrigger className="py-0">
                                <div className="flex-1 flex items-center gap-2">
                                    <Input value={module.title} onChange={e => updateModuleTitle(module.id, e.target.value)} placeholder={`Module ${moduleIndex + 1}: Title`} className="text-lg font-semibold border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-14"/>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 p-4 border-t">
                                {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lesson.id} className="border rounded p-3 space-y-3 bg-card relative">
                                    <div className="flex justify-between items-center"><h4 className="font-semibold">Lesson {lessonIndex + 1}</h4><Button variant="ghost" size="icon" onClick={() => removeLesson(module.id, lesson.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button></div>
                                    <div className="space-y-2"><Label>Lesson Title</Label><Input value={lesson.title} onChange={e => updateLesson(module.id, lesson.id, 'title', e.target.value)} /></div>
                                    <div className="space-y-2"><Label>{lesson.contentType === 'pdf' ? 'PDF/Doc URL' : 'Video URL'}</Label><Input value={lesson.contentUrl} onChange={e => updateLesson(module.id, lesson.id, 'contentUrl', e.target.value)} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={lesson.duration} onChange={e => updateLesson(module.id, lesson.id, 'duration', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>Free Preview</Label><div className="h-10 flex items-center"><Switch checked={lesson.isPreview} onCheckedChange={() => setPreviewLesson(module.id, lesson.id)} /></div></div>
                                    </div>
                                </div>
                                ))}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => addLesson(module.id, 'pdf')}><PlusCircle className="mr-2 h-4 w-4"/>Add PDF Lesson</Button>
                                    <Button variant="outline" size="sm" onClick={() => addLesson(module.id, 'video')}><PlusCircle className="mr-2 h-4 w-4"/>Add Video Lesson</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Button variant="secondary" onClick={addModule} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Add Module</Button>
                {!hasPreview && modules.length > 0 && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Action Required</AlertTitle><AlertDescription>Please select one lesson to be the free preview.</AlertDescription></Alert>}
              </CardContent>
            </Card>
        );
      case 3: // Pricing
        return (
          <Card>
            <CardHeader>
                <CardTitle>Pricing & Requirements</CardTitle>
                <CardDescription>Set your price and ensure all requirements are met.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="max-w-xs mx-auto space-y-4">
                    <Label>Course Price</Label>
                    <Select value={courseData.price} onValueChange={(value) => setCourseData({...courseData, price: value})}>
                        <SelectTrigger className="text-xl h-12"><SelectValue placeholder="Select a price" /></SelectTrigger>
                        <SelectContent>{priceTiers.map(tier => <SelectItem key={tier} value={String(tier)}>{tier === 0 ? 'Free' : `₹ ${tier}`}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                     <Label>Additional Content</Label>
                     <div className="flex items-center space-x-2"><Switch id="questions" checked={courseData.hasPracticeQuestions} onCheckedChange={v => setCourseData({...courseData, hasPracticeQuestions: v})} /><Label htmlFor="questions">This course includes practice questions.</Label></div>
                     <div className="flex items-center space-x-2"><Switch id="test" checked={courseData.hasFinalTest} onCheckedChange={v => setCourseData({...courseData, hasFinalTest: v})} /><Label htmlFor="test">This course includes a final test.</Label></div>
                 </div>
                 {courseData.price === '500' && (
                     <Alert variant={priceValidation.meetsRequirements ? 'default' : 'destructive'} className={priceValidation.meetsRequirements ? "border-green-500" : ""}>
                         <Info className="h-4 w-4"/>
                         <AlertTitle>₹500 Tier Requirements</AlertTitle>
                         <AlertDescription>
                           <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li className={modules.length >= 5 ? "text-green-600" : ""}>At least 5 modules ({modules.length})</li>
                                <li className={totalLessons >= 20 ? "text-green-600" : ""}>At least 20 lessons ({totalLessons})</li>
                                <li className={courseData.hasPracticeQuestions ? "text-green-600" : ""}>Must include practice questions</li>
                                <li className={courseData.hasFinalTest ? "text-green-600" : ""}>Must include a final test</li>
                           </ul>
                         </AlertDescription>
                    </Alert>
                 )}
            </CardContent>
          </Card>
        );
      case 4: // Publish
        return (
          <ScrollReveal className="text-center">
            <Card className="p-8">
              <Check className="mx-auto h-16 w-16 text-green-500 bg-green-100 rounded-full p-3 mb-4" />
              <CardTitle className="text-2xl">Ready to Publish?</CardTitle>
              <CardDescription className="mt-2 mb-6">Your course is ready. Once published, it will be live for students.</CardDescription>
              <Button size="lg" onClick={handlePublish} disabled={isPublishing}>{isPublishing ? "Publishing..." : "Publish Course"}</Button>
            </Card>
          </ScrollReveal>
        );
    }
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create a New Course</h1>
      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep > step.id ? 'bg-primary border-primary text-primary-foreground' : ''} ${currentStep === step.id ? 'border-primary scale-110' : ''} ${currentStep < step.id ? 'border-border bg-card' : ''}`}>
                {currentStep > step.id ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </div>
              <p className="text-sm mt-2 text-center">{step.name}</p>
            </div>
            {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <div className="py-8">
        <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {renderStepContent()}
            </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
        {currentStep < steps.length && <Button onClick={nextStep} disabled={isNextStepDisabled()}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>}
      </div>
    </div>
  );
}
