import React from "react";
import { Task, TaskStatus } from "@/types";
import { Person } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getCategoryConfig } from "@/lib/utils";
import { UpdateTaskInput } from "@/actions/tasks/updateTask";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useTaskEditing } from "@/hooks/useTaskEditing";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { TaskModal } from "../modals/TaskModal";
import EditableTitle from "../sections/EditableTitle";
import StatusDropdown from "../sections/StatusDropdown";
import AssignedPeopleBadge from "../sections/AssignedPeopleBadge";
import  TiptapEditor  from "../sections/TiptapEditor";


interface TaskDetailPaneProps {
  task: Task;
  onTaskUpdate: (data: UpdateTaskInput) => void;
  onBack?: () => void;
  people: Person[];
}



const TaskDetailPane: React.FC<TaskDetailPaneProps> = ({
  task,
  onTaskUpdate,
  onBack,
  people,
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
  const deleteTaskMutation = useDeleteTask(task.workflowId);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      status: newStatus,
      workflowId: task.workflowId,
    });
  };

  const handleDeleteTask = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTaskMutation.mutate({
        id: task.id,
        workflowId: task.workflowId,
      });
      // Navigate back after deletion
      if (onBack) {
        onBack();
      }
    }
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
  const assignedPeople = task.assignedPeople?.map((ap) => ap.person) || [];

  return (
    <div
      className={cn(
        "w-full mx-auto flex flex-col gap-6 h-full",
        "transition-all duration-150"
      )}
    >
      {/* Header with back button and edit/delete buttons */}
      <div className="flex items-center justify-between w-full">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <TaskModal
            workflowId={task.workflowId}
            task={task}
            people={people}
          >
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </TaskModal>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteTask}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

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
