"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import type { OurFileRouter } from "@/app/api/uploadthing/route";
import { UploadDropzone } from "@/lib/uploadthing";

const steps = [
  { id: 1, title: "Tell us about your studies" },
  { id: 2, title: "What are your goals?" },
  { id: 3, title: "Bank Details (for Refunds)"},
  { id: 4, title: "All set!" },
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
    bankDetails: {
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: ""
    }
  });
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [isSaving, setIsSaving] = React.useState(false);
  const [bankErrors, setBankErrors] = React.useState({ accountNumber: "", ifscCode: "" });


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
              bankDetails: formData.bankDetails,
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

  const isStepValid = () => {
    switch (currentStep) {
        case 1:
            return formData.gradeLevel.trim() !== '' && formData.preferredSubjects.length > 0;
        case 2:
            return formData.learningGoals.trim() !== '';
        case 3:
            return true;
        default:
            return true;
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 18) return; // Max length
    setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: value } });
    setBankErrors(prev => ({ ...prev, accountNumber: "" }));
  };

  const handleIfscChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (value.length > 11) return; // Max length
      setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: value } });
      setBankErrors(prev => ({ ...prev, ifscCode: "" }));
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
             <div className="space-y-6">
                <div className="text-center mb-4">
                    <Banknote className="mx-auto h-12 w-12 text-primary" />
                    <h3 className="text-2xl font-bold mt-2">Bank Account Details</h3>
                    <p className="text-muted-foreground">This information is required for processing refunds. It is kept secure and private.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Account Holder Name <span className="text-destructive">*</span></Label>
                        <Input id="accountHolderName" placeholder="e.g., John Doe" value={formData.bankDetails.accountHolderName} onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, accountHolderName: e.target.value}})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name <span className="text-destructive">*</span></Label>
                        <Input id="bankName" placeholder="e.g., State Bank of India" value={formData.bankDetails.bankName} onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})} />
                    </div>
                </div>
                 <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number <span className="text-destructive">*</span></Label>
                        <Input 
                          id="accountNumber" 
                          placeholder="9 to 18 digits" 
                          value={formData.bankDetails.accountNumber} 
                          onChange={handleAccountNumberChange}
                          className={bankErrors.accountNumber ? "border-destructive focus-visible:ring-destructive" : ""}
                          maxLength={18}
                        />
                         {bankErrors.accountNumber && <p className="text-sm text-destructive">{bankErrors.accountNumber}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code <span className="text-destructive">*</span></Label>
                        <Input 
                          id="ifscCode" 
                          placeholder="e.g., SBIN0001234" 
                          value={formData.bankDetails.ifscCode}
                          onChange={handleIfscChange}
                          className={bankErrors.ifscCode ? "border-destructive focus-visible:ring-destructive" : ""}
                          maxLength={11}
                        />
                         {bankErrors.ifscCode && <p className="text-sm text-destructive">{bankErrors.ifscCode}</p>}
                    </div>
                </div>
            </div>
        );
      case 4:
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
          {currentStep === steps.length -1 && (
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
