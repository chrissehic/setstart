import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EditableInlineTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  textClassName?: string;
  minRows?: number;
  maxRows?: number;
  fontSizeClass?: string;
}

const EditableInlineText: React.FC<EditableInlineTextProps> = ({
  value,
  onChange,
  placeholder,
  className,
  textClassName,
  minRows = 1,
  maxRows = 10,
  fontSizeClass = "text-base",
}) => {
  const [editing, setEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  React.useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [editing]);

  // Auto expand textarea height
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [internalValue, editing]);

  const handleSave = () => {
    setEditing(false);
    if (internalValue !== value) {
      onChange(internalValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setInternalValue(value);
      setEditing(false);
    }
  };

  return editing ? (
    <textarea
      ref={textareaRef}
      className={cn(
        "w-full bg-transparent outline-none border border-transparent focus:border-primary rounded-md px-1 py-0.5 transition-all resize-none overflow-hidden",
        fontSizeClass,
        className
      )}
      value={internalValue}
      onChange={e => setInternalValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      rows={minRows}
      style={{ minHeight: 0, maxHeight: `${maxRows * 1.5}em` }}
      placeholder={placeholder}
      spellCheck={true}
    />
  ) : (
    <span
      className={cn(
        "block cursor-text whitespace-pre-line break-words",
        !value && "text-muted-foreground",
        fontSizeClass,
        textClassName
      )}
      tabIndex={0}
      onClick={() => setEditing(true)}
      onFocus={() => setEditing(true)}
      role="textbox"
      aria-label={placeholder}
    >
      {value || placeholder || "Click to edit..."}
    </span>
  );
};

export default EditableInlineText; 