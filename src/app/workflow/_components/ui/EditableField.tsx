"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";

interface EditableFieldProps {
  workflowId: string;
  field: string; // e.g., "tagline", "name", "description"
  value?: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

const buttonStyles = "h-6 no-underline text-muted-foreground hover:text-foreground transition-colors duration-200 px-1";

export default function EditableField({
  workflowId,
  field,
  value: initialValue = "",
  placeholder = "Enter value",
  label,
  className,
}: EditableFieldProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(initialValue === "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: updateWorkflow, isPending } = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => toast.success(`${label || field} updated`),
    onError: (err) => {
      console.error(err);
      toast.error(`Failed to update ${label || field}`);
      setValue(initialValue); // revert
    },
  });

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
    const trimmed = value.trim();
    updateWorkflow({ id: workflowId, [field]: trimmed });
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) {
      adjustHeight();
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const Content = isEditing ? (
    <textarea
      ref={textareaRef}
      placeholder={placeholder}
      className="outline-none bg-transparent text-inherit font-inherit resize-none min-w-0 break-words border-b-2 border-input focus:border-primary transition-colors duration-200 overflow-hidden"
      value={value || ""}
      onChange={handleChange}
      rows={1}
    />
  ) : (
    <span className="text-inherit">
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </span>
  );

  return (
    <div className={cn(className, "group/wrapper relative")}>
      <div className="flex flex-row justify-between items-center gap-3">
        {label && (
          <span className="uppercase text-xs font-semibold text-muted-foreground">
            {label}
          </span>
        )}
        {isEditing ? (
          <div className="flex gap-3">
            <Button
              variant="link"
              size="sm"
              onClick={handleDiscard}
              disabled={isPending}
              className={buttonStyles}
            >
              Discard
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={handleSubmit}
              disabled={
                (value?.trim() === "") || isPending || (value === initialValue)
              }
              className={buttonStyles}
            >
              Submit
            </Button>
          </div>
        ) : (
          <Button
            variant="link"
            className={cn(
              buttonStyles,
              "invisible opacity-0 group-hover/wrapper:visible group-hover/wrapper:opacity-100 transition-all duration-100 ease-in-out"
            )}
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-3" />
            Edit
          </Button>
        )}
      </div>

      {field === "tagline" ? (
        <blockquote>
          <h1
            className={cn(
              isEditing ? "after:align-super" : "after:align-baseline",
              'scroll-m-20 after:content-["”"] after:self-end before:content-["“"] before:float-start inline-block text-[2.5rem] font-light tracking-tight leading-tight font-tobias text-wrap'
            )}
          >
            {Content}
          </h1>
        </blockquote>
      ) : field === "name" ? (
        <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight text-balance">
          {Content}
        </h1>
      ) : (
        Content
      )}
    </div>
  );
}
