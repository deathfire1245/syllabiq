"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { GlassForm, GlassInput } from "@/components/ui/glass-form";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd have authentication logic here.
    // For this demo, we'll just navigate to the dashboard.
    localStorage.setItem("userRole", "Student"); // Default to student for demo
    router.push('/dashboard');
  };

  return (
    <GlassForm>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-300 mt-2">Enter your credentials to continue.</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Email</Label>
          <GlassInput 
            id="email" 
            type="email" 
            placeholder="student@example.com" 
            defaultValue="student@example.com"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Link href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">
              Forgot Password?
            </Link>
          </div>
          <GlassInput 
            id="password" 
            type="password" 
            defaultValue="password"
          />
        </div>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          Sign in
        </Button>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-300">Don&apos;t have an account?</span>{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </GlassForm>
  );
}
