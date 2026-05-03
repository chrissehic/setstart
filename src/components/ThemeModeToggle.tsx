"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModeToggleProps {
  isCollapsed?: boolean;
}

export function ModeToggle({ isCollapsed = false }: ModeToggleProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only render theme text after client-side hydration to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Get theme text safely (only after mount to prevent hydration issues)
  const themeText = mounted
    ? theme === "dark"
      ? "Dark"
      : theme === "light"
      ? "Light"
      : "System"
    : "System"; // Default fallback for SSR

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className={`w-full ${
            isCollapsed ? "flex items-center justify-center" : ""
          }`}
          tooltip={isCollapsed ? `${themeText} theme` as string : undefined}
          data-slot="dropdown-menu-trigger"
        >
          {theme === "light" ? (
            <Sun
              className={`rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0 ${
                isCollapsed ? "size-5" : "size-4"
              }`}
            />
          ) : (
            <Moon
              className={`rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 ${
                isCollapsed ? "size-5" : "size-4"
              }`}
            />
          )}
          {!isCollapsed && (
            <span className="text-sm font-medium">{themeText} theme</span>
          )}
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
