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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getCategoryConfig, getStatusConfig } from "@/lib/utils";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { TaskModal } from "./TaskModal";
import { getInitials } from "@/lib/helpers/getInitials";

interface TaskCardProps {
  task: Task;
  workflowId: string;
  people: Person[];
}

function TaskCard({ task, workflowId, people }: TaskCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const categoryConfig = getCategoryConfig(task.category);
  const statusConfig = getStatusConfig(task.status);

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
    setIsEditModalOpen(true);
  };

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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <TaskModal
                    workflowId={workflowId}
                    task={task}
                    people={people}
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation(); // prevent bubbling if needed
                        handleEditTask(); // then call your edit logic
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  </TaskModal>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteTask}
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
          <CardDescription>
            {task.description ?? "No description provided."}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col justify-center gap-1">
            {task.assignedPeople.length > 0 ? (
              <Badge className="flex py-0.5 pl-0.5 pr-3 gap-0.5 bg-accent items-center space-x-1 rounded-full">
                <div className="flex -space-x-1 flex-row">
                  {task.assignedPeople.map(({ person }) => (
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
                  {task.assignedPeople.length > 1
                    ? task.assignedPeople
                        .map(({ person }) =>
                          typeof person?.name === "string"
                            ? person.name.split(" ")[0]
                            : null
                        )
                        .filter(Boolean)
                        .join(", ")
                    : task.assignedPeople
                        .map(({ person }) => person.name)
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
          {task.dueDate && (
            <div className="text-xs text-muted-foreground">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
      <TaskModal
        workflowId={workflowId}
        task={task}
        people={people}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </Card>
  );
}

export default TaskCard;
