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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Competitor, CompetitorFormData, CompetitorTableColumn } from "@/types/workflow";
import { useAddCompetitor, useUpdateCompetitor } from "@/hooks/useCompetitors";
import { toast } from "sonner";

interface CompetitorModalProps {
  workflowId: string;
  competitor?: Competitor | null; // If provided, we're editing
  tableColumns: CompetitorTableColumn[];
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompetitorModal({
  workflowId,
  competitor,
  tableColumns,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: CompetitorModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<CompetitorFormData>({
    name: "",
    description: "",
    website: "",
    logoImage: "",
    attributes: {},
  });

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const isEditing = !!competitor;
  const addCompetitorMutation = useAddCompetitor(workflowId);
  const updateCompetitorMutation = useUpdateCompetitor(workflowId);
  const isLoading = addCompetitorMutation.isPending || updateCompetitorMutation.isPending;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (competitor) {
        // Editing mode - populate form
        setFormData({
          name: competitor.name,
          description: competitor.description || "",
          website: competitor.website || "",
          logoImage: competitor.logoImage || "",
          attributes: competitor.attributes || {},
        });
      } else {
        // Creating mode - clear form
        setFormData({
          name: "",
          description: "",
          website: "",
          logoImage: "",
          attributes: {},
        });
      }
    }
  }, [open, competitor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (isEditing && competitor) {
        await updateCompetitorMutation.mutateAsync({
          id: competitor.id,
          ...formData,
        });
      } else {
        await addCompetitorMutation.mutateAsync(formData);
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Error saving competitor:", error);
    }
  };

  const handleAttributeChange = (columnName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [columnName]: value,
      },
    }));
  };

  const renderAttributeInput = (column: CompetitorTableColumn) => {
    const value = formData.attributes[column.name] || "";

    switch (column.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleAttributeChange(column.name, e.target.value)}
            placeholder={`Enter ${column.name.toLowerCase()}`}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAttributeChange(column.name, parseFloat(e.target.value) || 0)}
            placeholder={`Enter ${column.name.toLowerCase()}`}
          />
        );
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleAttributeChange(column.name, e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">Select {column.name}</option>
            {column.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "boolean":
        return (
          <select
            value={value ? "true" : "false"}
            onChange={(e) => handleAttributeChange(column.name, e.target.value === "true")}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        );
      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleAttributeChange(column.name, e.target.value)}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleAttributeChange(column.name, e.target.value)}
            placeholder={`Enter ${column.name.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Competitor" : "Add New Competitor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the competitor information below."
              : "Fill in the details for the new competitor."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Competitor name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the competitor"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoImage">Logo Image URL</Label>
              <Input
                id="logoImage"
                type="url"
                value={formData.logoImage}
                onChange={(e) => setFormData(prev => ({ ...prev, logoImage: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* Dynamic Attributes */}
          {tableColumns.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {tableColumns.map((column) => (
                  <div key={column.id} className="space-y-2">
                    <Label htmlFor={column.name}>
                      {column.name}
                      {column.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderAttributeInput(column)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
