"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ImageSlideshowProps {
  images: string[];
  className?: string;
}

export function ImageSlideshow({ images = [], className }: ImageSlideshowProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const validImages = React.useMemo(() => images.filter(img => !!img), [images]);

  React.useEffect(() => {
    if (validImages.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [validImages.length, isPaused]);

  if (validImages.length === 0) {
    return (
      <div className={cn("w-full aspect-square bg-secondary/30 rounded-xl flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed", className)}>
        <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm">No images available</p>
      </div>
    );
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const setIndex = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  return (
    <div 
      className={cn("relative group overflow-hidden rounded-xl bg-black aspect-square", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={validImages[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </AnimatePresence>

      {validImages.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => setIndex(e, idx)}
                className="p-1"
              >
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === currentIndex ? "bg-white w-6 shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-white/40 w-1.5 hover:bg-white/60"
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
