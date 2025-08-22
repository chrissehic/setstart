"use client";

import { useState, useMemo } from "react";
import { type Competitor } from "@/types/workflow";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SECTION_CLASS } from "@/lib/constants";
import { useCompetitors } from "@/hooks/useCompetitors";
import { DataTable } from "./competitors/data-table"; 
import { createCompetitorColumns } from "./competitors/columns"; 

type CompetitorsSectionProps = {
  workflowId: string;
  competitors?: Competitor[];
};

function CompetitorsSection({
  workflowId,
}: CompetitorsSectionProps) {
  const [search, setSearch] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState<Partial<Competitor>>({
    name: "",
    description: "",
    website: "",
    strengths: [],
    weaknesses: [],
    marketShare: "",
    pricing: "",
    features: [],
    notes: "",
  });

  const { competitors, isLoading, error } =
    useCompetitors(workflowId);

  const filteredCompetitors = useMemo(() => {
    if (!search.trim()) return competitors;

    return competitors.filter(
      (competitor) =>
        competitor.name.toLowerCase().includes(search.toLowerCase()) ||
        competitor.description?.toLowerCase().includes(search.toLowerCase()) ||
        competitor.website?.toLowerCase().includes(search.toLowerCase())
    );
  }, [competitors, search]);

  const handleAddCompetitor = () => {
    setIsAddingNew(true);
    setNewCompetitor({
      name: "",
      description: "",
      website: "",
      strengths: [],
      weaknesses: [],
      marketShare: "",
      pricing: "",
      features: [],
      notes: "",
    });
  };

  const handleSaveNew = async () => {
    // TODO: Implement save logic
    console.log("Saving new competitor:", newCompetitor);
    setIsAddingNew(false);
    setNewCompetitor({});
    // refreshCompetitors();
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewCompetitor({});
  };



  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col justify-start gap-2 w-full",
          SECTION_CLASS
        )}
      >
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col justify-start gap-2 w-full", SECTION_CLASS)}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Competitor Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Track and analyze your competitors to stay ahead
            </p>
          </div>
          <Button onClick={handleAddCompetitor}>
            <Plus className="h-4 w-4" />
            Add Competitor
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search competitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* Competitors Table */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* Show empty state only when not adding and no competitors */}
              {!isAddingNew && filteredCompetitors.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 stroke-muted-foreground stroke-1" />
                  </div>
                  <h4 className="text-lg font-medium mb-2">No competitors yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start tracking your competitors to understand the market
                    landscape
                  </p>
                  <Button onClick={handleAddCompetitor} variant="outline">
                    <Plus className="h-4 w-4" />
                    Add First Competitor
                  </Button>
                </div>
              )}
              
              {/* Show DataTable when adding or when there are competitors */}
              {(isAddingNew || filteredCompetitors.length > 0) && (
                <DataTable 
                  columns={createCompetitorColumns(handleSaveNew, handleCancelNew)} 
                  data={[
                    // Add new competitor row if adding
                    ...(isAddingNew ? [{
                      id: "new-competitor",
                      name: "",
                      description: "",
                      website: "",
                      logoImage: "",
                      strengths: [],
                      weaknesses: [],
                      marketShare: "",
                      pricing: "",
                      features: [],
                      notes: "",
                      isNew: true,
                    }] : []),
                    // Existing competitors
                    ...filteredCompetitors.map(competitor => ({
                      id: competitor.id,
                      name: competitor.name,
                      description: competitor.description,
                      website: competitor.website,
                      logoImage: competitor.logoImage,
                      strengths: competitor.strengths,
                      weaknesses: competitor.weaknesses,
                      marketShare: competitor.marketShare,
                      pricing: competitor.pricing,
                      features: competitor.features,
                      notes: competitor.notes,
                      isNew: false,
                    }))
                  ]} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompetitorsSection;
