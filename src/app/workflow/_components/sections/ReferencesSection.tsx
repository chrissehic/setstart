"use client";

import { useState, useMemo } from "react";
import { Plus, Hash, Search, Globe, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockReferences } from "@/mock/mockReferences";
import { cn } from "@/lib/utils";

interface Reference {
  id: string;
  title: string;
  sourcePlatform: string;
  url: string;
  tags: string[];
  description: string;
  relatedProductId: string;
  addedBy: string;
  dateAdded: string;
  thumbnailUrl: string;
  durationSeconds: number;
  notes: string;
}

interface ReferenceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: number;
}

interface ReferencesSectionProps {
  workflowId: string;
}

export function ReferencesSection({ workflowId }: ReferencesSectionProps) {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  // Define reference categories with priority and styling
  const referenceCategories: ReferenceCategory[] = [
    {
      id: "direct-brand",
      name: "Direct Brand References",
      description: "Direct mentions of your brand, product, or service",
      icon: Hash,
      priority: 1,
    },
    {
      id: "high-fiber",
      name: "High Fiber & Nutrition",
      description: "Content related to high fiber foods and nutrition",
      icon: Hash,
      priority: 2,
    },
    {
      id: "healthy-snacks",
      name: "Healthy Snacking",
      description: "Content about healthy snack alternatives",
      icon: Hash,
      priority: 3,
    },
    {
      id: "wellness",
      name: "Wellness & Lifestyle",
      description: "General wellness and healthy living content",
      icon: Hash,
      priority: 4,
    },
    {
      id: "social-media",
      name: "Social Media Trends",
      description: "Relevant social media trends and content",
      icon: Hash,
      priority: 5,
    },
  ];

  // Categorize references based on tags and content
  const categorizeReferences = (
    references: Reference[]
  ): Record<string, Reference[]> => {
    const categorized: Record<string, Reference[]> = {};

    referenceCategories.forEach((category) => {
      let filteredReferences: Reference[] = [];

      switch (category.id) {
        case "direct-brand":
          filteredReferences = references.filter((ref) =>
            ref.tags.some(
              (tag) =>
                tag.toLowerCase().includes("your-product") ||
                ref.title.toLowerCase().includes("your-product") ||
                ref.description.toLowerCase().includes("your-product")
            )
          );
          break;
        case "high-fiber":
          filteredReferences = references.filter((ref) =>
            ref.tags.some(
              (tag) =>
                tag.toLowerCase().includes("fiber") ||
                tag.toLowerCase().includes("nutrition") ||
                ref.title.toLowerCase().includes("fiber") ||
                ref.description.toLowerCase().includes("fiber")
            )
          );
          break;
        case "healthy-snacks":
          filteredReferences = references.filter((ref) =>
            ref.tags.some(
              (tag) =>
                tag.toLowerCase().includes("snack") ||
                tag.toLowerCase().includes("healthy") ||
                ref.title.toLowerCase().includes("snack") ||
                ref.description.toLowerCase().includes("snack")
            )
          );
          break;
        case "wellness":
          filteredReferences = references.filter((ref) =>
            ref.tags.some(
              (tag) =>
                tag.toLowerCase().includes("wellness") ||
                tag.toLowerCase().includes("lifestyle") ||
                tag.toLowerCase().includes("health")
            )
          );
          break;
        case "social-media":
          filteredReferences = references.filter((ref) =>
            ref.tags.some(
              (tag) =>
                tag.toLowerCase().includes("social") ||
                tag.toLowerCase().includes("trend") ||
                ref.sourcePlatform.toLowerCase() === "tiktok" ||
                ref.sourcePlatform.toLowerCase() === "instagram"
            )
          );
          break;
      }

      if (filteredReferences.length > 0) {
        categorized[category.id] = filteredReferences;
      }
    });

    return categorized;
  };

  // Filter references based on search and filters
  const filteredReferences = useMemo(() => {
    let filtered = mockReferences;

    if (search) {
      filtered = filtered.filter(
        (ref) =>
          ref.title.toLowerCase().includes(search.toLowerCase()) ||
          ref.description.toLowerCase().includes(search.toLowerCase()) ||
          ref.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    if (platformFilter !== "all") {
      filtered = filtered.filter(
        (ref) =>
          ref.sourcePlatform.toLowerCase() === platformFilter.toLowerCase()
      );
    }

    return filtered;
  }, [search, platformFilter]);

  const categorizedReferences = categorizeReferences(filteredReferences);

  // Get unique platforms for filter
  const uniquePlatforms = useMemo(() => {
    const platforms = new Set(mockReferences.map((ref) => ref.sourcePlatform));
    return Array.from(platforms);
  }, []);

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return "Image";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  const getPlatformIcon = (platform: string) => {
    const platformIcons: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      youtube: () => (
        <svg className="size-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
        </svg>
      ),
      instagram: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      tiktok: () => (
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
        </svg>
      ),
      twitter: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      linkedin: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    };

    return platformIcons[platform.toLowerCase()] || Globe;
  };

  const totalReferences = mockReferences.length;
  const totalDirectReferences = mockReferences.filter((ref) =>
    ref.tags.some((tag) => tag.toLowerCase().includes("your-product"))
  ).length;

  if (filteredReferences.length === 0 && (search || platformFilter !== "all")) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            References Hub
          </h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reference
          </Button>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Hash className="h-12 w-12 stroke-muted-foreground stroke-1 mb-4" />
            <h3 className="text-lg font-medium mb-2">No references found</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Try adjusting your search terms or filters to find the references
              you&apos;re looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setPlatformFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          References Hub
        </h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Reference
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge
          variant="default"
          className="text-sm bg-primary/20 text-primary border-primary/80"
        >
          {totalDirectReferences} direct references
        </Badge>
        <Badge
          variant="secondary"
          className="text-sm bg-accent text-primary-foreground border-foreground/20"
        >
          {totalReferences} total references
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search references..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {uniquePlatforms.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reference Categories */}
      {Object.entries(categorizedReferences).map(([categoryId, references]) => {
        const category = referenceCategories.find(
          (cat) => cat.id === categoryId
        );
        if (!category) return null;

        return (
          <div key={categoryId} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center border"
                )}
              >
                <category.icon className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
           
            </div>

            {/* References Grid */}
            <div className="flex flex-row overflow-x-auto w-full gap-4 pb-2 scrollbar-hide">
              {references.map((reference) => {
                const PlatformIcon = getPlatformIcon(reference.sourcePlatform);
                return (
                  <Card
                    key={reference.id}
                    className="overflow-hidden relative group hover:shadow-lg transition-all duration-200 cursor-pointer p-0 min-w-[16rem] w-64 aspect-[8/12] group/refcard flex-shrink-0"
                    onClick={() => window.open(reference.url, "_blank")}
                  >
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted overflow-hidden absolute inset-0 h-full w-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/refcard:opacity-100 transition-opacity duration-200">
                          <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="size-6 text-white fill-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-2">
                          <div className="w-full flex flex-row justify-between">
                            <div className="size-6 rounded bg-black/60 flex items-center justify-center">
                              <PlatformIcon className="size-3 text-white" />
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-xs bg-black/60 text-white border-0"
                            >
                              {formatDuration(reference.durationSeconds)}
                            </Badge>
                          </div>
                          {/* Content */}
                          <div className="flex flex-col gap-1">
                            <h4 className="font-medium text-sm line-clamp-2 text-foreground/80 group-hover/refcard:text-foreground transition-colors">
                              {reference.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {reference.description}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  reference.dateAdded
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {Object.keys(categorizedReferences).length === 0 &&
        !search &&
        platformFilter === "all" && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Hash className="h-12 w-12 stroke-muted-foreground stroke-1 mb-4" />
              <h3 className="text-lg font-medium mb-2">No references yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Start building your knowledge base by adding references to
                relevant content, trends, and insights that relate to your
                business.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add your first reference
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
