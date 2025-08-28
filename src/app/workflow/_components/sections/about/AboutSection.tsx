import React, { useState } from "react";
import { cn } from "@/lib/utils";
import TagsList from "../../ui/TagsList";
import { Separator } from "@/components/ui/separator";
import { EditableImage } from "../../ui/EditableImage";
import { Button } from "@/components/ui/button";
import { Info, Plus, X, AsteriskSquare } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditableField from "../../ui/EditableField";
import { classWrapper } from "@/styles/commonStyles";
import { SECTION_CLASS } from "@/lib/constants";
import SocialLinksList from "../../ui/SocialLinksList";
import { useWorkflow } from "@/hooks/useWorkflow";
import { LoadingSpinner } from "@/components/LoadingSpinner";

function AboutSection({ workflowId }: { workflowId: string }) {
  const queryClient = useQueryClient();
  const { data: workflow, isLoading, error } = useWorkflow(workflowId);

  // Parse additional assets from JSON string or use empty array
  const [additionalAssets, setAdditionalAssets] = useState<string[]>(() => {
    if (workflow?.additionalAssets) {
      try {
        return typeof workflow.additionalAssets === "string"
          ? JSON.parse(workflow.additionalAssets)
          : workflow.additionalAssets;
      } catch {
        return [];
      }
    }
    return [];
  });

  const { mutate: updateWorkflow } = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: (updatedWorkflow) => {
      toast.success("Assets updated successfully!");
      // Update the React Query cache with the new data
      queryClient.setQueryData(["workflow", workflowId], updatedWorkflow);
    },
    onError: (error) => {
      toast.error("Failed to update assets.");
      console.error(error);
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn(SECTION_CLASS)}>
        <div className="flex items-center justify-center py-12 w-full h-full">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !workflow) {
    return (
      <div className={cn(SECTION_CLASS)}>
        <div className="flex items-center justify-center py-12 text-center">
          <div className="text-destructive">
            <p>Failed to load workflow data</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(SECTION_CLASS)}>
      {/* Company Core Info - Name, Tagline, Description, Tags */}
      <div className={cn(classWrapper, "py-5")}>
        <EditableField
          workflowId={workflow.id}
          field="name"
          value={workflow.name}
          label="Name"
          placeholder="Your company name here"
        />
        
        <div className="mt-4">
          <EditableField
            workflowId={workflow.id}
            field="tagline"
            value={workflow.tagline || ""}
            label="Tagline"
            placeholder="Your tagline here"
          />
        </div>
        
        <div className="mt-4">
          <EditableField
            workflowId={workflow.id}
            field="description"
            value={workflow.description || ""}
            label="Description"
            placeholder="Your description here"
            className=""
          />
        </div>
        
        <div className="mt-4">
          <span className="uppercase text-xs font-semibold text-muted-foreground">
            Categories
          </span>
          <TagsList tags={workflow.tags} />
        </div>
      </div>

      <Separator className="h-0.5" />
      
      {/* Identity & Assets Section - Combined */}
      <div className={cn(classWrapper, "py-5")}>
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger className="w-fit">
              <span className="w-fit uppercase text-xs font-semibold text-muted-foreground inline-flex justify-center items-center gap-1">
                Identity & Assets
                <Info className="size-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">The company&apos;s visual identity and additional assets</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Simple Add Asset Button */}
          <Button variant="outline" size="sm" onClick={() => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/png, image/jpeg, image/gif, image/webp';
            fileInput.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const formData = new FormData();
                formData.append("file", file);
                
                try {
                  const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                  });
                  
                  const result = await response.json();
                  if (result.success) {
                    const newAssets = [...additionalAssets, result.url];
                    setAdditionalAssets(newAssets);
                    updateWorkflow({
                      id: workflow.id,
                      additionalAssets: JSON.stringify(newAssets),
                    });
                  }
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Failed to upload asset");
                }
              }
            };
            fileInput.click();
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
        
        <div className="flex flex-row justify-start gap-3 overflow-auto items-start mt-3">
          {/* Main Logo */}
          <div className="flex flex-col items-start gap-1">
            <EditableImage
              alt="Main logo"
              workflowId={workflow.id}
              field="mainLogo"
              imageUrl={workflow.mainLogo || undefined}
              className="relative h-40 w-fit bg-accent aspect-video rounded-lg border border-input/60 p-4"
              imageClassName="w-full h-full object-contain!"
              showRemoveButton={true}
            >
              <span className="
                wordmark
                text-5xl font-bold text-transparent bg-clip-text opacity-30
                group-hover/image:opacity-10 transition-opacity duration-150 ease-in-out select-none
              ">
                setstart®
              </span>
            </EditableImage>
            <span className="text-sm text-muted-foreground">Main logo</span>
          </div>

          {/* Logo Icon */}
          <div className="flex flex-col items-start gap-1">
            <EditableImage
              alt="Logo icon"
              workflowId={workflow.id}
              field="logoIcon"
              imageUrl={workflow.logoIcon || undefined}
              className="relative h-40 aspect-square bg-accent rounded-lg border border-input/60 overflow-hidden p-4"
              imageClassName="w-full h-full object-contain"
              showRemoveButton={true}
            >
              <AsteriskSquare
                className="size-30 stroke-1 stroke-foreground opacity-30
                group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none"
              />
            </EditableImage>
            <span className="text-sm text-muted-foreground">Logo icon</span>
          </div>

          {/* Existing Assets */}
          {additionalAssets.map((asset, index) => (
            <div key={index} className="flex flex-col items-start gap-1">
              <div className="relative h-40 aspect-square bg-accent rounded-lg border border-input/60 overflow-hidden">
                <EditableImage
                  workflowId={workflow.id}
                  field="additionalAssets"
                  imageUrl={asset}
                  alt={`Asset ${index + 1}`}
                  className="w-full h-full object-cover"
                  showRemoveButton={true}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newAssets = additionalAssets.filter((_, i) => i !== index);
                    setAdditionalAssets(newAssets);
                    updateWorkflow({
                      id: workflow.id,
                      additionalAssets: JSON.stringify(newAssets),
                    });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">Asset {index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="h-0.5" />
      
      {/* Avatar & Banner Section */}
      <div className={cn(classWrapper, "py-5")}>
        <span className="uppercase text-xs font-semibold text-muted-foreground">
          Avatar & Banner
        </span>
        <div className="flex flex-row justify-start gap-3 overflow-auto items-start mt-3">
          {/* Avatar */}
          <div className="flex flex-col items-start gap-1">
            <EditableImage
              workflowId={workflow.id}
              field="logoImage"
              imageUrl={workflow.logoImage || undefined}
              alt="Avatar"
              className="relative aspect-square bg-accent h-32 rounded-lg border border-input/60 overflow-hidden"
              imageClassName="object-cover object-center rounded-lg"
              showRemoveButton={true}
            >
              <Plus className="size-8 opacity-30 group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none" />
            </EditableImage>
            <span className="text-sm text-muted-foreground">Avatar</span>
          </div>

          {/* Background Banner */}
          <div className="flex flex-col items-start gap-1">
            <EditableImage
              workflowId={workflow.id}
              field="backgroundImage"
              imageUrl={workflow.backgroundImage || undefined}
              alt="Background banner"
              className="relative bg-accent h-32 aspect-7/2 rounded-lg border border-input/60 overflow-hidden"
              imageClassName="object-cover object-center brightness-90"
              showRemoveButton={true}
            >
              <Plus className="size-8 opacity-30 group-hover/image:opacity-5 transition-opacity duration-150 ease-in-out select-none" />
            </EditableImage>
            <span className="text-sm text-muted-foreground">Background banner</span>
          </div>
        </div>
      </div>
      
      <Separator className="h-0.5" />
      
      {/* Social Links - Keep at bottom */}
      <div className={cn(classWrapper, "py-5")}>
        <SocialLinksList
          workflowId={workflow.id}
          socialLinks={workflow.socialLinks || []}
        />
      </div>
    </div>
  );
}

export default AboutSection;

