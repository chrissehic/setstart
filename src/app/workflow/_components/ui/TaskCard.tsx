import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Task, Person, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn, getCategoryConfig } from "@/lib/utils";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { MoreHorizontal, Edit, Trash2, Archive } from "lucide-react";
import { TaskModal } from "../modals/TaskModal";
import StatusDropdown from "../sections/StatusDropdown";
import AssignedPeopleBadge from "../sections/AssignedPeopleBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
  task: Task;
  workflowId: string;
  people: Person[];
  onEditTask?: (task: Task) => void;
}

function TaskCard({ task, workflowId, people }: TaskCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const categoryConfig = getCategoryConfig(task.category);
  const deleteTaskMutation = useDeleteTask(workflowId);
  const updateTaskMutation = useUpdateTask(workflowId);

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      status: newStatus,
      workflowId: workflowId,
    });
  };

  const handleArchiveTask = () => {
    updateTaskMutation.mutate({
      id: task.id,
      status: TaskStatus.ARCHIVED,
      workflowId: workflowId,
    });
  };

  const handleDeleteTask = () => {
    deleteTaskMutation.mutate({ id: task.id, workflowId });
    setShowDeleteDialog(false);
  };

  // Safely extract assigned people, handling both array and undefined cases
  const assignedPeople = Array.isArray(task.assignedPeople)
    ? task.assignedPeople
        .map((ap) => ap?.person)
        .filter((person): person is NonNullable<typeof person> => !!person)
    : [];

  return (
    <Card className="relative space-y-2 hover:bg-accent/20 transition-colors duration-100 ease-in-out">
      <CardHeader>
        <CardTitle className="flex flex-col gap-2 items-start">
          <div className="flex flex-row items-center justify-between w-full gap-2">
            <div className="flex flex-row gap-2">
              <Badge className={cn("text-xs", categoryConfig.color)}>
                {task.category}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div onClick={(e) => e.stopPropagation()}>
                <StatusDropdown
                  status={task.status}
                  onStatusChange={handleStatusChange}
                />
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskModal
                      workflowId={workflowId}
                      task={task}
                      people={people}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Task
                      </DropdownMenuItem>
                    </TaskModal>
                    {task.status === TaskStatus.COMPLETED && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            handleArchiveTask();
                          }}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Task
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowDeleteDialog(true);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          {task.title}
        </CardTitle>
        {task.description && (
          <CardDescription className="line-clamp-2">
            <span dangerouslySetInnerHTML={{ __html: task.description }} />
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col justify-center gap-1">
            <div onClick={(e) => e.stopPropagation()}>
              <AssignedPeopleBadge
                people={assignedPeople}
                variant="badge"
                maxDisplay={3}
              />
            </div>
          </div>
          {task.dueDate && (
            <div className="text-xs text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={() => {
          // Prevent closing on overlay click - only allow button clicks
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteTask();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default TaskCard;
