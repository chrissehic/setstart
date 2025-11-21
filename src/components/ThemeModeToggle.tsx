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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton 
          className={`w-full ${isCollapsed ? "justify-center" : ""}`}
          tooltip={isCollapsed ? `${theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"} theme` : undefined}
        >
          <div className={`relative ${isCollapsed ? "h-6 w-6" : "h-4 w-4"}`}>
            <Sun className={`absolute inset-0 rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0 ${
              isCollapsed ? "size-6" : "size-4"
            }`} />
            <Moon className={`absolute inset-0 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 ${
              isCollapsed ? "size-6" : "size-4"
            }`} />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System"} theme
            </span>
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
