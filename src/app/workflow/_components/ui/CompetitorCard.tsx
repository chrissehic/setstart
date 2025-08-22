"use client";

import { useState } from "react";
import { type Competitor } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Globe,
  Star,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompetitorCardProps {
  competitor: Competitor;
  onEdit: () => void;
}

export function CompetitorCard({ competitor, onEdit }: CompetitorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWebsiteClick = () => {
    if (competitor.website) {
      window.open(competitor.website, '_blank');
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={competitor.logoImage || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {competitor.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-base">{competitor.name}</h4>
              {competitor.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={handleWebsiteClick}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  {competitor.website.replace(/^https?:\/\//, '')}
                </Button>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {competitor.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {competitor.description}
          </p>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {competitor.marketShare && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Market Share:</span>
              <span className="font-medium">{competitor.marketShare}</span>
            </div>
          )}
          {competitor.pricing && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Pricing:</span>
              <span className="font-medium">{competitor.pricing}</span>
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-3">
          {competitor.strengths && competitor.strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Strengths</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {competitor.strengths.slice(0, isExpanded ? undefined : 3).map((strength, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                    {strength}
                  </Badge>
                ))}
                {competitor.strengths.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Show Less' : `+${competitor.strengths.length - 3} More`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {competitor.weaknesses && competitor.weaknesses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Weaknesses</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {competitor.weaknesses.slice(0, isExpanded ? undefined : 3).map((weakness, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    {weakness}
                  </Badge>
                ))}
                {competitor.weaknesses.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Show Less' : `+${competitor.weaknesses.length - 3} More`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {competitor.features && competitor.features.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Features</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {competitor.features.slice(0, isExpanded ? undefined : 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {competitor.features.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Show Less' : `+${competitor.features.length - 3} More`}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {competitor.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              "{competitor.notes}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
