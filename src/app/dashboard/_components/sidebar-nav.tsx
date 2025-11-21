"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookMarked, Home, Compass, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/subjects", icon: Compass, label: "All Subjects" },
  { href: "/dashboard/timetable", icon: CalendarClock, label: "Timetable" },
  { href: "/dashboard/bookmarks", icon: BookMarked, label: "Bookmarks" },
];

export function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

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
    </nav>
  );
}
