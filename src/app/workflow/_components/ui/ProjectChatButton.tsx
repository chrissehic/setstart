"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import AIInput from "@/components/AIInput";
import SetIcon from "@/components/SetIcon";
import { Button } from "@/components/ui/button";

interface ProjectChatButtonProps {
  onSubmit?: (message: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export default function ProjectChatButton({
  onSubmit,
  placeholder = "Ask about your project...",
  className,
  label = "Interact with your project",
}: ProjectChatButtonProps) {
  const [state, setState] = useState<"closed" | "hover" | "open" | "closing">(
    "closed"
  );
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle button click to open input
  const handleOpen = () => {
    setState("open");
    // Focus input after state change
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  // Handle close
  const handleClose = () => {
    setState("closing");
    setMessage("");

    setTimeout(() => {
      setState("closed");
      buttonRef.current?.focus();
    }, 500);
  };

  // Handle submit
  const handleSubmit = () => {
    if (message.trim() && onSubmit) {
      onSubmit(message.trim());
      setMessage("");
      setState("closed");
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state === "open") {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  return (
    <div
      className={cn(
        "fixed w-full max-w-2xl flex justify-center items-center bottom-6 left-1/2 transform -translate-x-1/2 z-50",
        className
      )}
      data-state={state}
    >
      <div
        className={cn(
          "absolute inset-0  transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center",
          state === "open"
            ? "-translate-y-4 opacity-100"
            : state === "closing"
            ? "translate-y-8 opacity-0"
            : "translate-y-8 opacity-0 pointer-events-none"
        )}
      >
        <div className="relative flex flex-row w-2xl bg-primary/30 items-center backdrop-blur-xl text-foreground rounded-full shadow-lg border-[1.5px] border-primary/80 overflow-hidden">
          <div className="px-4">
            <SetIcon
              className="size-12 text-primary fill-primary dark:brightness-200 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              animated={true}
            />
          </div>

          <AIInput
            autoFocus={state === "open" ? true : false}
            value={message}
            onChange={setMessage}
            onSubmit={handleSubmit}
            placeholder={placeholder}
            showButton={false}
            submitOnEnter={true}
            rows={1}
            maxLength={500}
            className="text-base !border-0 !bg-transparent shadow-none px-0 !h-fit"
            containerClassName="!border-0 !bg-transparent shadow-none before:border-0 !rounded-full"
            outerContainerClassName="!border-0 !bg-transparent shadow-none !rounded-full"
          />

          <Button
            onClick={handleClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full hover:bg-muted transition-all duration-200"
            aria-label="Close chat"
            variant="secondary"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          state === "open"
            ? "translate-y-8 opacity-0 pointer-events-none"
            : state === "closing"
            ? "translate-y-0 opacity-100"
            : "translate-y-0 opacity-100"
        )}
      >
        <Button
          variant="secondary"
          ref={buttonRef}
          onClick={handleOpen}
          onMouseEnter={() =>
            state !== "closing" && state !== "open" && setState("hover")
          }
          onMouseLeave={() =>
            state !== "closing" && state !== "open" && setState("closed")
          }
          onFocus={() =>
            state !== "closing" && state !== "open" && setState("hover")
          }
          onBlur={() =>
            state !== "closing" && state !== "open" && setState("closed")
          }
          className={cn(
            "relative inline-flex items-center gap-0 rounded-full overflow-hidden select-none",
            "h-18 p-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "border-[1.5px] border-primary/50 bg-primary/20 text-primary-foreground",
            "shadow-lg shadow-primary/50 hover:shadow-none",
            "backdrop-blur-2xl hover:bg-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            // Force closed state styling when returning from closing
            state === "closing"
              ? "max-w-18 justify-center"
              : state === "closed"
              ? "max-w-18 justify-center"
              : "max-w-2xl pr-6 gap-2"
          )}
        >
          <div className="w-18 h-18 grid place-items-center flex-shrink-0">
            <SetIcon
              className="size-12 text-primary dark:brightness-200 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              animated={true}
            />
          </div>
          <div
            className={cn(
              "min-w-0 whitespace-nowrap transition-opacity duration-200",
              state === "closed" ? "opacity-0" : "opacity-100"
            )}
          >
            <span className="text-base font-normal">{label}</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
