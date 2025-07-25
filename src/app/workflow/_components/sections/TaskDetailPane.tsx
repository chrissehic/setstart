import React, { useReducer, useRef } from "react";
import { Task, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getCategoryConfig, getStatusConfig } from "@/lib/utils";
import { getInitials } from "@/lib/helpers/getInitials";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu } from "@tiptap/react/menus";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { UpdateTaskInput } from "@/actions/tasks/updateTask";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUpdateTask } from "@/hooks/useTasks";
import { useDebouncedCallback } from 'use-debounce';


interface TaskDetailPaneProps {
  task: Task;
  onTaskUpdate: (data: UpdateTaskInput) => void;
}

type EditState = {
  editingTitle: boolean;
  editingDescription: boolean;
  title: string;
  description: string;
};

type EditAction =
  | { type: "editTitle"; editing: boolean }
  | { type: "editDescription"; editing: boolean }
  | { type: "setTitle"; value: string }
  | { type: "setDescription"; value: string }
  | { type: "reset"; title: string; description: string };

function reducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case "editTitle":
      return { ...state, editingTitle: action.editing };
    case "editDescription":
      return { ...state, editingDescription: action.editing };
    case "setTitle":
      return { ...state, title: action.value };
    case "setDescription":
      return { ...state, description: action.value };
    case "reset":
      return {
        editingTitle: false,
        editingDescription: false,
        title: action.title,
        description: action.description,
      };
    default:
      return state;
  }
}

