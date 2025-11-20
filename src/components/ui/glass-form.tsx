"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useRef } from "react";
import { ScrollReveal } from "../ScrollReveal";

interface GlassFormProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassForm = React.forwardRef<HTMLDivElement, GlassFormProps>(
  ({ children, className, ...props }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current) return;
      const rect = divRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      divRef.current.style.setProperty("--mouse-x", `${x}px`);
      divRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
      <ScrollReveal yOffset={50}>
        <div
          ref={divRef}
          onMouseMove={handleMouseMove}
          className={cn(
            "relative w-full max-w-sm rounded-2xl bg-white/5 p-8 shadow-2xl backdrop-blur-lg",
            "border border-white/10 transition-all duration-300",
            "before:pointer-events-none before:absolute before:-inset-px before:rounded-[inherit]",
            "before:bg-radial-gradient-spotlight before:opacity-0 before:transition-opacity before:duration-300",
            "hover:before:opacity-100",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ScrollReveal>
    );
  }
);

GlassForm.displayName = "GlassForm";

export const GlassInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full bg-white/10 text-white placeholder-gray-400 border border-white/20 rounded-lg px-4 py-2",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300",
        className
      )}
      {...props}
    />
  );
});

GlassInput.displayName = "GlassInput";
