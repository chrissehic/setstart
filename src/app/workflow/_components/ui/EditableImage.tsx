"use client";

import { useState, useRef, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { Loader2, Plus } from "lucide-react";

interface EditableImageProps {
  workflowId: string;
  field: "logoImage" | "backgroundImage" | "iconFile";
  imageUrl: string | null | undefined;
  alt: string;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
}

export function EditableImage({
  workflowId,
  field,
  imageUrl,
  alt,
  className,
  imageClassName,
  children,
}: EditableImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mutation to update the workflow with the new image URL
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

      // Once uploaded, update the workflow with the new URL
      updateWorkflow({ id: workflowId, [field]: result.url });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={`relative group hover:brightness-110 transition-all duration-150 ease-in-out cursor-pointer ${className}`}
      onClick={() => fileInputRef.current?.click()}
    >
      {imageUrl ? (
        <Image alt={alt} src={imageUrl} fill className={imageClassName} />
      ) : (
        <div
          className={`relative w-full h-full group/image flex items-center justify-center ${imageClassName}`}
        >
          <div className="text-center text-muted-foreground w-fit">
            {isUploading ? (
              <Loader2 className="text-white size-8 animate-spin" />
            ) : (
              <div className="w-fit">
                <Plus className="absolute inset-0 m-auto text-accent-foreground group-hover/image:opacity-100 opacity-0 size-8 transition-all duration-150 ease-in-out" />
               
                {children}
              </div>
            )}
          </div>
        </div>
      )}

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
