
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "framer-motion";

export const ProgressCard = ({
  title,
  value,
  footer,
  icon,
}: {
  title: string;
  value: number;
  footer: string;
  icon: React.ElementType;
}) => {
  const Icon = icon;
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      // Animate progress
      const timer = setTimeout(() => {
        setProgress(value);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInView, value]);

  return (
    <Card ref={ref}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}%</div>
        <p className="text-xs text-muted-foreground mt-1">{footer}</p>
        {isInView ? (
          <Progress value={progress} className="mt-2 h-2" />
        ) : (
          <Skeleton className="h-2 w-full mt-2" />
        )}
      </CardContent>
    </Card>
  );
};
