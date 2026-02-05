
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirebase } from "@/firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";

const steps = [
  { id: 1, title: "Your Expertise" },
  { id: 2, title: "Bio & Availability" },
  { id: 3, title: "All Set!" },
];

const subjects = ["Mathematics", "Science", "History", "Literature", "Computer Science", "Physics", "Chemistry", "Biology"];
const qualifications = ["Bachelor's Degree", "Master's Degree", "PhD", "Teaching Certification"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TeacherOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    subjects: [] as string[],
    qualifications: [] as string[],
    experienceYears: "",
    hourlyRate: "",
    bio: "",
    availability: {
      days: [] as string[],
      timeSlots: [] as string[], // Placeholder for now
    },
  });
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [isSaving, setIsSaving] = React.useState(false);


  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleMultiSelect = (field: "subjects" | "qualifications" | "availability.days", value: string) => {
    if (field === 'availability.days') {
        setFormData(prev => {
            const currentDays = prev.availability.days;
            const newDays = currentDays.includes(value)
                ? currentDays.filter(d => d !== value)
                : [...currentDays, value];
            return { ...prev, availability: { ...prev.availability, days: newDays }};
        });
    } else {
        setFormData((prev) => {
            const currentValues = prev[field as "subjects" | "qualifications"];
            if (currentValues.includes(value)) {
                return { ...prev, [field]: currentValues.filter((v) => v !== value) };
            } else {
                return { ...prev, [field]: [...currentValues, value] };
            }
        });
    }
  };

  const handleFinish = async () => {
    if (!user || !firestore) {
        toast({ title: 'Error', description: 'Could not save profile. User not found.', variant: 'destructive' });
        return;
    }
     if (!isStepValid(true)) {
        toast({ title: 'Missing Information', description: 'Please ensure all required fields are filled correctly.', variant: 'destructive' });
        return;
    }
    setIsSaving(true);
    try {
        const userDocRef = doc(firestore, 'users', user.uid);

        // Fetch user's name from their private document
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            toast({ title: 'Error', description: 'User profile not found.', variant: 'destructive' });
            setIsSaving(false);
            return;
        }
        const userName = userDocSnap.data().name;
        
        // 1. Update private user document
        const teacherProfileData = {
            subjects: formData.subjects,
            qualifications: formData.qualifications,
            experienceYears: Number(formData.experienceYears),
            hourlyRate: Number(formData.hourlyRate),
            bio: formData.bio,
            availability: formData.availability,
            isVerified: false,
            totalSessions: 0,
            rating: 0,
        };
        await updateDoc(userDocRef, {
            teacherProfile: teacherProfileData,
        });

        // 2. Create/update public tutor document
        const tutorDocRef = doc(firestore, 'tutors', user.uid);
        const publicTutorData = {
            name: userName,
            subjects: formData.subjects,
            hourlyRate: Number(formData.hourlyRate),
            availability: formData.availability,
            bio: formData.bio,
        };
        await setDoc(tutorDocRef, publicTutorData, { merge: true });

        toast({
            title: "Profile setup complete!",
            description: "Welcome to your teacher dashboard.",
        });
        onComplete();
    } catch (error) {
        console.error("Failed to save teacher profile:", error);
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
                if (formData.subjects.length === 0 || formData.qualifications.length === 0 || formData.experienceYears.trim() === '') return false;
                break;
            case 2:
                if (formData.bio.trim() === '' || formData.hourlyRate.trim() === '' || formData.availability.days.length === 0) return false;
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
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Which subjects do you specialize in? <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Badge 
                    key={subject}
                    variant={formData.subjects.includes(subject) ? "default" : "outline"}
                    className="cursor-pointer text-base py-1 px-3"
                    onClick={() => handleMultiSelect("subjects", subject)}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Your Qualifications <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {qualifications.map(q => (
                  <Badge 
                    key={q}
                    variant={formData.qualifications.includes(q) ? "default" : "outline"}
                    className="cursor-pointer text-base py-1 px-3"
                    onClick={() => handleMultiSelect("qualifications", q)}
                  >
                    {q}
                  </Badge>
                ))}
              </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="experience">Years of Teaching Experience <span className="text-destructive">*</span></Label>
                <Input id="experience" type="number" placeholder="e.g., 5" value={formData.experienceYears} onChange={(e) => setFormData({...formData, experienceYears: e.target.value })} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Your Bio / Introduction <span className="text-destructive">*</span></Label>
              <Textarea id="bio" placeholder="Tell students a bit about yourself, your passion for teaching, and what they can expect from your classes." className="min-h-[120px]" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="hourly-rate">Your Hourly Teaching Rate (INR) <span className="text-destructive">*</span></Label>
                <div className="relative max-w-xs">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="hourly-rate" type="number" placeholder="e.g., 800" className="pl-10" value={formData.hourlyRate} onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}/>
                </div>
            </div>
            <div className="space-y-3">
              <Label>Your Weekly Availability <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {days.map(day => (
                  <Badge 
                    key={day}
                    variant={formData.availability.days.includes(day) ? "default" : "outline"}
                    className="cursor-pointer text-base py-1 px-3"
                    onClick={() => handleMultiSelect("availability.days", day)}
                  >
                    {day}
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
            <p className="text-muted-foreground text-lg max-w-md mx-auto">Your teacher profile is complete. You can now start creating content and managing your schedule.</p>
          </div>
        );
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
          {currentStep === 2 && <CardDescription>This information will be displayed on your public profile.</CardDescription>}
        </CardHeader>
        <CardContent className="min-h-[350px] flex flex-col justify-center">
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
                {isSaving ? "Saving Profile..." : "Complete Setup & Go to Dashboard"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
