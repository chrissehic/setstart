"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Instagram, Globe, Hash } from "lucide-react";
import { mockReferences } from "@/mock/mockReferences";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";

interface PlatformSummary {
  platform: string;
  displayName: string;
  count: number;
  directCount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const ReferencesPreview = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<
    "left" | "right" | null
  >(null);

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
  const platformCounts = mockReferences.reduce((acc, reference) => {
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
        reference.description.toLowerCase().includes("your-product") ||
        reference.title.toLowerCase().includes("your-product")
    );

    if (isDirectReference) {
      acc[platform].direct += 1;
    }

    return acc;
  }, {} as Record<string, { total: number; direct: number }>);

  // Define platform configurations
  const platformConfigs: Record<
    string,
    Omit<PlatformSummary, "count" | "directCount">
  > = {
    youtube: {
      platform: "youtube",
      displayName: "YouTube",
      icon: () => (
        <svg className="size-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" />
        </svg>
      ),
      color: "bg-[#990412]/60",
    },
    instagram: {
      platform: "instagram",
      displayName: "Instagram",
      icon: Instagram,
      color:
        "bg-gradient-to-br from-orange-400/60 via-pink-500/60 to-purple-600/60",
    },
    tiktok: {
      platform: "tiktok",
      displayName: "TikTok",
      icon: () => (
        <svg className="size-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z" />
        </svg>
      ),
      color: "bg-black/60",
    },
    twitter: {
      platform: "twitter",
      displayName: "Twitter",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      color: "bg-[#1d9bf0]/60",
    },
    linkedin: {
      platform: "linkedin",
      displayName: "LinkedIn",
      icon: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: "bg-[#0a66c2]/60",
    },
  };

  // Create platform summaries with counts
  const platformSummaries: PlatformSummary[] = Object.entries(platformCounts)
    .map(([platform, counts]) => {
      const config = platformConfigs[platform] || {
        platform,
        displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
        icon: Globe,
        color: "bg-gray-500",
      };

      return {
        ...config,
        count: counts.total,
        directCount: counts.direct,
      };
    })
    .sort((a, b) => {
      // Sort by direct references first (priority), then by total references
      if (a.directCount !== b.directCount) {
        return b.directCount - a.directCount;
      }
      return b.count - a.count;
    });

  // Calculate total counts
  const totalReferences = mockReferences.length;
  const totalDirectReferences = mockReferences.filter((ref) =>
    ref.tags.some(
      (tag) =>
        tag.toLowerCase().includes("your-product") ||
        ref.description.toLowerCase().includes("your-product") ||
        ref.title.toLowerCase().includes("your-product")
    )
  ).length;

  if (platformSummaries.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <Hash className="size-12 stroke-1 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-medium">No references yet</h3>
          <p className="text-muted-foreground text-sm">
            Start adding references to build your knowledge base
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="default"
            className="text-xs bg-primary/20 text-primary-foreground border-primary/80"
          >
            {totalDirectReferences} direct references
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs bg-accent text-primary-foreground border-foreground/20"
          >
            {totalReferences} total references
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
                          {platform.directCount} direct references
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
