"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookMarked, Home, Compass, CalendarClock, PlusCircle, User, Video, GraduationCap, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const studentNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/subjects", icon: Compass, label: "All Subjects" },
  { href: "/dashboard/timetable", icon: CalendarClock, label: "Timetable" },
  { href: "/dashboard/courses", icon: GraduationCap, label: "Courses" },
  { href: "/dashboard/tutors", icon: Briefcase, label: "Find a Tutor" },
  { href: "/dashboard/bookings", icon: Video, label: "My Bookings" },
  { href: "/dashboard/bookmarks", icon: BookMarked, label: "Bookmarks" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

const teacherNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/create", icon: PlusCircle, label: "Create" },
  { href: "/dashboard/subjects", icon: Compass, label: "All Subjects" },
  { href: "/dashboard/bookmarks", icon: BookMarked, label: "Bookmarks" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
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

  const navItems = userRole === "Teacher" ? teacherNavItems : studentNavItems;

  const navClass = isMobile ? "flex flex-col gap-2 p-4" : "fixed top-0 left-0 h-full w-64 bg-card border-r z-50 hidden md:flex md:flex-col";

  return (
    <nav className={navClass}>
      {!isMobile && (
        <div className="flex items-center h-16 border-b px-6">
          <Logo />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard');
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
    </nav>
  );
}
