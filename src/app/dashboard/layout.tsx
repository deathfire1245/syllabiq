"use client";
import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarNav } from "./_components/sidebar-nav";
import { Header } from "./_components/header";
import { BottomNav } from "./_components/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
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
  );
}
