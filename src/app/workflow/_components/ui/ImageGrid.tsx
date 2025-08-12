"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
}

export function ImageGrid({ 
  children, 
  className, 
  cols = 3, 
  gap = "md" 
}: ImageGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const gridGaps = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  };

  return (
    <div className={cn(
      "grid",
      gridCols[cols],
      gridGaps[gap],
      "overflow-auto",
      className
    )}>
      {children}
    </div>
  );
}

interface ImageGridItemProps {
  children: ReactNode;
  className?: string;
  label?: string;
  labelClassName?: string;
}

export function ImageGridItem({ 
  children, 
  className, 
  label, 
  labelClassName 
}: ImageGridItemProps) {
  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      {children}
      {label && (
        <span className={cn("text-sm text-muted-foreground", labelClassName)}>
          {label}
        </span>
      )}
    </div>
  );
}
