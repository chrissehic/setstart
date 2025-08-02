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
            <RolesTab data={data} title={item.title} value={item.value} />
          )}
          {item.value === "product" && (
            <ProductTab title={item.title} value={item.value} products={data.products} />
          )}
          {item.value === "taskboard" && (
            <TaskboardTab
              workflowId={data.id}
              title={item.title}
              value={item.value}
            />
          )}
          {item.value === "growth-stage" && (
            <GrowthStageTab
              title={item.title}
              value={item.value}
              stageObj={stageObj}
            />
          )}
        </div>
      </TabsTrigger>
    ))}
  </TabsList>
);
