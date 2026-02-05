
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { id: 1, title: "Tell us about your studies" },
  { id: 2, title: "What are your goals?" },
  { id: 3, title: "All set!" },
];

const subjects = ["Mathematics", "Science", "History", "Literature", "Art", "Music", "Computer Science"];
const interests = ["Reading", "Gaming", "Sports", "Coding", "Movies", "Drawing", "Traveling"];

export default function StudentOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    gradeLevel: "",
    schoolBoard: "",
    preferredSubjects: [] as string[],
    learningGoals: "",
    interests: [] as string[],
  });
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [isSaving, setIsSaving] = React.useState(false);


  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleMultiSelect = (field: "preferredSubjects" | "interests", value: string) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };
  
  const handleFinish = async () => {
    if (!user || !firestore) {
        toast({ title: 'Error', description: 'Could not save profile. User not found.', variant: 'destructive' });
        return;
    }
     if (!isStepValid(true)) {
        toast({ title: 'Missing Information', description: 'Please ensure all required fields are filled correctly.', variant: 'destructive' });
        if (formData.gradeLevel.trim() === '' || formData.preferredSubjects.length === 0) setCurrentStep(1);
        else if (formData.learningGoals.trim() === '') setCurrentStep(2);
        return;
    }
    setIsSaving(true);
    try {
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
            studentProfile: {
              gradeLevel: formData.gradeLevel,
              schoolBoard: formData.schoolBoard,
              preferredSubjects: formData.preferredSubjects,
              learningGoals: formData.learningGoals,
              interests: formData.interests,
            },
        });
        toast({
            title: "Profile setup complete!",
            description: "Welcome to your personalized dashboard.",
        });
        onComplete();
    } catch (error) {
        console.error("Failed to save student profile:", error);
        toast({ title: 'Error', description: 'Failed to save your profile. Please try again.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  const isStepValid = (checkAll = false) => {
    const stepsToValidate = checkAll ? [1, 2] : [currentStep];

    for (const step of stepsToValidate) {
        switch (step) {
            case 1:
                if (formData.gradeLevel.trim() === '' || formData.preferredSubjects.length === 0) return false;
                break;
            case 2:
                if (formData.learningGoals.trim() === '') return false;
                break;
            default:
                break;
        }
    }
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                    <Label htmlFor="gradeLevel">What grade are you in? <span className="text-destructive">*</span></Label>
                    <Input id="gradeLevel" placeholder="e.g., Grade 10" value={formData.gradeLevel} onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="schoolBoard">School Board (Optional)</Label>
                    <Input id="schoolBoard" placeholder="e.g., CBSE, ICSE" value={formData.schoolBoard} onChange={(e) => setFormData({...formData, schoolBoard: e.target.value})}/>
                </div>
            </div>
            <div className="space-y-3">
              <Label>Which are your preferred subjects? <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Badge 
                    key={subject}
                    variant={formData.preferredSubjects.includes(subject) ? "default" : "outline"}
                    className="cursor-pointer text-base py-1 px-3"
                    onClick={() => handleMultiSelect("preferredSubjects", subject)}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        );
      case 2:
        return (
           <div className="space-y-6">
            <div className="space-y-2">
              <Label>What are your main learning goals? <span className="text-destructive">*</span></Label>
              <Textarea placeholder="e.g., Score 90% in Math, understand Physics concepts better..." value={formData.learningGoals} onChange={(e) => setFormData({...formData, learningGoals: e.target.value})}/>
            </div>
            <div className="space-y-3">
                <Label>What are some of your interests or hobbies? (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                    {interests.map(interest => (
                    <Badge 
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer text-base py-1 px-3"
                        onClick={() => handleMultiSelect("interests", interest)}
                    >
                        {interest}
                    </Badge>
                    ))}
                </div>
            </div>
           </div>
        );
      case 3:
        return (
           <div className="text-center">
             <Check className="mx-auto h-16 w-16 text-green-500 bg-green-100 rounded-full p-3 mb-6" />
            <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">Your personalized dashboard is ready. Let's start learning!</p>
          </div>
        )
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
           <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {steps.length}
            </p>
             <div className="flex items-center gap-1">
                 {steps.map(step => (
                     <div 
                        key={step.id} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${currentStep >= step.id ? 'bg-primary w-6' : 'bg-border w-4'}`}
                    />
                 ))}
            </div>
          </div>
          <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
          {currentStep === 3 && <CardDescription>This information is kept strictly confidential.</CardDescription>}
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col justify-center">
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
        </CardContent>
        <div className="p-6 flex justify-between items-center border-t">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStep < steps.length - 1 && (
            <Button onClick={nextStep} disabled={!isStepValid()}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === steps.length - 1 && (
             <Button onClick={nextStep} disabled={!isStepValid()}>
               Finish Setup
            </Button>
          )}
          {currentStep === steps.length && (
            <Button onClick={handleFinish} size="lg" disabled={isSaving}>
              {isSaving ? "Saving..." : "Go to Dashboard"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
