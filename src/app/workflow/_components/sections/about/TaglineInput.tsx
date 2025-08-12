"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface TaglineInputProps {
  className?: string;
  data?: {
    tagline?: string;
  };
  onTaglineChange?: (value: string) => void;
}

export default function TaglineInput({
  className = "",
  data = {},
  onTaglineChange,
}: TaglineInputProps) {
  const initialTagline = data.tagline || "";
  const [value, setValue] = useState(initialTagline);
  const [isEditing, setIsEditing] = useState(initialTagline === ""); // start editing if no tagline
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSubmit = () => {
    onTaglineChange?.(value.trim());
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setValue(initialTagline);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) {
      adjustHeight();
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div className={cn(className, "group/wrapper relative")}>
      <div className="flex flex-row justify-between items-center gap-3">
        <span className="uppercase text-xs font-semibold text-muted-foreground">
          Tagline
        </span>

        {isEditing ? (
          <div className="flex gap-3">
            <Button
              variant="link"
              size="sm"
              onClick={handleDiscard}
              className="h-0 no-underline text-muted-foreground hover:text-foreground transition-colors duration-200 px-1"
            >
              Discard
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={handleSubmit}
              disabled={value.trim() === ""}
              className="h-0 no-underline text-muted-foreground hover:text-foreground transition-colors duration-200 px-1"
            >
              Submit
            </Button>
          </div>
        ) : (
          initialTagline && (
            <Button
              variant="link"
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors duration-200",
                "h-0 invisible opacity-0 group-hover/wrapper:visible group-hover/wrapper:opacity-100 no-underline transition-all duration-100 ease-in-out"
              )}
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
          )
        )}
      </div>

      <blockquote className="w-full flex flex-1">
        <h1 className="scroll-m-20 w-full flex-1 text-[2.5rem] font-light tracking-tight leading-tight font-tobias text-wrap">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              placeholder="Your tagline here"
              className="outline-none flex-1 w-full bg-transparent text-inherit font-inherit resize-none min-w-0 break-words border-b-2 border-input focus:border-primary transition-colors duration-200 overflow-hidden"
              value={value}
              onChange={handleChange}
              rows={1}
            />
          ) : (
            <span className="text-inherit">
              {initialTagline || "Your tagline here"}
            </span>
          )}
        </h1>
      </blockquote>
    </div>
  );
}
