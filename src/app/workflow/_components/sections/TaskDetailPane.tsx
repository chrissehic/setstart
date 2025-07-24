import React, { useRef, useState } from "react";
import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getCategoryConfig, getStatusConfig } from "@/lib/utils";
import { getInitials } from "@/lib/helpers/getInitials";

interface TaskDetailPaneProps {
  task: Task;
  onDescriptionSave?: (desc: string) => void;
}

const TaskDetailPane: React.FC<TaskDetailPaneProps> = ({ task, onDescriptionSave }) => {
  const [desc, setDesc] = useState(task.description || "");
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const categoryConfig = getCategoryConfig(task.category);
  const statusConfig = getStatusConfig(task.status);
  const assignedPeople = task.assignedPeople.map(ap => ap.person);

  // Save on blur or Enter
  const handleSave = () => {
    setEditing(false);
    if (onDescriptionSave) onDescriptionSave(desc);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  // Focus textarea when entering edit mode
  React.useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col gap-6",
      "transition-all duration-150"
    )}>
      {/* Hierarchy: Title, Status, Category, Due, Assigned, Description */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold leading-tight break-words">{task.title}</h2>
          <Badge className={cn("text-xs px-2 py-1", statusConfig.color)}>{statusConfig.label}</Badge>
        </div>
        <div className="flex flex-row flex-wrap gap-3 items-center mt-1">
          <Badge className={cn("text-xs px-2 py-1", categoryConfig.color)}>{task.category}</Badge>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">Assigned</span>
        {assignedPeople.length > 0 ? (
          <Badge className="flex py-1 pl-1 pr-4 gap-1 bg-accent items-center space-x-1 rounded-full w-fit">
            <div className="flex -space-x-2 flex-row">
              {assignedPeople.map(person => (
                <Avatar key={person.id} className="w-7 h-7 rounded-full border-2 border-background">
                  {person.avatarImage && <AvatarImage src={person.avatarImage} alt={person.name} />}
                  <AvatarFallback className="bg-input text-accent-foreground border-input border rounded-full">
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs ml-2">
              {assignedPeople.length > 1
                ? assignedPeople.map(p => p.name.split(" ")[0]).join(", ")
                : assignedPeople[0].name}
            </span>
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No one assigned</span>
        )}
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <span className="text-sm font-medium text-muted-foreground mb-1">Description / Involvement</span>
        <div
          className={cn(
            "prose max-w-none text-base flex-1 min-h-[80px] bg-transparent border border-transparent rounded-md px-2 py-1",
            editing && "border-primary bg-background"
          )}
          onClick={() => setEditing(true)}
          tabIndex={0}
          role="textbox"
          style={{ cursor: "text" }}
        >
          {editing ? (
            <textarea
              ref={textareaRef}
              className="w-full min-h-[100px] bg-transparent outline-none resize-vertical text-base"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder="Describe the task and involvement..."
            />
          ) : (
            <span className={cn(!desc && "text-muted-foreground")}>{desc || "Click to add a description..."}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPane; 