
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { createUserWithEmailAndPassword, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, limit, addDoc, updateDoc } from "firebase/firestore";
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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.399 7.822 29.522 5.5 24 5.5C13.257 5.5 5 13.757 5 24.5s8.257 19 19 19s19-8.257 19-19c0-1.042-.092-2.054-.263-3.037l.263.037z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.399 7.822 29.522 5.5 24 5.5C17.224 5.5 11.42 8.833 7.646 13.469l-1.34-1.778z" />
      <path fill="#4CAF50" d="M24 43.5c5.523 0 10.4-2.322 13.985-6.015l-6.571-4.819C29.655 36.392 25.349 39 20.298 39c-4.633 0-8.62-2.527-10.702-6.239l-6.596 5.043C9.042 41.134 15.932 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.571 4.819C40.923 34.437 44 28.618 44 22.5c0-1.522-.164-2.956-.45-4.35l.061-.067z" />
    </svg>
)

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
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
    if(userDoc.exists()) {
        toast({
            variant: "destructive",
            title: "Account Exists",
            description: "An account with this email already exists. Please log in.",
        });
        if (auth) await auth.signOut();
        router.push('/login');
        return;
    }
    
    const newUserPayload: any = {
      uid: user.uid,
      name: name,
      email: user.email,
      role: role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true,
      profilePicture: user.photoURL || `https://picsum.photos/seed/${user.uid}/100`,
    };
    
    await setDoc(userDocRef, newUserPayload);
    
    localStorage.setItem("userRole", role);
    localStorage.setItem("onboardingStatus", "pending");

    toast({
      title: "Account Created!",
      description: "Welcome to SyllabiQ. Let's get you set up.",
    });

    router.push('/onboarding');
  }

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a role first.'});
      return;
    }
    setIsGoogleLoading(true);
    try {
      if (!auth) throw new Error("Authentication service is not available");
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleNewUser(userCredential.user, selectedRole, userCredential.user.displayName || "New User");
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: getFirebaseErrorMessage(error),
      });
    } finally {
      setIsGoogleLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-white">Create an Account</h1>
        <p className="text-gray-300 mt-2">Join our community of learners and educators.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 bg-white/10 p-1 rounded-lg">
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
                <div className="space-y-4">
                    <Button variant="outline" className="w-full h-11 bg-white/90 text-black hover:bg-white" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        {isGoogleLoading ? `Signing up as ${selectedRole}...` : `Continue with Google`}
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/30 px-2 text-gray-300">Or with email</span>
                        </div>
                    </div>
                </div>
                <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-white">Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-black/30 text-white placeholder:text-gray-400 border-white/20 focus:ring-primary/50" />
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
                            <Input type="email" placeholder="you@example.com" {...field} className="bg-black/30 text-white placeholder:text-gray-400 border-white/20 focus:ring-primary/50" />
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
                            <Input type="password" placeholder="••••••••" {...field} className="bg-black/30 text-white placeholder:text-gray-400 border-white/20 focus:ring-primary/50" />
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

                    <Button type="submit" className="w-full h-11" disabled={isLoading || isGoogleLoading}>
                    {isLoading ? "Creating Account..." : `Sign Up as a ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
                    </Button>
                </form>
                </FormProvider>
            </motion.div>
            )}
        </AnimatePresence>
      </div>


      <div className="mt-6 text-center text-sm">
        <span className="text-gray-300">Already have an account?</span>{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </div>
    </GlassForm>
  );
}
