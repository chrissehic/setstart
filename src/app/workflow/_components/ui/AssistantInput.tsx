"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AssistantInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  showIcon?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  maxLength?: number;
}

export const AssistantInput = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask me anything about your project...",
  disabled = false,
  isLoading = false,
  showCloseButton = false,
  onClose,
}: AssistantInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !isLoading) {
        onSubmit(value.trim());
      }
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled && !isLoading) {
      onSubmit(value.trim());
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [value]);

  return (
    <div className="relative z-10 flex flex-row w-full items-center">
      {/* <div className="px-4">
        <SetIcon
          className="size-12 text-primary fill-primary dark:brightness-200 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          animated={true}
        />
      </div> */}

      <div className="px-4 py-3 flex flex-row items-center flex-1">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={true}
          rows={1}
          maxLength={500}
          className={cn(
            "w-full resize-none border-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground",
            "focus:ring-0 focus:outline-none shadow-none",
            "transition-all duration-200"
          )}
          style={{
            minHeight: "24px",
            maxHeight: "120px",
          }}
        />
      </div>

      {showCloseButton && onClose ? (
        <Button
          onClick={onClose}
          className="absolute right-5 top-1/2 bg-primary/40 -translate-y-1/2 size-10 rounded-full hover:bg-muted transition-all duration-200"
          aria-label="Close chat"
          variant="secondary"
        >
          <X className="size-5" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled || isLoading}
          className="absolute right-5 top-1/2 bg-primary/40 -translate-y-1/2 size-10 rounded-full hover:bg-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
          variant="secondary"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
        </Button>
      )}
    </div>
  );
};
