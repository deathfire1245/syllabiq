"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookMarked, Home, Compass, PlusCircle, User, Briefcase, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const studentNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/subjects", icon: Compass, label: "Subjects" },
  { href: "/dashboard/tutors", icon: Briefcase, label: "Tutors" },
  { href: "/dashboard/bookings", icon: Video, label: "Bookings" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

const teacherNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/create", icon: PlusCircle, label: "Create" },
  { href: "/dashboard/subjects", icon: Compass, label: "Subjects" },
  { href: "/dashboard/bookmarks", icon: BookMarked, label: "Bookmarks" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState("Student");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole");
      if (storedRole) {
        setUserRole(storedRole);
      }
    }
  }, []);
  
  const navItems = userRole === 'Teacher' ? teacherNavItems : studentNavItems;


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50 md:hidden">
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
