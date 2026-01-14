"use client";
import * as React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Memoize the document reference to prevent re-renders
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  // Use the useDoc hook for real-time role checking
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  React.useEffect(() => {
    if (isUserLoading || isProfileLoading) {
      return; // Wait until we have both user auth state and profile data
    }

    if (!user || !profile || profile.role !== 'admin') {
      // If user is not logged in, has no profile, or is not an admin, redirect.
      router.replace("/locked");
    }
  }, [user, profile, isUserLoading, isProfileLoading, router]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-8 mt-8">
          <Skeleton className="w-64 h-screen hidden md:block" />
          <Skeleton className="flex-1 h-screen" />
        </div>
      </div>
    );
  }
  
  if (!profile || profile.role !== 'admin') {
      // Render nothing while redirecting
      return null;
  }

  return (
    <div className="min-h-screen bg-secondary/50">
      <AdminSidebar isMobile={isMobile} />
      <main className={`transition-all duration-300 ease-in-out ${isMobile ? 'pl-0' : 'pl-64'}`}>
        <AdminHeader />
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
