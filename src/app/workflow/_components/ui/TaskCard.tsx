import React from "react";
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { TaskModal } from "../modals/TaskModal";
import AssignedPeopleBadge from "../sections/AssignedPeopleBadge";
import StatusDropdown from "../sections/StatusDropdown";

interface TaskCardProps {
  task: Task;
  workflowId: string;
  people: Person[];
  onEditTask?: (task: Task) => void;
}

function TaskCard({ task, workflowId, people, onEditTask }: TaskCardProps) {
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

  const handleDeleteTask = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate({ id: task.id, workflowId });
    }
  };

  const handleEditTask = () => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const assignedPeople = task.assignedPeople?.map((ap) => ap.person) || [];

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
              <StatusDropdown
                status={task.status}
                onStatusChange={handleStatusChange}
              />

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
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask();
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  </TaskModal>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask();
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
            {assignedPeople.length > 0 ? (
              <div onClick={(e) => e.stopPropagation()}>
                <AssignedPeopleBadge people={assignedPeople} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No one assigned yet.
              </p>
            )}
          </div>
          {task.dueDate && (
            <div className="text-xs text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskCard;
