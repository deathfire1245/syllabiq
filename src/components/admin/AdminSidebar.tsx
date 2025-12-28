"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Shield, Ticket, CreditCard, Video, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", icon: Ticket, label: "Tickets" },
  { href: "/admin/payments", icon: CreditCard, label: "Payments" },
  { href: "/admin/sessions", icon: Video, label: "Sessions" },
];

export function AdminSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("isAdminAuthenticated");
    router.replace("/");
  };
  
  const navClass = isMobile ? "flex flex-col gap-2 p-4" : "fixed top-0 left-0 h-full w-64 bg-card border-r z-50 hidden md:flex md:flex-col";

  return (
    <nav className={cn(navClass, "flex flex-col")}>
      <div className="flex items-center h-16 border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Admin Portal</span>
          </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary",
                  isActive && "bg-primary/10 text-primary font-medium"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-auto p-4 border-t">
         <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
