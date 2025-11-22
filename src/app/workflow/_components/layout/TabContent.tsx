import { TabsContent } from "@/components/ui/tabs";
import AboutSection from "../sections/about/AboutSection";
import StagesSection from "../sections/StagesSection";
import RolesSection from "../sections/RolesSection";
import ObjectivesSection from "../sections/ObjectivesSection";
import { ProductSection } from "../sections/ProductSection";
import { ReferencesSection } from "../sections/ReferencesSection";
import MasterbriefSection from "../sections/MasterbriefSection";

import type { WorkflowData } from "@/types/workflow";
import { COMPANY_STAGES } from "@/types/companyStages";
import { DocumentsSection } from "../sections/DocumentsSection";
import CompetitorsSection from "../sections/CompetitorsSection";

interface WorkspaceTabContentProps {
  data: WorkflowData;
  stageObj: {
    stageNumber: number;
    key: string;
    title: string;
    description: string;
    challenges: string[];
    goals: string[];
    nextSteps: string[];
    checklist: Array<{ id: string; title: string; description: string }>;
  };
}

export const TabContent = ({ data, stageObj }: WorkspaceTabContentProps) => (
  <div className="flex flex-col flex-3 p-4 gap-5 z-20 overflow-y-auto">
    <TabsContent value="overview">
      <AboutSection workflowId={data.id} />
    </TabsContent>
    <TabsContent value="growth-stage">
      <StagesSection
        workflowId={data.id}
        stages={COMPANY_STAGES}
        currentStage={stageObj}
      />
    </TabsContent>
    <TabsContent value="roles">
      <RolesSection data={data} />
    </TabsContent>
    <TabsContent value="offering">
      <ProductSection workflowId={data.id} />
    </TabsContent>
    <TabsContent value="taskboard">
      <ObjectivesSection
        workflowId={data.id}
        objectives={data.objectives || []}
        tasks={data.tasks || []}
        people={
          data.people?.map((p) => ({
            ...p.person,
            avatarImage: p.person.avatarImage || undefined,
          })) || []
        }
      />
    </TabsContent>
    <TabsContent value="documents">
      <DocumentsSection workflowId={data.id} />
    </TabsContent>
    <TabsContent value="competitors">
      <CompetitorsSection workflowId={data.id} />
    </TabsContent>
    <TabsContent value="masterbrief">
      <MasterbriefSection workflowId={data.id} />
    </TabsContent>
    <TabsContent value="reference-hub">
      <ReferencesSection workflowId={data.id} />
    </TabsContent>
  </div>
);
