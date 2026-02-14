"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  initialLeftWidth?: number; // Check percentage, e.g. 40 for 40%
}

export function SplitPane({
  left,
  right,
  className,
  initialLeftWidth = 40,
}: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Clamp between 20% and 80%
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={cn("flex h-screen w-full overflow-hidden", className)}
    >
      {/* Left Pane */}
      <div style={{ width: `${leftWidth}%` }} className="h-full overflow-hidden">
        {left}
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className="flex w-2 cursor-col-resize flex-col items-center justify-center bg-border hover:bg-primary/20 transition-colors z-10"
      >
        <div className="h-8 w-1 rounded-full bg-muted-foreground/50" />
      </div>

      {/* Right Pane */}
      <div style={{ width: `${100 - leftWidth}%` }} className="h-full overflow-hidden">
        {right}
      </div>
    </div>
  );
}
