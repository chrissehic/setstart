"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GitPullRequestCreate, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  createWorkflowSchema,
  createWorkflowSchemaType,
} from "../../../../../schema/workflow";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CreateWorkflow } from "@/actions/workflows/createWorkflow";
import { toast } from "sonner";
import { useCallback } from "react";

export function CreateWorkflowModal({
  triggerLabel,
}: {
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const dialogTitle = "Create a new workflow";

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default">
          <GitPullRequestCreate />
          {triggerLabel ?? "New project"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
        </DrawerHeader>
        <WorkflowForm className="px-4" onClose={() => setOpen(false)} />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <GitPullRequestCreate />
          {triggerLabel ?? "New project"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <WorkflowForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function WorkflowForm({
  className,
  onClose,
}: {
  className?: string;
  onClose: () => void;
}) {
  // Initialize the form with validation
  const form = useForm<createWorkflowSchemaType>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: { name: "" },
  });

  // Mutation hook for creating a workflow
  const { mutate, isPending } = useMutation({
    mutationFn: CreateWorkflow,
    onSuccess: () => {
      toast.success("Project created successfully", { id: "create-workflow" });
      onClose(); // Close the modal on success
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      if (error.message.includes("already exists")) {
        console.log(error);
        toast.error("A workflow with this name already exists.", {
          id: "create-workflow",
        });
      } else {
        console.log(error);
        toast.error("Failed to create project. Please try again.", {
          id: "create-workflow",
        });
      }
    },
  });

  // Submit handler
  const onSubmit = useCallback(
    (values: createWorkflowSchemaType) => {
      toast.loading("Creating workflow...", { id: "create-workflow" });
      mutate(values);
    },
    [mutate]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid items-start gap-6", className)}
        aria-busy={isPending}
      >
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project title</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Industries" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} aria-disabled={isPending}>
          {!isPending ? "Submit" : <Loader2 className="animate-spin" />}
        </Button>
      </form>
    </Form>
  );
}
