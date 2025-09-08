"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { imageEventEmitter } from "@/lib/imageEventEmitter";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  workflowId: string;
  field:
    | "logoImage"
    | "backgroundImage"
    | "mainLogo"
    | "logoIcon"
    | "additionalAssets";
  imageUrl: string | null | undefined;
  alt: string;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
  onAssetAdded?: (assetUrl: string) => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export function EditableImage({
  workflowId,
  field,
  imageUrl,
  alt,
  className,
  imageClassName,
  children,
  onAssetAdded,
  onRemove,
  showRemoveButton = false,
}: EditableImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null | undefined>(imageUrl);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const queryClient = useQueryClient();

  const { mutate: updateWorkflow } = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: (updatedWorkflow) => {
      toast.success("Image updated successfully!");
      // Update the React Query cache with the new data
      queryClient.setQueryData(["workflow", workflowId], updatedWorkflow);
      // Force re-render of all components using this image
      setCacheBuster(Date.now());
      // Emit event to notify other components
      imageEventEmitter.emit({ workflowId, field, imageUrl: localImageUrl || null });
    },
    onError: (error) => {
      toast.error("Failed to update workflow with new image.");
      console.error(error);
    },
  });

  // Update local state when imageUrl prop changes
  useEffect(() => {
    // Convert empty strings to undefined for local state
    const normalizedImageUrl = imageUrl && imageUrl.trim() !== "" ? imageUrl : undefined;
    setLocalImageUrl(normalizedImageUrl);
    setCacheBuster(Date.now());
  }, [imageUrl, field]);

  // Listen for image updates from other components
  useEffect(() => {
    const unsubscribe = imageEventEmitter.subscribe((event) => {
      if (event.workflowId === workflowId && event.field === field) {
        // Convert empty strings to undefined for local state
        const normalizedImageUrl = event.imageUrl && event.imageUrl.trim() !== "" ? event.imageUrl : undefined;
        setLocalImageUrl(normalizedImageUrl);
        setCacheBuster(Date.now());
      }
    });

    return unsubscribe;
  }, [workflowId, field]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "File upload failed");
      }

      if (field === "additionalAssets") {
        onAssetAdded?.(result.url);
      } else {
        updateWorkflow({ id: workflowId, [field]: result.url });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Capture current image URL before clearing state
    const currentImageUrl = localImageUrl;

    try {
      // Clear local state immediately for instant UI update
      setLocalImageUrl(undefined);
      setCacheBuster(Date.now());

      // Small delay to ensure state update is processed
      await new Promise(resolve => setTimeout(resolve, 10));

      if (currentImageUrl) {
        // Ensure we have a clean URL path for deletion
        let urlToDelete = currentImageUrl;
        
        // If it's a Next.js optimized URL, extract the original path
        if (currentImageUrl.includes('/_next/image')) {
          // Extract the original URL from Next.js image URL
          const urlMatch = currentImageUrl.match(/url=([^&]+)/);
          if (urlMatch) {
            urlToDelete = decodeURIComponent(urlMatch[1]);
          }
        }
        
        // Call API to delete from storage
        const deleteResponse = await fetch("/api/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToDelete }),
        });

        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json().catch(() => ({}));
          const errorMessage = errorData.error || `HTTP ${deleteResponse.status}`;
          throw new Error(`Failed to delete file from storage: ${errorMessage}`);
        }
      }

      if (onRemove) {
        onRemove();
      } else {
        // Update workflow to remove the image reference - use empty string instead of null
        updateWorkflow({ id: workflowId, [field]: "" });
      }

      // Emit event to notify other components
      imageEventEmitter.emit({ workflowId, field, imageUrl: "" });
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove image.");
      // Revert local state on error
      setLocalImageUrl(currentImageUrl);
    }
  };

  // Create cache-busted URL for Next.js Image component
  const getCacheBustedUrl = (url: string | null | undefined) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${cacheBuster}`;
  };


  return (
    <div
      key={`${field}-${cacheBuster}`}
      className={`relative group/image hover:brightness-110 transition-all duration-150 ease-in-out cursor-pointer ${
        className || ""
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <div
        className={`relative h-full w-full max-h-full flex items-center justify-center overflow-hidden ${
          imageClassName || ""
        }`}
      >
        {localImageUrl && typeof localImageUrl === 'string' && localImageUrl.trim() !== "" ? (
          <div className="relative h-full w-full max-h-full flex items-center justify-center overflow-hidden">
            <Image
              alt={alt}
              src={getCacheBustedUrl(localImageUrl)!}
              fill
              className={cn(imageClassName,)}
              unoptimized={false}
            />
            {showRemoveButton && (
              <div className="absolute top-0 right-0 z-10">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white opacity-0 group-hover/image:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            {isUploading ? (
              <Loader2 className="text-white size-8 animate-spin" />
            ) : (
              <div className="relative flex items-center justify-center h-full w-full">
                <Plus className="absolute inset-0 m-auto text-accent-foreground group-hover/image:opacity-100 opacity-0 size-8 transition-all duration-150 ease-in-out z-10" />
                <div className="relative z-0">
                  {children}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/gif, image/webp"
        disabled={isUploading}
      />
    </div>
  );
}

