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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addReference } from "@/actions/references/addReference";
import { useMetadataExtraction } from "@/hooks/useMetadataExtraction";
import { toast } from "sonner";
import { Search, Loader2, AlertCircle, Globe } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Reference } from "@/types/workflow";

interface AddReferenceModalProps {
  workflowId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReferenceModal({
  workflowId,
  open,
  onOpenChange,
}: AddReferenceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [url, setUrl] = useState("");
  const [currentStep, setCurrentStep] = useState<"url-input" | "preview">("url-input");
  const queryClient = useQueryClient();
  
  const { metadata, isLoading, error, extractMetadata, reset } = useMetadataExtraction();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setUrl("");
      setCurrentStep("url-input");
      reset();
    }
  }, [open, reset]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    await extractMetadata(url.trim());
  };

  const handleSave = async () => {
    if (!metadata) return;

    setIsSubmitting(true);
    
    // Create a temporary reference for optimistic update
    const tempReference: Reference = {
      id: `temp-${Date.now()}`, // Temporary ID
      workflowId,
      title: metadata.title,
      sourcePlatform: metadata.platform,
      url: url.trim(),
      description: metadata.description,
      tags: metadata.tags,
      durationSeconds: metadata.estimatedDuration || 0,
      thumbnailUrl: metadata.thumbnailUrl,
      notes: `Author: ${metadata.author || 'Unknown'}\nCategory: ${metadata.category || 'General'}\nLanguage: ${metadata.language || 'English'}`,
      dateAdded: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Optimistically add the reference to the UI
      queryClient.setQueryData(["references", workflowId], (oldData: Reference[] | undefined) => {
        if (oldData && Array.isArray(oldData)) {
          return [tempReference, ...oldData];
        }
        return [tempReference];
      });

      const result = await addReference({
        workflowId,
        title: metadata.title,
        sourcePlatform: metadata.platform,
        url: url.trim(),
        description: metadata.description,
        tags: metadata.tags,
        durationSeconds: metadata.estimatedDuration || 0,
        thumbnailUrl: metadata.thumbnailUrl,
        notes: `Author: ${metadata.author || 'Unknown'}\nCategory: ${metadata.category || 'General'}\nLanguage: ${metadata.language || 'English'}`,
      });

      if (result.success && result.reference) {
        // Replace the temporary reference with the real one
        queryClient.setQueryData(["references", workflowId], (oldData: Reference[] | undefined) => {
          if (oldData && Array.isArray(oldData)) {
            // Transform the database result to match the Reference interface
            const newReference: Reference = {
              ...result.reference,
              tags: typeof result.reference.tags === 'string' 
                ? JSON.parse(result.reference.tags) 
                : result.reference.tags,
              dateAdded: new Date(result.reference.dateAdded),
              createdAt: new Date(result.reference.createdAt),
              updatedAt: new Date(result.reference.updatedAt),
            };
            
            // Replace temp reference with real one
            return oldData.map(ref => 
              ref.id === tempReference.id ? newReference : ref
            );
          }
          return oldData;
        });
        
        // Also invalidate the query to ensure data consistency
        queryClient.invalidateQueries({ queryKey: ["references", workflowId] });
        
        toast.success("Reference added successfully");
        setUrl("");
        setCurrentStep("url-input");
        reset();
        onOpenChange(false);
      } else {
        // Remove the temporary reference if creation failed
        queryClient.setQueryData(["references", workflowId], (oldData: Reference[] | undefined) => {
          if (oldData && Array.isArray(oldData)) {
            return oldData.filter(ref => ref.id !== tempReference.id);
          }
          return oldData;
        });
        toast.error(result.error || "Failed to add reference");
      }
    } catch {
      // Remove the temporary reference if there was an error
      queryClient.setQueryData(["references", workflowId], (oldData: Reference[] | undefined) => {
        if (oldData && Array.isArray(oldData)) {
          return oldData.filter(ref => ref.id !== tempReference.id);
        }
        return oldData;
      });
      toast.error("Failed to add reference. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToUrl = () => {
    setCurrentStep("url-input");
    reset();
  };

  // Show preview when metadata is loaded
  useEffect(() => {
    if (metadata && !isLoading && !error) {
      setCurrentStep("preview");
    }
  }, [metadata, isLoading, error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "url-input" ? "Add Reference" : "Review Reference"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "url-input" 
              ? "Paste a URL to automatically extract basic metadata."
              : "Review the extracted information and save your reference."
            }
          </DialogDescription>
        </DialogHeader>

        {currentStep === "url-input" ? (
          // URL Input Step
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !url.trim()}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  "Add content"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          // Preview Step
          <div className="space-y-4">
            {/* URL Display */}
            <div className="p-3 bg-muted rounded-md">
              <Label className="text-sm font-medium text-muted-foreground">URL</Label>
              <p className="text-sm break-all">{url}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToUrl}
                className="mt-2 h-8 px-2 text-xs"
              >
                Change URL
              </Button>
            </div>

            {/* Quick Metadata Preview */}
            {metadata && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Platform: {metadata.platform}</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title</Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => {
                      // Update metadata directly
                      metadata.title = e.target.value;
                    }}
                    placeholder="Enter title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Input
                    value={metadata.description}
                    onChange={(e) => {
                      metadata.description = e.target.value;
                    }}
                    placeholder="Enter description..."
                  />
                </div>

                {metadata.estimatedDuration && metadata.estimatedDuration > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Duration (seconds)</Label>
                    <Input
                      type="number"
                      value={metadata.estimatedDuration}
                      onChange={(e) => {
                        metadata.estimatedDuration = parseInt(e.target.value) || 0;
                      }}
                      placeholder="Duration in seconds..."
                      min="0"
                    />
                  </div>
                )}

                {metadata.thumbnailUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Thumbnail URL</Label>
                    <Input
                      value={metadata.thumbnailUrl}
                      onChange={(e) => {
                        metadata.thumbnailUrl = e.target.value;
                      }}
                      placeholder="Thumbnail URL..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToUrl}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Reference"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
