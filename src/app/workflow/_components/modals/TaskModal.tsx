"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAddTask, useUpdateTask } from "@/hooks/useTasks";
import {
  Task,
  Person,
  TaskStatus,
  TaskPriority,
  Responsibility,
} from "@/types/workflow";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { categories, cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface TaskModalProps {
  workflowId: string;
  task?: Task; // If provided, we're editing
  people: Person[];
  children?: React.ReactNode;
  objectiveId?: string; // If provided, task will be assigned to this objective
  onSuccess?: () => void;
  // Controlled state props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskModal({
  workflowId,
  task,
  people,
  children,
  objectiveId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: TaskModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.NOT_STARTED);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [responsibility, setResponsibility] = useState<Responsibility>(
    Responsibility.IN_HOUSE
  );
  const [dueDate, setDueDate] = useState("");
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  const addTask = useAddTask(workflowId);
  const updateTask = useUpdateTask(workflowId);

  const isEditing = !!task;
  const isLoading = addTask.isPending || updateTask.isPending;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (task) {
        // Editing mode - populate form
        setTitle(task.title);
        setDescription(task.description || "");
        setCategory(task.category || "");
        setStatus(task.status);
        setPriority(task.priority || TaskPriority.MEDIUM);
        setResponsibility(task.responsibility || Responsibility.IN_HOUSE);
        setDueDate(
          task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
        );
        
        // Extract assigned people IDs safely
        const assignedPeopleIds = Array.isArray(task.assignedPeople)
          ? task.assignedPeople
              .map((ap) => ap?.person?.id)
              .filter((id): id is string => !!id)
          : [];
        
        setSelectedPeople(assignedPeopleIds);
      } else {
        // Creating mode - clear form
        setTitle("");
        setDescription("");
        setCategory("");
        setStatus(TaskStatus.NOT_STARTED);
        setPriority(TaskPriority.MEDIUM);
        setResponsibility(Responsibility.IN_HOUSE);
        setDueDate("");
        setSelectedPeople([]);
      }
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || "General", // category is required for AddTask
        status,
        priority,
        responsibility,
        dueDate: dueDate || undefined,
        assignedPeople: selectedPeople,
        ...(objectiveId && { objectiveId }), // Include objectiveId if provided
      };

      if (isEditing && task) {
        await updateTask.mutateAsync({
          id: task.id,
          workflowId,
          ...taskData,
        });
        toast.success("Task updated successfully");
      } else {
        await addTask.mutateAsync({
          workflowId,
          ...taskData,
        });
        toast.success("Task created successfully");
      }

      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error(
        isEditing ? "Failed to update task" : "Failed to create task"
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the task details below."
              : "Create a new task with all the necessary details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Design landing page"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>

              <Popover
                open={categoryPopoverOpen}
                onOpenChange={setCategoryPopoverOpen}
                modal={true}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isLoading}
                    className="w-full justify-between"
                  >
                    {category
                      ? categories.find((c) => c.value === category)?.label
                      : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent  className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search category..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((c) => (
                          <CommandItem
                            key={c.value}
                            value={c.value}
                            onSelect={(currentValue) => {
                              setCategory(
                                currentValue === category ? "" : currentValue
                              );
                              setCategoryPopoverOpen(false);
                            }}
                          >
                            {c.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                category === c.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: TaskStatus) => setStatus(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.NOT_STARTED}>
                    Not Started
                  </SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value: TaskPriority) => setPriority(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibility">Responsibility</Label>
              <Select
                value={responsibility}
                onValueChange={(value: Responsibility) =>
                  setResponsibility(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Responsibility.IN_HOUSE}>
                    In House
                  </SelectItem>
                  <SelectItem value={Responsibility.OUTSOURCED}>
                    Outsourced
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
                className="w-full flex flex-col content-normal justify-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned People</Label>
            <MultiSelect
              key={task?.id || "new-task"}
              options={people.map((person) => ({
                label: person.name,
                value: person.id,
              }))}
              onValueChange={setSelectedPeople}
              defaultValue={selectedPeople}
              placeholder="Select people to assign"
              variant="default"
              maxCount={3}
              disabled={isLoading}
              modalPopover={true}
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what needs to be done..."
                rows={4}
                disabled={isLoading}
              />
            </div>
          )}

          <DialogFooter className="flex flex-row justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
