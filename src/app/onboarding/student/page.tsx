"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Welcome to SyllabiQ!" },
  { id: 2, title: "Tell us about your studies" },
  { id: 3, title: "What are your goals?" },
  { id: 4, title: "Just for fun..." },
  { id: 5, title: "All set!" },
];

const subjects = ["Mathematics", "Science", "History", "Literature", "Art", "Music"];
const goals = ["Ace my exams", "Understand concepts better", "Quick revision", "Homework help"];
const hobbies = ["Reading", "Gaming", "Sports", "Coding", "Movies", "Drawing"];

export default function StudentOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    grade: "",
    school: "",
    favoriteSubjects: [] as string[],
    studyGoals: [] as string[],
    hobbies: [] as string[],
    studyTime: "Morning",
  });
  const { toast } = useToast();

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleMultiSelect = (field: "favoriteSubjects" | "studyGoals" | "hobbies", value: string) => {
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
        description: "Welcome to your personalized dashboard.",
    });
    onComplete();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
             <Sparkles className="mx-auto h-16 w-16 text-primary bg-primary/10 rounded-full p-3 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Welcome to SyllabiQ!</h2>
            <p className="text-muted-foreground text-lg">Let's quickly set up your profile to personalize your learning experience.</p>
          </div>
        );
      case 2:
        return (
          <>
            <div className="space-y-2 mb-6">
              <Label htmlFor="grade">What grade are you in?</Label>
              <Input id="grade" placeholder="e.g., Grade 10" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} />
            </div>
             <div className="space-y-2 mb-6">
              <Label htmlFor="school">What's your school name? (Optional)</Label>
              <Input id="school" placeholder="e.g., Northwood High" value={formData.school} onChange={(e) => setFormData({...formData, school: e.target.value})}/>
            </div>
            <div className="space-y-3">
              <Label>Which are your favorite subjects?</Label>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <Badge 
                    key={subject}
                    variant={formData.favoriteSubjects.includes(subject) ? "default" : "outline"}
                    className="cursor-pointer text-base py-1 px-3"
                    onClick={() => handleMultiSelect("favoriteSubjects", subject)}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        );
      case 3:
        return (
           <div className="space-y-6">
            <div className="space-y-3">
              <Label>What are your main study goals?</Label>
              <div className="flex flex-wrap gap-2">
                 {goals.map(goal => (
                  <Badge 
                    key={goal}
                    variant={formData.studyGoals.includes(goal) ? "default" : "outline"}
                    className="cursor-pointer text-base py-1 px-3"
                    onClick={() => handleMultiSelect("studyGoals", goal)}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
             <div className="space-y-3">
              <Label>When do you prefer to study?</Label>
              <RadioGroup value={formData.studyTime} onValueChange={(value) => setFormData({...formData, studyTime: value})} className="flex gap-4">
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Morning" id="time-morning" />
                  <Label htmlFor="time-morning">Morning</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Evening" id="time-evening" />
                  <Label htmlFor="time-evening">Evening</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Night" id="time-night" />
                  <Label htmlFor="time-night">Night</Label>
                </div>
              </RadioGroup>
            </div>
           </div>
        );
       case 4:
        return (
          <div className="space-y-3">
            <Label>What are some of your hobbies and interests?</Label>
            <div className="flex flex-wrap gap-2">
              {hobbies.map(hobby => (
                <Badge 
                  key={hobby}
                  variant={formData.hobbies.includes(hobby) ? "default" : "outline"}
                  className="cursor-pointer text-base py-1 px-3"
                  onClick={() => handleMultiSelect("hobbies", hobby)}
                >
                  {hobby}
                </Badge>
              ))}
            </div>
          </div>
        );
      case 5:
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
          {currentStep < steps.length - 1 && (
            <Button onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {currentStep === steps.length -1 && (
             <Button onClick={nextStep}>
               Finish Setup
            </Button>
          )}
          {currentStep === steps.length && (
            <Button onClick={handleFinish} size="lg">
              Go to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
