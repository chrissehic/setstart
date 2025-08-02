import React from "react";
import { Task, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn, getCategoryConfig } from "@/lib/utils";
import { UpdateTaskInput } from "@/actions/tasks/updateTask";
import { useUpdateTask } from "@/hooks/useTasks";
import { useTaskEditing } from "@/hooks/useTaskEditing";
import EditableTitle from "../sections/EditableTitle";
import StatusDropdown from "../sections/StatusDropdown";
import AssignedPeopleBadge from "../sections/AssignedPeopleBadge";
import  TiptapEditor  from "../sections/TiptapEditor";


interface TaskDetailPaneProps {
  task: Task;
  onTaskUpdate: (data: UpdateTaskInput) => void;
}



const TaskDetailPane: React.FC<TaskDetailPaneProps> = ({
  task,
  onTaskUpdate,
}) => {
  const {
    state,
    startEditingTitle,
    stopEditingTitle,
    setTitle,
    startEditingDescription,
    setDescription,
  } = useTaskEditing(task.title, task.description || "");

  const updateTaskMutation = useUpdateTask(task.workflowId, false);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      status: newStatus,
      workflowId: task.workflowId,
    });
  };

  // Save/cancel handlers for title
  const saveTitle = () => {
    stopEditingTitle();
    if (state.title.trim() && state.title !== task.title) {
      onTaskUpdate({ id: task.id, workflowId: task.workflowId, title: state.title.trim() });
    }
  };

  const cancelTitle = () => {
    setTitle(task.title);
    stopEditingTitle();
  };

  // Save handler for description
  const saveDescription = (description: string) => {
    updateTaskMutation.mutate({
      id: task.id,
      workflowId: task.workflowId,
      description,
    });
  };

  const categoryConfig = getCategoryConfig(task.category);
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
          <EditableTitle
            title={state.title}
            editing={state.editingTitle}
            onChange={setTitle}
            onStartEdit={startEditingTitle}
            onCancel={cancelTitle}
            onSave={saveTitle}
          />
          <StatusDropdown
            status={task.status}
            onStatusChange={handleStatusChange}
          />
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
          <AssignedPeopleBadge people={assignedPeople} />
        </div>
      </div>
      
      {/* Description (Tiptap) */}
      <div className="flex flex-col gap-2 h-full flex-1">
        <TiptapEditor
          content={state.description}
          onUpdate={setDescription}
          isEditing={state.editingDescription}
          onStartEdit={startEditingDescription}
          onSave={saveDescription}
        />
      </div>
    </div>
  );
};

export default TaskDetailPane;