const TaskDetailPane: React.FC<TaskDetailPaneProps> = ({
  task,
  onTaskUpdate,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    editingTitle: false,
    editingDescription: false,
    title: task.title,
    description: task.description || "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Patch: Remove toast for description changes
  const updateTaskMutation = useUpdateTask(task.workflowId, false);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      status: newStatus,
      workflowId: task.workflowId,
    });
  };

  // Tiptap editor for description
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Describe the task and involvement...",
      }),
      // Add slash command extension here if available
    ],
    content: state.description,
    editable: state.editingDescription,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none text-base flex-1 min-h-[100px] h-full bg-transparent outline-none border border-transparent rounded-md px-2 py-1 transition-all resize-none",
        tabIndex: '0',
        style: 'cursor: text; height: 100%;',
      },
      handlePaste() {
        // Retain line breaks, markdown, and links
        // (Tiptap handles most of this by default)
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      dispatch({ type: "setDescription", value: editor.getHTML() });
    },
  });

  // Update Tiptap editable state on edit mode change
  React.useEffect(() => {
    if (editor) editor.setEditable(state.editingDescription);
  }, [state.editingDescription, editor]);

  // Save/cancel handlers for title
  const saveTitle = () => {
    dispatch({ type: "editTitle", editing: false });
    if (state.title.trim() && state.title !== task.title) {
      onTaskUpdate({ id: task.id, workflowId: task.workflowId, title: state.title.trim() });
    }
  };
  const cancelTitle = () => {
    dispatch({ type: "setTitle", value: task.title });
    dispatch({ type: "editTitle", editing: false });
  };

  // Auto-save description on every change (debounced)
  const [descSaving, setDescSaving] = React.useState(false);
  const [descSaved, setDescSaved] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

  const debouncedSave = useDebouncedCallback((desc: string) => {
    updateTaskMutation.mutate(
      { id: task.id, workflowId: task.workflowId, description: desc },
      {
        onSuccess: () => {
          setDescSaving(false);
          setDescSaved(true);
          setLastSaved(new Date());
          setTimeout(() => setDescSaved(false), 1200);
        },
        onError: () => {
          setDescSaving(false);
        },
      }
    );
  }, 600);

  React.useEffect(() => {
    if (state.description === (task.description || "")) return;
    setDescSaving(true);
    debouncedSave(state.description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.description]);

  // Keyboard handlers
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveTitle();
    else if (e.key === "Escape") cancelTitle();
  };

  // Tiptap keyboard shortcuts
  React.useEffect(() => {
    if (!editor) return;
    const handleKeyDown = () => {};
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, state.editingDescription]);

  // Focus input when editing title
  React.useEffect(() => {
    if (state.editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [state.editingTitle]);

  const categoryConfig = getCategoryConfig(task.category);
  const statusConfig = getStatusConfig(task.status);
  const assignedPeople = task.assignedPeople.map((ap) => ap.person);

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto flex flex-col gap-6 h-full",
        "transition-all duration-150"
      )}
    >
      {/* Title and status */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-4">
          {state.editingTitle ? (
            <input
              ref={inputRef}
              className="text-3xl font-bold leading-tight tracking-tight break-words w-full bg-transparent outline-none border border-transparent focus:border-primary rounded-md p-0 transition-all"
              value={state.title}
              onChange={(e) =>
                dispatch({ type: "setTitle", value: e.target.value })
              }
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
              placeholder="Task title..."
              maxLength={120}
            />
          ) : (
            <span
              className="text-3xl font-bold leading-tight tracking-tight break-words cursor-text w-full"
              tabIndex={0}
              onClick={() => dispatch({ type: "editTitle", editing: true })}
              onFocus={() => dispatch({ type: "editTitle", editing: true })}
              role="textbox"
              aria-label="Task title"
            >
              {state.title || (
                <span className="text-muted-foreground">Task title...</span>
              )}
            </span>
          )}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    className={cn("text-xs cursor-pointer", statusConfig.color)}
                  >
                    {statusConfig.label}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[
                    TaskStatus.NOT_STARTED,
                    TaskStatus.IN_PROGRESS,
                    TaskStatus.COMPLETE,
                  ].map((status) => {
                    const config = getStatusConfig(status);
                    return (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusChange(status)}
                      >
                        <span className="text-muted-foreground text-xs">Set as</span> 
                        <Badge className={cn("text-xs", config.color)}>
                          {config.label}
                        </Badge>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
        </div>
        <div className="flex flex-row flex-wrap gap-3 items-center mt-1">
          <Badge className={cn("text-xs px-2 py-1", categoryConfig.color)}>
            {task.category}
          </Badge>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <div>
            {assignedPeople.length > 0 ? (
              <Badge className="flex py-0.5 pl-0.5 pr-3 gap-0.5 bg-accent items-center space-x-1 rounded-full">
                <div className="flex -space-x-1 flex-row">
                  {assignedPeople.map((person) => (
                    <Avatar key={person.id} className="w-6 h-6 rounded-full">
                      <AvatarImage
                        src={person?.avatarImage}
                        alt={person.name}
                      />
                      <AvatarFallback className="bg-input text-accent-foreground border-input border rounded-full">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs">
                  {assignedPeople.length > 1
                    ? assignedPeople
                        .map((person) =>
                          typeof person?.name === "string"
                            ? person.name.split(" ")[0]
                            : null
                        )
                        .filter(Boolean)
                        .join(", ")
                    : assignedPeople
                        .map((person) => person.name)
                        .filter(Boolean)
                        .join(", ")}
                </span>
              </Badge>
            ) : (
              <p className="text-sm text-muted-foreground">
                No one assigned yet.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Description (Tiptap) */}
      <div className="flex flex-col gap-2 h-full flex-1">
        {editor && (
          <>
            {state.editingDescription ? (
              <>
                <EditorContent
                  editor={editor}
                  onClick={() =>
                    dispatch({ type: "editDescription", editing: true })
                  }
                  className="cursor-text h-full"
                />
                {/* BubbleMenu for formatting */}
                <BubbleMenu
                  editor={editor}
                  options={{ placement: "bottom", offset: 8 }}
                >
                  <div className="flex gap-1 bg-card border rounded shadow px-2 py-1">
                    <button
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={cn(
                        "px-1 py-0.5 rounded",
                        editor.isActive("bold")
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                      title="Bold (Cmd+B)"
                    >
                      <b>B</b>
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={cn(
                        "px-1 py-0.5 rounded",
                        editor.isActive("italic")
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                      title="Italic (Cmd+I)"
                    >
                      <i>I</i>
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={cn(
                        "px-1 py-0.5 rounded",
                        editor.isActive("bulletList")
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                      }
                      className={cn(
                        "px-1 py-0.5 rounded",
                        editor.isActive("heading", { level: 2 })
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                      title="Heading"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => editor.chain().focus().toggleLink().run()}
                      className={cn(
                        "px-1 py-0.5 rounded",
                        editor.isActive("link")
                          ? "bg-primary text-primary-foreground"
                          : ""
                      )}
                      title="Link (Cmd+K)"
                    >
                      🔗
                    </button>
                  </div>
                </BubbleMenu>
                {/* Saving indicator */}
                <div className="flex items-center gap-2 mt-1 min-h-[20px]">
                  {descSaving ? (
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="animate-spin inline-block w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full"></span> Saving...</span>
                  ) : descSaved ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">✓ Saved{lastSaved && ` at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}</span>
                  ) : null}
                  {lastSaved && !descSaving && !descSaved && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  )}
                </div>
                {/* FloatingMenu for slash commands (if implemented) */}
                {/* <FloatingMenu editor={editor}> ... </FloatingMenu> */}
              </>
            ) : (
              <div
                className={cn(
                  "prose max-w-none text-base flex-1 min-h-[100px] bg-transparent border border-transparent rounded-md px-2 py-1 cursor-text",
                  !state.description && "text-muted-foreground"
                )}
                tabIndex={0}
                role="textbox"
                aria-label="Task description"
                onClick={() =>
                  dispatch({ type: "editDescription", editing: true })
                }
                onFocus={() =>
                  dispatch({ type: "editDescription", editing: true })
                }
                dangerouslySetInnerHTML={{
                  __html:
                    state.description ||
                    "<span class='text-muted-foreground'>Click to add a description...</span>",
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPane;
