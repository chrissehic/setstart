"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { DeleteWorkflow } from "@/actions/workflows/deleteWorkflow";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  children?: React.ReactNode;
  workflowName: string;
  workflowId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteWorkflowAlert({ children, workflowName, workflowId, open, onOpenChange }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: DeleteWorkflow,
    onSuccess: (data) => {
      toast.success("Project deleted successfully", { id: workflowId });
      setConfirmText("");
      onOpenChange(false);
      
      // Handle redirect based on remaining workflows
      if (data.hasRemainingWorkflows && data.nextWorkflowId) {
        // Redirect to the next available workflow
        router.push(`/project/${data.nextWorkflowId}`);
        toast.success(`Redirected to "${data.remainingWorkflows[0].name}"`);
      } else {
        // No workflows left, redirect to onboarding
        router.push("/");
        toast.success("No projects remaining. Create your first workspace!");
      }
    },
    onError: () => {
      toast.error("Something went wrong", { id: workflowId });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger
      asChild
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-fit"
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            project and associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid w-full items-center gap-3">
          <Label>
            If you are sure, write &quot;{workflowName}&quot; in the input
            below:
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              toast.loading("Deleting project...", { id: workflowId });
              deleteMutation.mutate(workflowId);
            }}
            disabled={confirmText !== workflowName || deleteMutation.isPending}
            className={buttonVariants({ variant: "destructive" })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteWorkflowAlert;
