
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
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase-errors";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, firestore } = useFirebase();
  const [isLoading, setIsLoading] = React.useState(false);

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
      throw new Error("Your account does not exist or has been disabled.");
    }
    
    const userData = userDoc.data();
    
    // Update last login time
    await updateDoc(userDocRef, { lastLogin: serverTimestamp() });

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
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-300 mt-2">Login to continue your journey.</p>
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
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </FormProvider>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-300">Don&apos;t have an account?</span>{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </GlassForm>
  );
}
