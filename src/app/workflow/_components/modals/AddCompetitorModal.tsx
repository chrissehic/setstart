"use client";

import { useState, useEffect } from "react";
import { type Competitor } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface AddCompetitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  competitor?: Competitor;
  onSaved: () => void;
}

export function AddCompetitorModal({
  open,
  onOpenChange,
  workflowId,
  competitor,
  onSaved,
}: AddCompetitorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    logoImage: "",
    marketShare: "",
    pricing: "",
    notes: "",
  });
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!competitor?.id;

  useEffect(() => {
    if (competitor && open) {
      setFormData({
        name: competitor.name || "",
        description: competitor.description || "",
        website: competitor.website || "",
        logoImage: competitor.logoImage || "",
        marketShare: competitor.marketShare || "",
        pricing: competitor.pricing || "",
        notes: competitor.notes || "",
      });
      setStrengths(competitor.strengths || []);
      setWeaknesses(competitor.weaknesses || []);
      setFeatures(competitor.features || []);
    } else if (!isEditing) {
      // Reset form for new competitor
      setFormData({
        name: "",
        description: "",
        website: "",
        logoImage: "",
        marketShare: "",
        pricing: "",
        notes: "",
      });
      setStrengths([]);
      setWeaknesses([]);
      setFeatures([]);
    }
  }, [competitor, open, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const competitorData = {
        ...formData,
        strengths: strengths,
        weaknesses: weaknesses,
        features: features,
      };

      if (isEditing) {
        // Update existing competitor
        const response = await fetch(`/api/competitors/${competitor!.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(competitorData),
        });

        if (!response.ok) {
          throw new Error("Failed to update competitor");
        }
      } else {
        // Create new competitor
        const response = await fetch("/api/competitors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...competitorData,
            workflowId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create competitor");
        }
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving competitor:", error);
      // You could add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const addStrength = () => {
    if (newStrength.trim() && !strengths.includes(newStrength.trim())) {
      setStrengths([...strengths, newStrength.trim()]);
      setNewStrength("");
    }
  };

  const removeStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const addWeakness = () => {
    if (newWeakness.trim() && !weaknesses.includes(newWeakness.trim())) {
      setWeaknesses([...weaknesses, newWeakness.trim()]);
      setNewWeakness("");
    }
  };

  const removeWeakness = (index: number) => {
    setWeaknesses(weaknesses.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Competitor" : "Add New Competitor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the competitor information below."
              : "Add a new competitor to track and analyze."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the competitor"
              rows={3}
            />
          </div>

          {/* Market Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marketShare">Market Share</Label>
              <Input
                id="marketShare"
                value={formData.marketShare}
                onChange={(e) =>
                  setFormData({ ...formData, marketShare: e.target.value })
                }
                placeholder="e.g., 15%, $2M revenue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing">Pricing Strategy</Label>
              <Input
                id="pricing"
                value={formData.pricing}
                onChange={(e) =>
                  setFormData({ ...formData, pricing: e.target.value })
                }
                placeholder="e.g., Premium, Freemium, $99/month"
              />
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <Label>Strengths</Label>
            <div className="flex gap-2">
              <Input
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                placeholder="Add a strength"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStrength())}
              />
              <Button type="button" onClick={addStrength} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {strength}
                  <button
                    type="button"
                    onClick={() => removeStrength(index)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="space-y-3">
            <Label>Weaknesses</Label>
            <div className="flex gap-2">
              <Input
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                placeholder="Add a weakness"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addWeakness())}
              />
              <Button type="button" onClick={addWeakness} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {weaknesses.map((weakness, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                  {weakness}
                  <button
                    type="button"
                    onClick={() => removeWeakness(index)}
                    className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <Label>Key Features</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional insights or observations"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Competitor" : "Add Competitor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
