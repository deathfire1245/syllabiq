"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import StudentOnboarding from "./student/page";
import TeacherOnboarding from "./teacher/page";
import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingPage() {
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const role = localStorage.getItem("userRole");
    const status = localStorage.getItem("onboardingStatus");

    if (status !== 'pending') {
      // If onboarding is already completed or not required, redirect to dashboard
      router.replace('/dashboard');
    } else if (role) {
      setUserRole(role);
      setLoading(false);
    } else {
      // If no role is found, something is wrong, redirect to login
      router.replace('/login');
    }
  }, [router]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingStatus", "completed");
    router.push("/dashboard");
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-2xl space-y-8">
                <Skeleton className="h-16 w-1/2 mx-auto" />
                <Skeleton className="h-48 w-full" />
                <div className="flex justify-between">
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-24" />
                </div>
            </div>
      </div>
    );
  }

  return (
    <div>
      {userRole === "Student" && <StudentOnboarding onComplete={handleOnboardingComplete} />}
      {userRole === "Teacher" && <TeacherOnboarding onComplete={handleOnboardingComplete} />}
    </div>
  );
}
