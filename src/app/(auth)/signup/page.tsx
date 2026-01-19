"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { GlassForm } from "@/components/ui/glass-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GraduationCap, Briefcase } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and policies." }),
  }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<"student" | "teacher" | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const handleNewUser = async (user: User, role: string, name: string) => {
    if (!firestore) throw new Error("Firestore not available");
    
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // This case should ideally not happen in a normal signup flow,
      // but as a safeguard, we treat it as a login.
      const userData = userDoc.data();
      localStorage.setItem("userRole", userData.role);
      toast({
        title: "Welcome Back!",
        description: `Signed in as ${userData.name || user.email}.`,
      });
      router.push(userData.role === 'admin' ? '/locked' : '/dashboard');
      return;
    }

    // New user, create their profile document
    await setDoc(userDocRef, {
      uid: user.uid,
      name: name,
      email: user.email,
      role: role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true,
    });

    localStorage.setItem("userRole", role);
    // Direct user to onboarding to collect role-specific profile info
    localStorage.setItem("onboardingStatus", "pending");

    toast({
      title: "Account Created!",
      description: "Welcome to SyllabiQ. Let's get you set up.",
    });

    router.push('/onboarding');
  }

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (!selectedRole) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a role.'});
      return;
    }
    setIsLoading(true);
    try {
      if (!auth) throw new Error("Auth service not available");
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await handleNewUser(userCredential.user, selectedRole, values.name);
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: getFirebaseErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassForm>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-gray-300 mt-2">Join our community of learners and educators.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 bg-white/10 p-1 rounded-lg">
          <button
            onClick={() => setSelectedRole("student")}
            className={cn("p-2 rounded-md text-sm font-medium transition-colors text-white/70", selectedRole === 'student' && "bg-white/20 text-white shadow-md")}
          >
            <GraduationCap className="inline-block w-4 h-4 mr-1.5"/> Student
          </button>
          <button
            onClick={() => setSelectedRole("teacher")}
            className={cn("p-2 rounded-md text-sm font-medium transition-colors text-white/70", selectedRole === 'teacher' && "bg-white/20 text-white shadow-md")}
          >
             <Briefcase className="inline-block w-4 h-4 mr-1.5"/> Teacher
          </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedRole && (
           <motion.div
              key={selectedRole}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:ring-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} className="bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:ring-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:ring-primary/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="terms"
                          className="border-white/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label
                          htmlFor="terms"
                          className="text-sm font-normal text-gray-300"
                        >
                          I accept the{" "}
                          <Link href="/terms" target="_blank" className="font-medium text-primary underline-offset-4 hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" target="_blank" className="font-medium text-primary underline-offset-4 hover:underline">
                            Privacy Policy
                          </Link>
                          .
                        </Label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : `Sign Up as a ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                </Button>
              </form>
            </FormProvider>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-300">Already have an account?</span>{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </div>
    </GlassForm>
  );
}
