"use client";

import { useState, useRef } from "react";

export function useSidebarWidth() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Remove ResizeObserver - manual collapse only
  // The sidebar should only collapse when user manually toggles it

  return { isCollapsed, setIsCollapsed, sidebarRef };
}
