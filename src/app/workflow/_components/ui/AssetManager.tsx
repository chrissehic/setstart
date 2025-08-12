"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { UpdateWorkflow } from "@/actions/workflows/updateWorkflow";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AssetManagerProps {
  workflowId: string;
  assets: string[];
  onAssetsChange: (assets: string[]) => void;
  className?: string;
  compact?: boolean;
}

export function AssetManager({ workflowId, assets, onAssetsChange, className, compact }: AssetManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate: updateWorkflow } = useMutation({
    mutationFn: UpdateWorkflow,
    onSuccess: () => {
      toast.success("Assets updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
    },
    onError: (error) => {
      toast.error("Failed to update assets.");
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

      // Add the new asset to the array
      const newAssets = [...assets, result.url];
      onAssetsChange(newAssets);
      
      // Update the workflow with the new assets array
      updateWorkflow({ 
        id: workflowId, 
        additionalAssets: JSON.stringify(newAssets) 
      });
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

  const handleRemoveAsset = (index: number) => {
    const newAssets = assets.filter((_, i) => i !== index);
    onAssetsChange(newAssets);
    
    updateWorkflow({ 
      id: workflowId, 
      additionalAssets: JSON.stringify(newAssets) 
    });
  };

  // If compact mode, render just the upload button
  if (compact) {
    return (
      <div
        className={`relative group/assetmanager hover:brightness-110 transition-all duration-150 ease-in-out cursor-pointer ${className || ""}`}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="absolute inset-0 m-auto text-white size-8 animate-spin" />
        ) : (
          <Plus className="absolute inset-0 m-auto text-accent-foreground group-hover/assetmanager:opacity-100 opacity-0 size-8 transition-all duration-150 ease-in-out" />
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Additional Assets</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Asset
        </Button>
      </div>

      {assets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 group/assetcard relative">
          {assets.map((asset, index) => (
            <Card key={index} className="">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={asset}
                    alt={`Asset ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover/assetcard:opacity-100 transition-opacity"
                    onClick={() => handleRemoveAsset(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
