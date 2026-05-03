"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useState } from "react";

interface MultiPurposeInputProps {
  // Input props
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;

  // Button props
  showButton?: boolean;
  buttonIcon?: ReactNode;
  loadingIcon?: ReactNode;
  isLoading?: boolean;
  onSubmit?: () => void;

  // Container props
  containerClassName?: string;

  // Outer container props
  useAbsolutePosition?: boolean;
  outerContainerClassName?: string;

  // Behavior
  submitOnEnter?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;

  // Status message
  statusMessage?: ReactNode;
  showStatusMessage?: boolean;
}

export default function MultiPurposeInput({
  // Input props
  value,
  onChange,
  placeholder = "Type something...",
  rows = 2,
  className,

  // Button props
  showButton = true,
  buttonIcon = <CornerDownLeft className="size-6" />,
  loadingIcon = <Loader2 className="size-6 animate-spin text-secondary" />,
  isLoading = false,
  onSubmit,

  // Container props
  containerClassName,

  // Outer container props
  useAbsolutePosition = false,
  outerContainerClassName,

  // Behavior
  submitOnEnter = true,
  disabled = false,
  autoFocus = false,
  maxLength,

  // Status message
  statusMessage,
  showStatusMessage = false,
}: MultiPurposeInputProps) {
  const [focus, setFocus] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit && value.trim().length > 0 && !disabled && !isLoading) {
        onSubmit();
      }
    }
  };

  const inputComponent = (
    <div className="flex flex-col items-center w-full">
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          // Base styles
          "pointer-events-auto bg-muted flex flex-row items-end w-full p-2 max-w-4xl transition-all duration-300 ease-out",
          "rounded-md",

          // // // Quiet luxury soft background
          // "bg-gradient-to-br from-muted/5 via-muted/5 to-background/10",
          // "dark:bg-gradient-to-br dark:from-muted/5 dark:via-muted/10 dark:to-background/8",

          // Subtle linear-gradient border with primary mauve accent
          "border border-transparent bg-clip-padding",
          // "before:content-[''] before:absolute before:inset-0 before:rounded-3xl before:border before:border-input before:pointer-events-none",


          // Focus: add glow & stronger mauve border
          (focus || value.trim().length > 0) && [
            "border-primary/80 bg-background",
            //   "bg-gradient-to-br from-muted/15 via-muted/10 to-background/8",
            // "dark:bg-gradient-to-br dark:from-muted/20 dark:via-muted/15 dark:to-background/10",
            "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_16px_32px_rgba(0,0,0,0.08)]",
          ],

          //Hover
          !focus &&
            "hover:border hover:border-muted/60 dark:hover:border-primary/40 hover:bg-muted",

          // Disabled
          disabled && "opacity-50 cursor-not-allowed",

          containerClassName
        )}
      >
        <div className="flex flex-row gap-2 items-end w-full">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "w-full p-1 resize-none border-0 text-md shadow-none min-h-[60px] pr-12 bg-transparent",
              "focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground",
              className
            )}
            rows={rows}
            disabled={disabled || isLoading}
            autoFocus={autoFocus}
            maxLength={maxLength}
          />

          {showButton && value.trim().length > 0 && (
            <Button
              type="button"
              variant="default"
              disabled={disabled || isLoading}
              className="size-12 rounded-full shadow font-bold ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onSubmit}
            >
              {isLoading ? loadingIcon : buttonIcon}
            </Button>
          )}
        </div>
      </div>

      {showStatusMessage && statusMessage && (
        <div className="text-center mt-2 text-sm text-muted-foreground">
          {statusMessage}
        </div>
      )}
    </div>
  );

  if (useAbsolutePosition) {
    return (
      <div
        className={cn(
          "sticky w-full p-2 flex justify-center items-center pointer-events-none bottom-0 z-30",
          outerContainerClassName
        )}
      >
        {inputComponent}
      </div>
    );
  }

  return inputComponent;
}
