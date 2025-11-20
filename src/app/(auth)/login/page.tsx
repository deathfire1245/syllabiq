"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScrollReveal } from "@/components/ScrollReveal";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <ScrollReveal yOffset={50}>
      <div className="relative w-full max-w-sm">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-accent rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative w-full max-w-sm bg-card/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="student@example.com" 
                required 
                defaultValue="student@example.com" 
                className="bg-transparent focus:bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                defaultValue="password"
                className="bg-transparent focus:bg-background/50"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              Sign in
            </Button>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account?</span>{" "}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </ScrollReveal>
  );
}
