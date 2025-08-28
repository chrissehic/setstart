"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { WORKSPACE_ITEMS, SECTION_CLASS } from "@/lib/constants";
import type { Stage, WorkflowData } from "@/types/workflow";
import { OverviewTab } from "../tabs/OverviewTab";
import { RolesTab } from "../tabs/RolesTab";
import { ProductTab } from "../tabs/ProductTab";
import { TaskboardTab } from "../tabs/TaskboardTab";
import { GrowthStageTab } from "../tabs/GrowthStageTab";
import { ReferencesPreview } from "../ui/ReferencesPreview";
import { DocumentsTab } from "../tabs/DocumentsTab";
import { CompetitorsTab } from "../tabs/CompetitorsTab";
import { MasterbriefTab } from "../tabs/MasterbriefTab";

interface WorkspaceTabTriggersProps {
  data: WorkflowData;
  stageObj: Stage;
  onTabChange: (value: string) => void;
}

export const SectionTabs = ({
  data,
  stageObj,
}: Omit<WorkspaceTabTriggersProps, "onTabChange">) => (
  <TabsList className="flex flex-col flex-3 p-2 gap-2 z-20">
    {WORKSPACE_ITEMS.map((item) => (
      <TabsTrigger
        asChild
        key={item.value}
        value={item.value}
        className="w-full [&[data-state=active]]:bg-muted"
      >
        <div
          className={cn(
            "flex flex-col justify-start gap-4 w-full text-wrap p-2 rounded-md",
            SECTION_CLASS
          )}
        >
          {item.value === "overview" && <OverviewTab data={data} />}
          {item.value === "roles" && (
            <RolesTab data={data} title={item.title} value={item.title} />
          )}
          {item.value === "offering" && (
            <ProductTab
              title={item.title}
              value={item.title}
              products={data.products}
            />
          )}
          {item.value === "documents" && (
            <div className="flex flex-col justify-start gap-2 w-full p-1">
              <h4 className="scroll-m-20 text-lg font-medium text-start">
                {item.title}
              </h4>
              <DocumentsTab workflowId={data.id} />
            </div>
          )}
          {item.value === "competitors" && (
            <CompetitorsTab
              workflowId={data.id}
              title={item.title}
              value={item.title}
              competitors={data.competitors}
            />
          )}
          {item.value === "masterbrief" && (
            <MasterbriefTab
              title={item.title}
              value={item.title}
            />
          )}
          {item.value === "reference-hub" && (
            <div className="flex flex-col justify-start gap-2 w-full p-1">
              <h4 className="scroll-m-20 text-lg font-medium text-start">
                {item.title}
              </h4>
              <ReferencesPreview workflowId={data.id} />
            </div>
          )}
          {item.value === "taskboard" && (
            <TaskboardTab
              workflowId={data.id}
              title={item.title}
              value={item.title}
            />
          )}
          {item.value === "growth-stage" && (
            <GrowthStageTab
              title={item.title}
              value={item.title}
              stageObj={stageObj}
            />
          )}
        </div>
      </TabsTrigger>
    ))}
  </TabsList>
);
