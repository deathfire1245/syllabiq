"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarNav } from "./sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/Logo";
import { UserNav } from "./user-nav";
import { usePathname } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import * as React from "react";

export function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { searchTerm, setSearchTerm } = useSearch();

  const showSearch = React.useMemo(() => {
    return pathname.startsWith('/dashboard/subjects') || pathname.startsWith('/dashboard/courses');
  }, [pathname]);


  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="flex h-full max-h-screen flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <Logo />
              </div>
              <div className="flex-1 overflow-y-auto">
                 <SidebarNav isMobile={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <UserNav />
      </div>
    </header>
  );
}
