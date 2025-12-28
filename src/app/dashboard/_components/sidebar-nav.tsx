"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookMarked, Home, Compass, CalendarClock, PlusCircle, User, Video, GraduationCap, Briefcase, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


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
  { type: 'collapsible', 
    label: "Browse", 
    icon: Compass, 
    subItems: [
        { href: "/dashboard/courses", icon: GraduationCap, label: "Courses" },
        { href: "/dashboard/tutors", icon: Briefcase, label: "Tutors" },
    ]
  },
  { href: "/dashboard/bookings", icon: Video, label: "My Bookings" },
  { href: "/dashboard/bookmarks", icon: BookMarked, label: "Bookmarks" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (user && firestore) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const role = userDoc.data()?.role;
          setUserRole(role);
          localStorage.setItem("userRole", role); // Keep localStorage for non-critical UI
        }
      } else {
         const localRole = localStorage.getItem("userRole");
         if(localRole) setUserRole(localRole);
      }
    };

    if (!isUserLoading) {
      fetchUserRole();
    }
  }, [user, isUserLoading, firestore]);

  const navItems = userRole === "teacher" ? teacherNavItems : studentNavItems;

  const navClass = isMobile ? "flex flex-col gap-2 p-4" : "fixed top-0 left-0 h-full w-64 bg-card border-r z-50 hidden md:flex md:flex-col";

  return (
    <nav className={cn(navClass, "bg-sidebar text-sidebar-foreground")}>
      {!isMobile && (
        <div className="flex items-center h-16 border-b px-6 border-sidebar-border">
          <Logo className="text-sidebar-foreground" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 p-4">
          {navItems.map((item, index) => {
            if (item.type === 'collapsible') {
                const isAnySubItemActive = item.subItems.some(subItem => pathname.startsWith(subItem.href));
                return (
                    <Collapsible key={index} defaultOpen={isAnySubItemActive}>
                        <CollapsibleTrigger className="w-full">
                           <div className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                isAnySubItemActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
                            )}>
                                <item.icon className="h-5 w-5" />
                                {item.label}
                                <ChevronDown className="ml-auto h-4 w-4 transition-transform data-[state=open]:rotate-180"/>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 pt-2 space-y-1">
                            {item.subItems.map(subItem => {
                                 const isActive = pathname.startsWith(subItem.href);
                                 return (
                                     <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                        isActive && "text-sidebar-foreground font-medium"
                                        )}
                                    >
                                        <subItem.icon className="h-5 w-5" />
                                        {subItem.label}
                                    </Link>
                                 )
                            })}
                        </CollapsibleContent>
                    </Collapsible>
                )
            }
            const isActive = pathname.startsWith(item.href!) && (item.href !== '/dashboard' || pathname === '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}