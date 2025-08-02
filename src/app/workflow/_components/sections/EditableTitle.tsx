import React, { useRef, useEffect } from "react";

interface EditableTitleProps {
  title: string;
  editing: boolean;
  onChange: (value: string) => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  placeholder?: string;
  maxLength?: number;
}

const EditableTitle: React.FC<EditableTitleProps> = ({
  title,
  editing,
  onChange,
  onStartEdit,
  onCancel,
  onSave,
  placeholder = "Task title...",
  maxLength = 120,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSave();
    else if (e.key === "Escape") onCancel();
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="text-3xl font-bold leading-tight tracking-tight break-words w-full bg-transparent outline-none border border-transparent focus:border-primary rounded-md p-0 transition-all"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    );
  }

  return (
    <span
      className="text-3xl font-bold leading-tight tracking-tight break-words cursor-text w-full"
      tabIndex={0}
      onClick={onStartEdit}
      onFocus={onStartEdit}
      role="textbox"
      aria-label="Task title"
    >
      {title || (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </span>
  );
};

export default EditableTitle; 