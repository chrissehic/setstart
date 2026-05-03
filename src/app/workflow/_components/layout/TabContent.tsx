import { TabsContent } from "@/components/ui/tabs";
import AboutSection from "../sections/about/AboutSection";
import StagesSection from "../sections/StagesSection";
import RolesSection from "../sections/RolesSection";
import ObjectivesSection from "../sections/ObjectivesSection";
import { ProductSection } from "../sections/ProductSection";
import { ReferencesSection } from "../sections/ReferencesSection";
// import MasterbriefSection from "../sections/MasterbriefSection";

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
  <div className="flex flex-col h-full z-20 w-full min-h-0 overflow-y-auto scrollbar-thin">
    <div className="p-4 space-y-5 max-w-7xl mx-auto w-full">
      <TabsContent value="overview" className="min-h-0">
        <AboutSection workflowId={data.id} />
      </TabsContent>
      <TabsContent value="growth-stage" className="min-h-0">
        <StagesSection
          workflowId={data.id}
          stages={COMPANY_STAGES}
          currentStage={stageObj}
        />
      </TabsContent>
      <TabsContent value="roles" className="min-h-0">
        <RolesSection data={data} />
      </TabsContent>
      <TabsContent value="offering" className="min-h-0">
        <ProductSection workflowId={data.id} />
      </TabsContent>
      <TabsContent value="taskboard" className="min-h-0">
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
      <TabsContent value="documents" className="min-h-0">
        <DocumentsSection workflowId={data.id} />
      </TabsContent>
      <TabsContent value="competitors" className="min-h-0">
        <CompetitorsSection workflowId={data.id} workflowData={data} />
      </TabsContent>
      {/* <TabsContent value="masterbrief" className="min-h-0">
        <MasterbriefSection workflowId={data.id} />
      </TabsContent> */}
      <TabsContent value="reference-hub" className="min-h-0">
        <ReferencesSection workflowId={data.id} />
      </TabsContent>
    </div>
  </div>
);
