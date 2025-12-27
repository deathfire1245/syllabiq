"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassForm } from "@/components/ui/glass-form";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: 'Student' | 'Teacher') => {
    localStorage.setItem('userRole', role);
    router.push('/dashboard');
  };

  return (
    <GlassForm>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-300 mt-2">Choose a role to continue.</p>
      </div>
      <div className="space-y-4">
        <Button onClick={() => handleLogin('Student')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base font-semibold">
          Login as Student
        </Button>
        <Button onClick={() => handleLogin('Teacher')} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 text-base font-semibold">
          Login as Teacher
        </Button>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-300">Don&apos;t have an account?</span>{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </GlassForm>
  );
}
