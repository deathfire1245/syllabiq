"use client";
import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNav } from "./_components/sidebar-nav";
import { Header } from "./_components/header";
import { BottomNav } from "./_components/bottom-nav";
import { SearchProvider } from "@/contexts/SearchContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        router.replace("/get-started"); // redirect to login/signup if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Show loading state until auth is determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <SearchProvider>
      <div className="min-h-screen bg-secondary/30 text-foreground">
        {!isMobile && <SidebarNav />}

        <main
          className={`transition-all duration-300 ease-in-out ${
            isMobile ? "pl-0 pb-16" : "pl-64"
          }`}
        >
          <Header />
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
        
        {isMobile && <BottomNav />}
      </div>
    </SearchProvider>
  );
}
