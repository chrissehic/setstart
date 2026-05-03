import React, { useState } from "react";
import { Task, TaskStatus } from "@/types";
import { Person } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { cn, getCategoryConfig } from "@/lib/utils";
import { UpdateTaskInput } from "@/actions/tasks/updateTask";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useTaskEditing } from "@/hooks/useTaskEditing";
import { Edit, Trash2, Archive } from "lucide-react";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TaskModal } from "../modals/TaskModal";
import EditableTitle from "../sections/EditableTitle";
import StatusDropdown from "../sections/StatusDropdown";
import AssignedPeopleBadge from "../sections/AssignedPeopleBadge";
import TiptapEditor from "../sections/TiptapEditor";
import { DetailPaneHeader } from "../ui/DetailPaneHeader";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    task.updatedAt ? new Date(task.updatedAt) : null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const updateTaskMutation = useUpdateTask(task.workflowId, false);
  const deleteTaskMutation = useDeleteTask(task.workflowId);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      status: newStatus,
      workflowId: task.workflowId,
    });
  };

  const handleArchiveTask = () => {
    updateTaskMutation.mutate({
      id: task.id,
      status: TaskStatus.ARCHIVED,
      workflowId: task.workflowId,
    });
  };

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate({
      id: task.id,
      workflowId: task.workflowId,
    });
    setShowDeleteDialog(false);
    // Navigate back after deletion
    if (onBack) {
      onBack();
    }
  };

  // Save/cancel handlers for title
  const saveTitle = () => {
    stopEditingTitle();
    if (state.title.trim() && state.title !== task.title) {
      onTaskUpdate({
        id: task.id,
        workflowId: task.workflowId,
        title: state.title.trim(),
      });
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

  // Safely extract assigned people, handling both array and undefined cases (same as TaskCard)
  const assignedPeople = Array.isArray(task.assignedPeople)
    ? task.assignedPeople
        .map((ap) => ap?.person)
        .filter((person): person is NonNullable<typeof person> => !!person)
    : [];

  return (
    <div
      className={cn(
        "w-full mx-auto flex flex-col gap-6 h-full",
        "transition-all duration-150"
      )}
    >
      {/* Header with back button, save status, and edit/delete buttons */}
      <DetailPaneHeader
        onBack={onBack}
        saving={saving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
        menuContent={
          <>
            <TaskModal workflowId={task.workflowId} task={task} people={people}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </TaskModal>
            {task.status === TaskStatus.COMPLETED && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleArchiveTask();
                }}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
      <div className="flex flex-col gap-2 h-full flex-1 min-h-0">
        <TiptapEditor
          content={state.description}
          onUpdate={setDescription}
          isEditing={state.editingDescription}
          onStartEdit={startEditingDescription}
          onSave={saveDescription}
          onSaveStateChange={(savingState, savedState, lastSavedState, hasUnsavedChangesState) => {
            setSaving(savingState);
            if (lastSavedState) {
              setLastSaved(lastSavedState);
            }
            setHasUnsavedChanges(hasUnsavedChangesState);
          }}
        />
      </div>
    </div>
  );
};

export default TaskDetailPane;
