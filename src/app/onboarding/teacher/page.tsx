"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Welcome, Educator!" },
  { id: 2, title: "Your Expertise" },
  { id: 3, title: "Teaching Style & Rate" },
  { id: 4, title: "Final Touches" },
];

const subjects = ["Mathematics", "Science", "History", "Literature", "Computer Science", "Physics", "Chemistry", "Biology"];
const teachingStyles = ["Concept-based", "Exam-focused", "Practical & Hands-on", "Student-led"];

export default function TeacherOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = React.useState(1);
   const [formData, setFormData] = React.useState({
    subjects: [] as string[],
    qualification: "",
    experience: "",
    teachingStyle: "",
    teachingMode: "Online",
    hourlyRate: "50",
    bio: "",
  });
  const { toast } = useToast();

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleMultiSelect = (field: "subjects", value: string) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const handleFinish = () => {
    localStorage.setItem('onboardingData', JSON.stringify(formData));
    toast({
        title: "Profile setup complete!",
        description: "Welcome to your teacher dashboard.",
    });
    onComplete();
  };


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome, Educator!</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">We're excited to have you. Let's set up your teaching profile so students can find you.</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Which subjects do you specialize in?</Label>
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
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="qualification">Your Highest Qualification</Label>
                    <Input id="qualification" placeholder="e.g., PhD in Physics" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="experience">Years of Teaching Experience</Label>
                    <Input id="experience" type="number" placeholder="e.g., 5" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
             <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="teaching-style">Primary Teaching Style</Label>
                     <Select value={formData.teachingStyle} onValueChange={(value) => setFormData({...formData, teachingStyle: value})}>
                        <SelectTrigger><SelectValue placeholder="Select a style" /></SelectTrigger>
                        <SelectContent>
                            {teachingStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Preferred Teaching Mode</Label>
                    <Select value={formData.teachingMode} onValueChange={(value) => setFormData({...formData, teachingMode: value})}>
                        <SelectTrigger><SelectValue placeholder="Select a mode" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Hybrid">Hybrid (Online/In-person)</SelectItem>
                             <SelectItem value="In-person">In-person Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="hourly-rate">Your Hourly Teaching Rate (USD)</Label>
                <div className="relative max-w-xs">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="hourly-rate" type="number" placeholder="50" className="pl-10" value={formData.hourlyRate} onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}/>
                </div>
            </div>
          </div>
        );
       case 4:
        return (
          <div className="space-y-4 text-center">
            <div className="space-y-2 text-left">
              <Label htmlFor="bio">Your Bio / Introduction</Label>
              <Textarea id="bio" placeholder="Tell students a bit about yourself, your passion for teaching, and what they can expect from your classes." className="min-h-[120px]" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}/>
            </div>
             <div className="pt-4">
                <Check className="mx-auto h-16 w-16 text-green-500 bg-green-100 rounded-full p-3 mb-4" />
                <h2 className="text-2xl font-bold">Your profile is ready!</h2>
                <p className="text-muted-foreground">You can always edit these details later from your profile page.</p>
            </div>
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
        </CardHeader>
        <CardContent className="min-h-[250px] flex flex-col justify-center">
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
          {currentStep < steps.length && (
            <Button onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === steps.length && (
            <Button onClick={handleFinish} size="lg">
                Complete Setup & Go to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
