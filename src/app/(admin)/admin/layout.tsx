"use client";
import * as React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();

  React.useEffect(() => {
    // In a real app, you'd have a more robust auth check here.
    const isAdminAuthenticated = sessionStorage.getItem("isAdminAuthenticated");
    if (isAdminAuthenticated !== "true") {
      router.replace("/locked");
    }
  }, [router]);

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
