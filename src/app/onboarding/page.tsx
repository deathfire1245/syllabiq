"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import StudentOnboarding from "./student/page";
import TeacherOnboarding from "./teacher/page";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/firebase";

export default function OnboardingPage() {
  const router = useRouter();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { user, isUserLoading } = useUser();

  React.useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      router.replace('/login');
      return;
    }
    
    const role = localStorage.getItem("userRole");
    const status = localStorage.getItem("onboardingStatus");

    if (status !== 'pending') {
      router.replace('/dashboard');
    } else if (role) {
      setUserRole(role);
      setLoading(false);
    } else {
      // If role is missing, something is wrong, go back to login.
      router.replace('/login');
    }
  }, [router, user, isUserLoading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingStatus", "completed");
    router.push("/dashboard");
  };

  if (loading || isUserLoading) {
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

  if (userRole === "student") {
    return <StudentOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (userRole === "teacher") {
    return <TeacherOnboarding onComplete={handleOnboardingComplete} />;
  }

  return null;
}
