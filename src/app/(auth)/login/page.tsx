
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
import { signInWithEmailAndPassword, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.399 7.822 29.522 5.5 24 5.5C13.257 5.5 5 13.757 5 24.5s8.257 19 19 19s19-8.257 19-19c0-1.042-.092-2.054-.263-3.037l.263.037z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039L38.485 11.49C34.399 7.822 29.522 5.5 24 5.5C17.224 5.5 11.42 8.833 7.646 13.469l-1.34-1.778z" />
      <path fill="#4CAF50" d="M24 43.5c5.523 0 10.4-2.322 13.985-6.015l-6.571-4.819C29.655 36.392 25.349 39 20.298 39c-4.633 0-8.62-2.527-10.702-6.239l-6.596 5.043C9.042 41.134 15.932 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.571 4.819C40.923 34.437 44 28.618 44 22.5c0-1.522-.164-2.956-.45-4.35l.061-.067z" />
    </svg>
)

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleUserLogin = async (user: User) => {
    if (!firestore) throw new Error("Firestore is not available");
    
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists() || !userDoc.data()?.isActive) {
      if (auth) await auth.signOut(); // Ensure user is signed out if their DB record is invalid
      throw new Error("Your account does not exist or has been disabled. Please sign up.");
    }
    
    const userData = userDoc.data();
    
    // Update last login time, but don't let it fail the whole login process
    try {
        await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
    } catch(error) {
        console.warn("Could not update last login time.", error);
    }

    localStorage.setItem('userRole', userData.role);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${userData.name || 'user'}!`,
    });

    if (userData.role === 'admin') {
        router.push('/locked'); // Admins must still go through the code lock
    } else {
        router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
        if (!auth) throw new Error("Authentication service is not available");
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        await handleUserLogin(userCredential.user);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: getFirebaseErrorMessage(error),
        });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      if (!auth) throw new Error("Authentication service is not available");
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await handleUserLogin(userCredential.user);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: getFirebaseErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassForm>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-300 mt-2">Login to continue your journey.</p>
      </div>

       <div className="space-y-4">
        <Button variant="outline" className="w-full h-11 bg-white/90 text-black hover:bg-white" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
        </Button>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/30 px-2 text-gray-300">Or continue with</span>
            </div>
        </div>

        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full h-11" disabled={isLoading || isGoogleLoading}>
                {isLoading ? "Logging in..." : "Login"}
            </Button>
            </form>
        </FormProvider>
      </div>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-300">Don&apos;t have an account?</span>{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </GlassForm>
  );
}
