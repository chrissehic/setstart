"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SECTION_CLASS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FileKey2, RefreshCw } from "lucide-react";
import { useWorkflow } from "@/hooks/useWorkflow";
import {
  generateMasterBrief,
  type MasterBriefData,
} from "@/lib/utils/masterBriefGenerator";
import { TaskPriority } from "@/types/workflow";

interface MasterbriefSectionProps {
  workflowId: string;
}

export default function MasterbriefSection({
  workflowId,
}: MasterbriefSectionProps) {
  const { data: workflow, isLoading, error, refetch } = useWorkflow(workflowId);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshWorkflowData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing workflow data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const generateMasterBriefDocument = async () => {
    if (!workflow) return;

    setIsGenerating(true);
    try {
      // First refresh the workflow data to ensure we have the latest
      await refreshWorkflowData();

      // Transform the data to match the MasterBriefData interface
      const masterBriefData: MasterBriefData = {
        workflow: {
          ...workflow,
          people: workflow.people || [],
          tags: workflow.tags || [],
        },
        objectives: (workflow.objectives || []).map((obj) => ({
          id: obj.id,
          workflowId: obj.workflowId,
          title: obj.title,
          description: obj.description,
          priority: obj.priority as TaskPriority | null,
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,
        })),
        products: workflow.products || [],
        socialLinks: workflow.socialLinks || [],
      };

      // Generate the HTML document
      const html = generateMasterBrief(masterBriefData);
      setGeneratedHtml(html);
    } catch (error) {
      console.error("Error generating Master Brief:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn(SECTION_CLASS)}>
        <div className="flex flex-col items-center justify-center py-12 text-center w-full">
          <div className="aspect-[1/1.414] w-full bg-muted rounded-lg">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(SECTION_CLASS)}>
        <div className="flex flex-col items-center justify-center py-12 text-center w-full">
          <div className="aspect-[1/1.414] w-full bg-muted rounded-lg">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-muted-foreground">
                Error loading workflow
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(SECTION_CLASS)}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-3xl bg-card border-b border-border/50 py-3">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">Masterbrief</h2>
            <p className="text-sm text-muted-foreground">
              Generate an investor-ready strategic document from your project data
            </p>
          </div>

        <div className="flex items-center gap-2">
          {/* <Button 
            variant="outline"
            size="sm"
            onClick={refreshWorkflowData}
            disabled={isRefreshing}
            title="Refresh workflow data"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button> */}
        </div>
      </div>

      {/* A4 Document Display */}
      <div className="flex flex-col items-center justify-center text-center w-full h-full">
        <div className="aspect-[1/1.414] h-full bg-muted rounded-lg overflow-hidden">
          {!generatedHtml ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="text-muted-foreground text-center gap-4 flex flex-col items-center">
                <FileKey2 className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">
                  Click &quot;Generate Master Brief&quot; to create your
                  document
                </p>
              </div>
              <Button
                onClick={generateMasterBriefDocument}
                disabled={isGenerating || !workflow}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileKey2 className="h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Generate Master Brief"}
              </Button>
            </div>
          ) : (
            <iframe
              srcDoc={generatedHtml}
              className="w-full h-full border-0"
              title="Master Brief Document"
            />
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
