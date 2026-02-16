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
import { ArrowLeft, ArrowRight, Check, IndianRupee, Book, Layers, PlusCircle, Trash2, Link as LinkIcon, FileText, Video } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useFirebase, useUser } from "@/firebase";
import { addDoc, collection, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { getSubjects } from "@/lib/data";

const steps = [
  { id: 1, name: "Basic Info", icon: Book },
  { id: 2, name: "Content", icon: Layers },
  { id: 3, name: "Pricing", icon: IndianRupee },
  { id: 4, name: "Publish", icon: Check },
];

interface CourseContent {
  id: number;
  title: string;
  type: 'pdf' | 'video';
  url: string;
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
      difficulty: "",
      price: "",
      coverImage: "https://picsum.photos/seed/course-placeholder/600/400", // Default placeholder
      imageHint: "course placeholder"
  });

  const [courseContent, setCourseContent] = React.useState<CourseContent[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  
  const handleAddContent = (type: 'pdf' | 'video') => {
    setCourseContent([...courseContent, { id: Date.now(), title: "", type, url: "" }]);
  };
  
  const handleRemoveContent = (id: number) => {
    setCourseContent(courseContent.filter(content => content.id !== id));
  };
  
  const handleContentChange = (id: number, field: keyof Omit<CourseContent, 'id' | 'type'>, value: string) => {
    setCourseContent(courseContent.map(content => content.id === id ? { ...content, [field]: value } : content));
  };

  const isValidUrl = (url: string, type: 'pdf' | 'video') => {
    try {
      const parsedUrl = new URL(url);
      if (type === 'pdf') {
        return parsedUrl.protocol === "https:" && (parsedUrl.pathname.toLowerCase().endsWith('.pdf') || parsedUrl.hostname.includes('docs.google.com'));
      }
      if (type === 'video') {
        const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com'];
        return videoDomains.some(domain => parsedUrl.hostname.includes(domain));
      }
      return false;
    } catch (_) {
      return false;
    }
  };
  
  const isStep1Valid = courseData.title.trim() !== '' && courseData.description.trim() !== '' && courseData.category.trim() !== '' && courseData.difficulty.trim() !== '';
  const isStep2Valid = courseContent.length > 0 && courseContent.every(content => content.title.trim() !== '' && isValidUrl(content.url, content.type));
  const isStep3Valid = courseData.price.trim() !== '';

  const isNextStepDisabled = () => {
    if (currentStep === 1) return !isStep1Valid;
    if (currentStep === 2) return !isStep2Valid;
    if (currentStep === 3) return !isStep3Valid;
    if (currentStep === 4) return true;
    return false;
  };

  const handlePublish = async () => {
     if (!firestore || !user) {
        toast({ variant: 'destructive', title: "Error", description: "You must be logged in to create a course." });
        return;
    }
    // Final validation before publishing
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
        toast({ variant: 'destructive', title: "Missing Information", description: "Please complete all previous steps correctly." });
        // Find first invalid step and go to it
        if (!isStep1Valid) setCurrentStep(1);
        else if (!isStep2Valid) setCurrentStep(2);
        else if (!isStep3Valid) setCurrentStep(3);
        return;
    }
    
    setIsPublishing(true);

    try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const authorName = userDoc.exists() ? userDoc.data().name : user.displayName || "Anonymous Teacher";

        await addDoc(collection(firestore, 'courses'), {
            ...courseData,
            authorId: user.uid,
            author: authorName,
            createdAt: serverTimestamp(),
            content: courseContent.map(({id, ...rest}) => rest), // Remove client-side ID
            lessons: courseContent.length,
        });

        toast({
          title: "Course Published!",
          description: `"${courseData.title}" is now live and available for students.`,
        });
        
        router.push('/admin/courses');

    } catch (error) {
        console.error("Error publishing course:", error);
        toast({ variant: 'destructive', title: "Publishing Failed", description: "Could not save the course to the database. Please try again." });
    } finally {
        setIsPublishing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ScrollReveal>
            <Card>
              <CardHeader>
                <CardTitle>Basic Course Information</CardTitle>
                <CardDescription>Give your course a name and describe what it's about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="course-title">Course Title</Label>
                  <Input id="course-title" placeholder="e.g., Introduction to Calculus" value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-description">Short Description</Label>
                  <Textarea id="course-description" placeholder="Briefly explain what students will learn." value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Subject / Category</Label>
                        <Select value={courseData.category} onValueChange={(value) => setCourseData({...courseData, category: value})}>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                               {allSubjects.map(subject => (
                                    <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                         <Select value={courseData.difficulty} onValueChange={(value) => setCourseData({...courseData, difficulty: value})}>
                            <SelectTrigger><SelectValue placeholder="Select a level" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        );
      case 2:
        return (
          <ScrollReveal>
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>Add topics by linking to PDFs, Google Docs, or videos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {courseContent.map((content, index) => (
                  <ScrollReveal key={content.id} delay={index * 0.1}>
                    <div className="border rounded-lg p-4 space-y-4 relative bg-card">
                       <div className="flex justify-between items-center">
                         <h4 className="font-semibold text-lg flex items-center gap-2">
                           {content.type === 'pdf' ? <FileText className="w-5 h-5 text-destructive"/> : <Video className="w-5 h-5 text-blue-500" />}
                           Topic {index + 1}
                         </h4>
                         <Button variant="ghost" size="icon" onClick={() => handleRemoveContent(content.id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                       <div className="space-y-2">
                          <Label htmlFor={`content-title-${content.id}`}>Topic Title</Label>
                          <Input id={`content-title-${content.id}`} placeholder="e.g., Chapter 1: Introduction" value={content.title} onChange={(e) => handleContentChange(content.id, 'title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor={`content-url-${content.id}`}>
                                {content.type === 'pdf' ? 'PDF or Google Doc Link' : 'Video Link (YouTube, Vimeo)'}
                           </Label>
                           <div className="relative">
                               <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input 
                                   id={`content-url-${content.id}`} 
                                   placeholder={`https://example.com/your-file...`} 
                                   value={content.url} 
                                   onChange={(e) => handleContentChange(content.id, 'url', e.target.value)}
                                   className="pl-9"
                                />
                           </div>
                        </div>
                    </div>
                  </ScrollReveal>
                ))}
                 <div className="flex gap-4">
                     <Button variant="outline" onClick={() => handleAddContent('pdf')} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add PDF/Doc Topic
                    </Button>
                    <Button variant="outline" onClick={() => handleAddContent('video')} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Video Topic
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        );
      case 3:
        return (
          <ScrollReveal>
            <Card>
              <CardHeader>
                <CardTitle>Set Your Price</CardTitle>
                <CardDescription>Choose a price tier for your course. Select 'Free' to make it accessible to all students.</CardDescription>
              </CardHeader>
              <CardContent className="max-w-xs mx-auto">
                <Select value={courseData.price} onValueChange={(value) => setCourseData({...courseData, price: value})}>
                  <SelectTrigger className="text-xl h-12">
                    <div className="flex items-center">
                      <IndianRupee className="mr-2 h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Select a price" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {priceTiers.map(tier => (
                      <SelectItem key={tier} value={String(tier)}>{tier === 0 ? 'Free' : `₹ ${tier}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <p className="text-center text-sm text-muted-foreground mt-2">This is the base price for your course.</p>
              </CardContent>
            </Card>
          </ScrollReveal>
        );
      case 4:
        return (
          <ScrollReveal className="text-center">
            <Card className="p-8">
              <Check className="mx-auto h-16 w-16 text-green-500 bg-green-100 rounded-full p-3 mb-4" />
              <CardTitle className="text-2xl">Ready to Publish?</CardTitle>
              <CardDescription className="mt-2 mb-6">
                Your course is ready to go live. Once published, students will be able to enroll.
              </CardDescription>
              <Button size="lg" onClick={handlePublish} disabled={isPublishing}>
                  {isPublishing ? "Publishing..." : "Publish Course"}
              </Button>
            </Card>
          </ScrollReveal>
        );
    }
  };
  
  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create a New Course</h1>
        <p className="text-muted-foreground mt-2 text-lg">Follow the steps to build and launch your course.</p>
      </ScrollReveal>

      {/* Stepper */}
      <div className="flex items-center justify-center space-x-2 md:space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${currentStep > step.id ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${currentStep === step.id ? 'border-primary scale-110' : ''}
                  ${currentStep < step.id ? 'border-border bg-card' : ''}
                `}
              >
                {currentStep > step.id ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <p className="text-xs md:text-sm mt-2 text-center">{step.name}</p>
            </div>
            {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-border" />}
          </React.Fragment>
        ))}
      </div>

      <div className="py-8">
        <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={nextStep} disabled={isNextStepDisabled()}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
