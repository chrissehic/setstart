"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Globe, Hash, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { useReferences } from "@/hooks/useReferences";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PlatformSummary {
  platform: string;
  displayName: string;
  count: number;
  directCount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ReferencesPreviewProps {
  workflowId: string;
}

export const ReferencesPreview = ({ workflowId }: ReferencesPreviewProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<
    "left" | "right" | null
  >(null);

  const { data: references = [], isLoading, error } = useReferences(workflowId);

  // Continuous scroll animation based on hover position
  useEffect(() => {
    if (!isHovered || !scrollContainerRef.current || !scrollDirection) return;

    const container = scrollContainerRef.current;
    const scrollSpeed = 2;
    let animationId: number;

    const scroll = () => {
      if (scrollDirection === "left") {
        container.scrollLeft -= scrollSpeed;
      } else if (scrollDirection === "right") {
        container.scrollLeft += scrollSpeed;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isHovered, scrollDirection]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Calculate scroll direction based on mouse position
    const leftThreshold = containerWidth * 0.3; // Left 30% of container
    const rightThreshold = containerWidth * 0.7; // Right 30% of container

    if (mouseX < leftThreshold) {
      setScrollDirection("left");
    } else if (mouseX > rightThreshold) {
      setScrollDirection("right");
    } else {
      setScrollDirection(null);
    }
  };

  // Group references by platform and count them
  const platformCounts = references.reduce((acc, reference) => {
    const platform = reference.sourcePlatform.toLowerCase();

    if (!acc[platform]) {
      acc[platform] = { total: 0, direct: 0 };
    }

    acc[platform].total += 1;

    // Check if this is a direct reference (mentions your product specifically)
    // For now, we'll use a simple check - you can adjust this logic
    const isDirectReference = reference.tags.some(
      (tag) =>
        tag.toLowerCase().includes("your-product") ||
        (reference.description && reference.description.toLowerCase().includes("your-product")) ||
        reference.title.toLowerCase().includes("your-product")
    );

    if (isDirectReference) {
      acc[platform].direct += 1;
    }

    return acc;
  }, {} as Record<string, { total: number; direct: number }>);

  // Define platform configurations
  const platformConfigs: Record<string, {
    displayName: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = {
    youtube: {
      displayName: "YouTube",
      icon: () => (
        <svg className="size-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
        </svg>
      ),
      color: "bg-[#990412]/60",
    },
    instagram: {
      displayName: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-br from-orange-400/60 via-pink-500/60 to-purple-600/60",
    },
    tiktok: {
      displayName: "TikTok",
      icon: () => (
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
        </svg>
      ),
      color: "bg-black/60",
    },
    twitter: {
      displayName: "X/Twitter",
      icon: () => (
        <svg className="size-4" viewBox="0 0 300 271" fill="currentColor">
          <path d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z" />
        </svg>
      ),
      color: "bg-[#1d9bf0]/60",
    },
    linkedin: {
      displayName: "LinkedIn",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: "bg-[#0a66c2]/60",
    },
    facebook: {
      displayName: "Facebook",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-[#1877f2]/60",
    },
    pinterest: {
      displayName: "Pinterest",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
        </svg>
      ),
      color: "bg-[#bd081c]/60",
    },
    reddit: {
      displayName: "Reddit",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.5 3.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm5.5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
        </svg>
      ),
      color: "bg-[#ff4500]/60",
    },
    blog: {
      displayName: "Blog",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5zM19 19.09H5V4.91h14v14.18zM6 15h12v2H6zm0-4h12v2H6zm0-4h12v2H6z" />
        </svg>
      ),
      color: "bg-gray-500/60",
    },
    article: {
      displayName: "Article",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        </svg>
      ),
      color: "bg-gray-500/60",
    },
    podcast: {
      displayName: "Podcast",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      color: "bg-purple-500/60",
    },
    other: {
      displayName: "Other",
      icon: Globe,
      color: "bg-gray-500/60",
    },
  };

  // Create platform summaries with proper typing
  const platformSummaries: PlatformSummary[] = Object.entries(platformCounts)
    .map(([platform, counts]) => {
      const config = platformConfigs[platform] || platformConfigs.other;
      return {
        platform,
        displayName: config.displayName,
        count: counts.total,
        directCount: counts.direct,
        icon: config.icon,
        color: config.color,
      };
    })
    .sort((a, b) => {
      // Sort by direct references first, then by total count
      if (a.directCount !== b.directCount) {
        return b.directCount - a.directCount;
      }
      return b.count - a.count;
    });

  // Calculate total counts
  const totalReferences = references.length;
  const totalDirectReferences = references.filter((ref) =>
    ref.tags.some(
      (tag) =>
        tag.toLowerCase().includes("your-product") ||
        (ref.description && ref.description.toLowerCase().includes("your-product")) ||
        ref.title.toLowerCase().includes("your-product")
    )
  ).length;

  // Skeleton component for platform summary cards
  const PlatformSummarySkeleton = () => (
    <Card className="w-fit p-0">
      <CardContent className="p-2 flex flex-row items-center gap-2 h-full">
        <div className="flex items-center gap-2 flex-1">
          {/* Platform icon skeleton */}
          <Skeleton className="size-6 rounded-sm" />
          <div className="flex min-w-0 flex-row items-center gap-2">
            <div className="flex flex-col items-start justify-center gap-1">
              {/* Platform name skeleton */}
              <Skeleton className="h-4 w-20 rounded" />
              {/* Direct references count skeleton */}
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <div className="flex items-center gap-0.5">
              {/* Total count badge skeleton */}
              <Skeleton className="h-5 w-8 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {/* Stats skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
        </div>

        {/* Platform summaries skeleton */}
        <div className="flex flex-row gap-2 overflow-x-auto overflow-y-hidden p-0.5 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, index) => (
            <PlatformSummarySkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <Hash className="size-12 stroke-1 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-medium">Error loading references</h3>
          <p className="text-muted-foreground text-sm">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (platformSummaries.length === 0) {
    return (
      <div className="text-center">
        <div>
          <h3 className="text-base font-medium">No references yet</h3>
          <p className="text-muted-foreground text-sm">
            Start adding references to build your knowledge base
          </p>
        </div>
        <Button variant="link" className="no-underline font-normal">
          Add your first reference
          <ArrowRight className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          { totalDirectReferences > 0 && (
          <Badge
            variant="default"
            className="text-xs bg-primary/20 text-primary-foreground border-primary/80"
          >
            {totalDirectReferences} direct reference{totalDirectReferences > 1 ? "s" : ""}
          </Badge>
          )}
          <Badge
            variant="secondary"
            className="text-xs bg-accent text-primary-foreground border-foreground/20"
          >
            {totalReferences} total reference{totalReferences > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex flex-row gap-2 overflow-x-auto overflow-y-hidden p-0.5 transition-all duration-300 scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setScrollDirection(null);
        }}
        onMouseMove={handleMouseMove}
      >
        {platformSummaries.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <Card
              key={platform.platform}
              className="w-fit hover:shadow-md transition-shadow cursor-pointer p-0"
            >
              <CardContent className="p-2 flex flex-row items-center gap-2 h-full">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "size-6 rounded-sm flex items-center justify-center text-white",
                      `${platform.color}`
                    )}
                  >
                    <IconComponent className="size-5" />
                  </div>
                  <div className="flex min-w-0 flex-row items-center gap-2">
                    <div className="flex flex-col items-start justify-center">
                      <h4 className="font-medium text-sm truncate">
                        {platform.displayName}
                      </h4>
                      {platform.directCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {platform.directCount} direct reference
                          {platform.directCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {/* {platform.directCount > 0 && (
                        <Badge variant="default" className="text-xs px-1.5">
                          {platform.directCount}
                        </Badge>
                      )} */}
                      <Badge variant="outline" className="text-xs px-1.5">
                        {platform.count}
                      </Badge>
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
};
