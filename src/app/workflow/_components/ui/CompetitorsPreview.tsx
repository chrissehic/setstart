"use client";

import { type Competitor } from "@/types/workflow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Globe,
  Star,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompetitorsPreviewProps {
  competitors?: Competitor[];
  max?: number;
}

export function CompetitorsPreview({
  competitors = [],
  max = 3,
}: CompetitorsPreviewProps) {
  const visibleCompetitors = competitors.slice(0, max);

  if (competitors.length === 0) {
    return (
      <div className="text-center">
      <div>
        <h3 className="text-base font-medium">No competitors yet</h3>
        <p className="text-muted-foreground text-sm">
          Start adding competitors and compare their value proposition
        </p>
      </div>
      <Button variant="link" className="no-underline font-normal">
        Add your first competitor
        <ArrowRight className="size-3" />
      </Button>
    </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 relative">
      {visibleCompetitors.map((competitor) => (
        <CompetitorPreviewCard
          key={competitor.id}
          competitor={competitor}
        />
      ))}
      
      {competitors.length > max && (
        <div className="absolute flex flex-row w-full items-center justify-center bg-transparent -bottom-2">
          <Badge variant="inverse" className="text-xs bg-accent-foreground/20">
            <span className="text-foreground">+{competitors.length - max} more</span>
          </Badge>
        </div>
      )}
    </div>
  );
}

function CompetitorPreviewCard({ competitor }: { competitor: Competitor }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={competitor.logoImage || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {competitor.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-xs truncate">{competitor.name}</h5>
            {competitor.website && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-2 w-2" />
                <span className="truncate text-xs">
                  {competitor.website.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {competitor.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {competitor.description}
          </p>
        )}

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-1">
          {competitor.marketShare && (
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-2 w-2 text-blue-500" />
              <span className="text-muted-foreground text-xs">Market:</span>
              <span className="font-medium text-xs">{competitor.marketShare}</span>
            </div>
          )}
          
          {competitor.strengths && competitor.strengths.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-2 w-2 text-green-500" />
              <span className="text-muted-foreground text-xs">S:</span>
              <span className="font-medium text-xs">{competitor.strengths.length}</span>
            </div>
          )}
          
          {competitor.weaknesses && competitor.weaknesses.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <AlertTriangle className="h-2 w-2 text-orange-500" />
              <span className="text-muted-foreground text-xs">W:</span>
              <span className="font-medium text-xs">{competitor.weaknesses.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
