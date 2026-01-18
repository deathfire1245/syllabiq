"use client";

import * as React from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Video } from "lucide-react";

export default function MyBookingsPage() {
  return (
    <ScrollReveal className="flex flex-col items-center justify-center h-[60vh] text-center">
      <Video className="w-16 h-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold">Coming Soon</h2>
      <p className="text-muted-foreground mt-2">
        This feature will be available in a future update.
      </p>
    </ScrollReveal>
  );
}
