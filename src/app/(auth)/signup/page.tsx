"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { GlassForm } from "@/components/ui/glass-form";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (role: 'Student' | 'Teacher') => {
    localStorage.setItem("userRole", role);
    localStorage.setItem("onboardingStatus", "pending");
    router.push('/onboarding');
  };

  return (
    <GlassForm>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-gray-300 mt-2">Choose your role to get started.</p>
      </div>
      <div className="space-y-4">
        <Button onClick={() => handleSignup('Student')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base font-semibold">
          Sign up as a Student
        </Button>
        <Button onClick={() => handleSignup('Teacher')} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 text-base font-semibold">
          Sign up as a Teacher
        </Button>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-300">Already have an account?</span>{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    </GlassForm>
  );
}
