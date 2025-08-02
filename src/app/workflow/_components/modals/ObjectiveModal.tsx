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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddObjective, useUpdateObjective } from "@/hooks/useObjectives";
import { TaskPriority, Objective } from "@/types/workflow";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ObjectiveModalProps {
  workflowId: string;
  objective?: Objective; // If provided, we're editing
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function ObjectiveModal({
  workflowId,
  objective,
  children,
  onSuccess,
}: ObjectiveModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "NONE">("NONE");

  const addObjective = useAddObjective();
  const updateObjective = useUpdateObjective();

  const isEditing = !!objective;
  const isLoading = addObjective.isPending || updateObjective.isPending;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (objective) {
        // Editing mode - populate form
        setTitle(objective.title);
        setDescription(objective.description || "");
        setPriority(objective.priority || "NONE");
      } else {
        // Creating mode - clear form
        setTitle("");
        setDescription("");
        setPriority("NONE");
      }
    }
  }, [open, objective]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (isEditing && objective) {
        await updateObjective.mutateAsync({
          id: objective.id,
          workflowId,
          title: title.trim(),
          description: description.trim() || null,
          priority: priority === "NONE" ? null : priority,
        });
        toast.success("Objective updated successfully");
      } else {
        await addObjective.mutateAsync({
          workflowId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority: priority === "NONE" ? undefined : priority,
        });
        toast.success("Objective created successfully");
      }

      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error(
        isEditing ? "Failed to update objective" : "Failed to create objective"
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Objective" : "Create New Objective"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the objective details below."
              : "Create a new objective to organize your project tasks."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Launch Kickstarter Campaign"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this objective aims to achieve..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value: TaskPriority | "NONE") => setPriority(value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No priority</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
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
              {isEditing ? "Update Objective" : "Create Objective"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
