"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { GlassForm, GlassInput } from "@/components/ui/glass-form";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <GlassForm>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-gray-300 mt-2">Join SyllabiQ to start learning.</p>
      </div>
      <form onSubmit={handleSignup} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">Name</Label>
          <GlassInput 
            id="name" 
            placeholder="John Doe" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Email</Label>
          <GlassInput 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <GlassInput 
            id="password" 
            type="password" 
            required 
          />
        </div>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          Create Account
        </Button>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-300">Already have an account?</span>{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </div>
      </form>
    </GlassForm>
  );
}
