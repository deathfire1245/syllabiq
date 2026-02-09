"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/Logo";

export function AdminHeader() {
  const isMobile = useIsMobile();
  const [currentDateTime, setCurrentDateTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = currentDateTime.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

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
              <SheetTitle>Admin Menu</SheetTitle>
            </SheetHeader>
            <div className="flex h-full max-h-screen flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <Logo />
              </div>
              <div className="flex-1 overflow-y-auto">
                 <AdminSidebar isMobile={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground font-mono">{formattedDateTime}</p>
      </div>
    </header>
  );
}
