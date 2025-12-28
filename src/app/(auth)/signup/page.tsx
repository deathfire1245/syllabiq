
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirebase } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["student", "teacher"], { required_error: "You must select a role." }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleNewUser = async (user: any, role: string, name: string) => {
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // User already exists, treat as login
      localStorage.setItem("userRole", userDoc.data().role);
      router.push('/dashboard');
      return;
    }

    await setDoc(userDocRef, {
      uid: user.uid,
      name: name,
      email: user.email,
      role: role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true
    });

    localStorage.setItem("userRole", role);
    localStorage.setItem("onboardingStatus", "pending");

    toast({
      title: "Account Created!",
      description: "Welcome to SyllabiQ. Let's get you set up.",
    });

    router.push('/onboarding');
  }

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await handleNewUser(userCredential.user, values.role, values.name);
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

  const handleGoogleSignIn = async () => {
    const role = form.getValues("role");
    if (!role) {
      toast({
        variant: "destructive",
        title: "Role not selected",
        description: "Please select whether you are a student or a teacher before signing in.",
      });
      return;
    }

    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleNewUser(result.user, role, result.user.displayName || "User");
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
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">I am a...</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/10 text-white border-white/20">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
      </FormProvider>

       <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white/10 px-2 text-gray-300">Or continue with</span>
        </div>
      </div>

      <Button variant="outline" className="w-full h-11 bg-white/10 text-white hover:bg-white/20 border-white/20" onClick={handleGoogleSignIn} disabled={isLoading}>
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign up with Google
      </Button>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-300">Already have an account?</span>{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </div>
    </GlassForm>
  );
}
