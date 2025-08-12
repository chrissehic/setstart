"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl);

  const { mutate: updateWorkflow } = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success("Image updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update workflow with new image.");
      console.error(error);
    },
  });

  // Update local state when imageUrl prop changes
  useEffect(() => {
    setLocalImageUrl(imageUrl);
  }, [imageUrl]);

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

    try {
      if (localImageUrl) {
        console.log("=== DELETE DEBUG ===");
        console.log("localImageUrl:", localImageUrl);
        console.log("typeof localImageUrl:", typeof localImageUrl);
        console.log("localImageUrl length:", localImageUrl.length);
        
        // Ensure we have a clean URL path for deletion
        let urlToDelete = localImageUrl;
        
        // If it's a Next.js optimized URL, extract the original path
        if (localImageUrl.includes('/_next/image')) {
          // Extract the original URL from Next.js image URL
          const urlMatch = localImageUrl.match(/url=([^&]+)/);
          if (urlMatch) {
            urlToDelete = decodeURIComponent(urlMatch[1]);
            console.log("Extracted original URL:", urlToDelete);
          }
        }
        
        // Ensure it starts with /uploads/
        if (!urlToDelete.startsWith('/uploads/')) {
          console.warn("URL doesn't start with /uploads/, this might cause issues");
        }
        
        console.log("Final URL to delete:", urlToDelete);
        console.log("===================");
        
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
        
        console.log("Image deleted successfully from storage");
      }

      // Clear local state immediately for instant UI update
      setLocalImageUrl(undefined);

      if (onRemove) {
        onRemove();
      } else {
        // Update workflow to remove the image reference
        updateWorkflow({ id: workflowId, [field]: undefined });
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove image.");
    }
  };

  return (
    <div
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
        {localImageUrl ? (
          <div className="relative h-full w-full max-h-full flex items-center justify-center ">
            <Image
              alt={alt}
              src={localImageUrl}
              fill
              className="max-h-full w-full object-cover"
            />
            {showRemoveButton && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover/image:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
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
