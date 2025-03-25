"use client";

import { cn } from "@/lib/utils";

export default function LoadingScreen({ 
  message = "Loading...", 
  className,
  fullScreen = true 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center bg-background",
      fullScreen ? "fixed inset-0 z-50" : "absolute inset-0",
      className
    )}>
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse" />
        
        {/* Spinning ring */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      
      {message && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
} 