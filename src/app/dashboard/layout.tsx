
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Home,
  Menu,
  Search,
  User,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/ai-chat", icon: MessageCircle, label: "AI Chat" },
];

const mobileNavItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/ai-chat", icon: MessageCircle, label: "AI Chat" },
  { href: "/dashboard#bookmarks", icon: Star, label: "Saved" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const items = isMobile ? mobileNavItems : navItems;
  return (
    <nav className={cn("flex flex-col gap-2", isMobile ? "p-4" : "")}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
            (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) &&
              "bg-muted text-primary",
             isMobile ? "text-base" : "text-sm"
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);
  const pathname = usePathname();
  
  React.useEffect(() => {
    setIsMobileSheetOpen(false);
  }, [pathname]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card md:block fixed top-0 left-0 h-full w-[240px] z-40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Logo size="md" />
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <SidebarNav />
          </div>
        </div>
      </aside>

      <div className="flex flex-col md:pl-[240px]">
         {/* Mobile and Right-side Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-30">
          {/* Mobile Sidebar Trigger */}
           <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-3/4">
               <div className="flex h-16 items-center border-b px-6">
                 <Logo size="md" />
               </div>
               <SidebarNav isMobile={true} />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
             {/* Can be used for breadcrumbs or page titles */}
          </div>

          <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search topics..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-secondary"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/user-avatar/100" alt="@syllabiq-user" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/contact">Support</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/">Logout</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <footer className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-40 flex justify-around items-center">
          {mobileNavItems.map(item => (
             <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center justify-center text-muted-foreground transition-colors w-1/4 pt-1",
              (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "text-primary"
            )}>
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </footer>
         {/* Spacer for bottom nav */}
        <div className="h-16 md:hidden"></div>
      </div>
    </div>
  );
}
