"use client";
import * as React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
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

  React.useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem("isAdminAuthenticated");
    
    if (isUserLoading) {
      return; // Wait until user auth state is resolved
    }

    if (isAdminAuthenticated !== "true" || !user) {
      router.replace("/locked");
      return;
    }

    const verifyAdminRole = async () => {
        if (user && firestore) {
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists() || userDoc.data().role !== 'admin') {
                router.replace('/locked');
            }
        }
    };
    verifyAdminRole();

  }, [router, user, isUserLoading, firestore]);
  
  if (isUserLoading) {
      return (
          <div className="p-8">
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-8 mt-8">
                <Skeleton className="w-64 h-screen hidden md:block" />
                <Skeleton className="flex-1 h-screen" />
              </div>
          </div>
      )
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
