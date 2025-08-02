"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { addPersonSchema } from "../../../../../schema/person";
import { AddPersonToWorkflow } from "@/actions/people/addPersonToWorkflow";
import { UpdateWorkflowRole } from "@/actions/people/updateWorkflowRole";
import { DeleteWorkflowRole } from "@/actions/people/deleteWorkflowRole";
import type { Person } from "@/generated/prisma";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
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

type AddPersonSchemaType = z.infer<typeof addPersonSchema>;

interface AddRoleModalProps {
  children: React.ReactNode;
  workflowId: string;
  person?: Person & { role: string };
  readOnly?: boolean;
}

export function AddRoleModal({
  children,
  workflowId,
  person,
  readOnly = false,
}: AddRoleModalProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const isEditing = !!person;
  const dialogTitle = isEditing ? "Edit Role" : "Add a new role";

  const Trigger = (
    <span className="text-start cursor-pointer" aria-disabled={readOnly}>
      {children}
    </span>
  );

  const FormWrapper = (
    <AddRoleForm
      onClose={() => setOpen(false)}
      workflowId={workflowId}
      person={person}
      className="px-4"
      
    />
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger disabled={readOnly}>{Trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{dialogTitle}</DrawerTitle>
        </DrawerHeader>
        {FormWrapper}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger disabled={readOnly}>{Trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {FormWrapper}
      </DialogContent>
    </Dialog>
  );
}

interface AddRoleFormProps {
  className?: string;
  onClose: () => void;
  workflowId: string;
  person?: Person & { role: string };
}

function AddRoleForm({
  className,
  onClose,
  workflowId,
  person,
}: AddRoleFormProps) {
  const isEditing = !!person;

  const form = useForm<AddPersonSchemaType>({
    resolver: zodResolver(addPersonSchema),
    defaultValues: {
      name: person?.name ?? "",
      role: person?.role ?? "",
    },
  });

  const addMutation = useMutation({
    mutationFn: AddPersonToWorkflow,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Role added successfully");
        onClose();
      } else {
        toast.error(result.error);
      }
    },
    onError: () => toast.error("Failed to add role. Please try again."),
  });

  const updateMutation = useMutation({
    mutationFn: UpdateWorkflowRole,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Role updated successfully");
        onClose();
      } else {
        toast.error(result.error);
      }
    },
    onError: () => toast.error("Failed to update role. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: DeleteWorkflowRole,
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Role deleted successfully");
        onClose();
      } else {
        toast.error(result.error);
      }
    },
    onError: () => toast.error("Failed to delete role. Please try again."),
  });

  const onSubmit = (values: AddPersonSchemaType) => {
    if (isEditing && person) {
      updateMutation.mutate({ ...values, workflowId, personId: person.id });
    } else {
      addMutation.mutate({ ...values, workflowId });
    }
  };

  const handleDelete = () => {
    if (person) {
      deleteMutation.mutate({ workflowId, personId: person.id });
    }
  };

  const isPending =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;



  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-6", className)}
        aria-busy={isPending}
      >
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Doe"
                    {...field}
                    disabled={isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="Project Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          {isEditing ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove
                    this person&apos;s role from the project.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: "destructive" })}
                    onClick={handleDelete}
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <span /> // for spacing
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Role"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
