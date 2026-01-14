
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
import { ArrowLeft, ArrowRight, Check, DollarSign, Book, Layers, PlusCircle, Trash2, Link as LinkIcon, FileText, Video } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const steps = [
  { id: 1, name: "Basic Info", icon: Book },
  { id: 2, name: "Content", icon: Layers },
  { id: 3, name: "Pricing", icon: DollarSign },
  { id: 4, name: "Publish", icon: Check },
];

interface CourseContent {
  id: number;
  title: string;
  type: 'pdf' | 'video';
  url: string;
}

export default function CreateCoursePage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [courseTitle, setCourseTitle] = React.useState("");
  const [courseDescription, setCourseDescription] = React.useState("");
  const [courseContent, setCourseContent] = React.useState<CourseContent[]>([]);
  const [price, setPrice] = React.useState("");

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
        return parsedUrl.pathname.toLowerCase().endsWith('.pdf') || parsedUrl.hostname.includes('docs.google.com');
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
  
  const handlePublish = () => {
    // Validate content before publishing
    for (const content of courseContent) {
        if (!content.title.trim()) {
            toast({ variant: 'destructive', title: "Validation Error", description: `Please provide a title for all content items.` });
            return;
        }
        if (!isValidUrl(content.url, content.type)) {
            toast({ variant: 'destructive', title: "Validation Error", description: `Please provide a valid ${content.type === 'pdf' ? 'PDF or Google Doc' : 'video'} URL for "${content.title}".` });
            return;
        }
    }

    toast({
      title: "Course Published!",
      description: `"${courseTitle}" is now live and available for students.`,
    });
    // Reset state or redirect
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
                  <Input id="course-title" placeholder="e.g., Introduction to Calculus" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-description">Short Description</Label>
                  <Textarea id="course-description" placeholder="Briefly explain what students will learn." value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Subject / Category</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="math">Mathematics</SelectItem>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="history">History</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select a level" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
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
                <CardDescription>Choose a one-time price for your course.</CardDescription>
              </CardHeader>
              <CardContent className="max-w-xs mx-auto">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="number" placeholder="0.00" className="pl-10 text-xl h-12" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                 <p className="text-center text-sm text-muted-foreground mt-2">Currency is in USD.</p>
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
              <Button size="lg" onClick={handlePublish}>Publish Course</Button>
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
        <Button onClick={nextStep} disabled={currentStep === 4}>
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
