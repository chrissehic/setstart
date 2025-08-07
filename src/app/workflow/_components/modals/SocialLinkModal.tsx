"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Link as LinkIcon, CheckCircle2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddSocialLink } from "@/actions/workflows/addSocialLink";
import { UpdateSocialLink } from "@/actions/workflows/updateSocialLink";
import { toast } from "sonner";
import { detectPlatformFromUrl } from "@/lib/helpers/socialPlatformUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const socialLinkSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  name: z.string().optional(),
  handle: z.string().optional(),
  icon: z.string().optional(),
});

type SocialLinkSchemaType = z.infer<typeof socialLinkSchema>;

interface SocialLinkModalProps {
  workflowId: string;
  socialLink?: {
    id: string;
    name: string;
    url: string;
    handle?: string;
    icon?: string;
  };
  children?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SocialLinkModal({
  workflowId,
  socialLink,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: SocialLinkModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<{
    name: string;
    icon: string;
    handle?: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const isEditing = !!socialLink;

  const form = useForm<SocialLinkSchemaType>({
    resolver: zodResolver(socialLinkSchema),
    defaultValues: {
      url: "",
      name: "",
      handle: "",
      icon: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: ({
      workflowId,
      data,
    }: {
      workflowId: string;
      data: SocialLinkSchemaType;
    }) => AddSocialLink(workflowId, data),
    onSuccess: () => {
      toast.success("Social link added successfully");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add social link"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SocialLinkSchemaType }) =>
      UpdateSocialLink(id, data),
    onSuccess: () => {
      toast.success("Social link updated successfully");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update social link"
      );
    },
  });

  const isLoading = addMutation.isPending || updateMutation.isPending;

  // Auto-detect platform when URL changes
  const handleUrlChange = (url: string) => {
    if (url) {
      const platform = detectPlatformFromUrl(url);
      setDetectedPlatform(platform);

      if (platform) {
        form.setValue("name", platform.name);
        form.setValue("icon", platform.icon);
        if (platform.handle) {
          form.setValue("handle", platform.handle);
        }
      }
    } else {
      setDetectedPlatform(null);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (socialLink) {
        form.reset({
          url: socialLink.url,
          name: socialLink.name,
          handle: socialLink.handle || "",
          icon: socialLink.icon || "",
        });
        const platform = detectPlatformFromUrl(socialLink.url);
        setDetectedPlatform(platform);
      } else {
        form.reset({
          url: "",
          name: "",
          handle: "",
          icon: "",
        });
        setDetectedPlatform(null);
      }
    }
  }, [open, socialLink, form]);

  const onSubmit = (values: SocialLinkSchemaType) => {
    const finalData = {
      ...values,
      name: values.name || detectedPlatform?.name || "Website",
      icon: values.icon || detectedPlatform?.icon || "globe",
      handle: values.handle || detectedPlatform?.handle || undefined,
    };

    if (isEditing && socialLink) {
      updateMutation.mutate({ id: socialLink.id, data: finalData });
    } else {
      addMutation.mutate({ workflowId, data: finalData });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Social Link" : "Add Social Link"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your social link URL below."
              : "Paste a social media URL and we'll automatically detect the platform."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        className="pl-10"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleUrlChange(e.target.value);
                        }}
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {detectedPlatform && (
              <Alert className="border-blue-400 bg-blue-500/10">
                <CheckCircle2Icon className="size-4 text-blue-500" />
                <AlertTitle>Detected: {detectedPlatform.name}</AlertTitle>
                <AlertDescription>
                  {detectedPlatform.handle && `${detectedPlatform.handle}`}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
