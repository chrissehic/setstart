import { TabsContent } from "@/components/ui/tabs"
import AboutSection from "../sections/about/AboutSection"
import StagesSection from "../sections/StagesSection"
import RolesSection from "../sections/RolesSection"
import ObjectivesSection from "../sections/ObjectivesSection"
import { ProductSection } from "../sections/ProductSection"
import type { Stage, WorkflowData } from "@/types/workflow"
import { COMPANY_STAGES } from "@/types/companyStages"

interface WorkspaceTabContentProps {
  data: WorkflowData
  stageObj: Stage
}

export const TabContent = ({ data, stageObj }: WorkspaceTabContentProps) => (
  <div className="flex flex-col flex-3 p-4 gap-5 z-20">
    <TabsContent value="overview">
      <AboutSection data={data} />
    </TabsContent>
    <TabsContent value="growth-stage">
      <StagesSection workflowId={data.id} stages={COMPANY_STAGES} currentStage={stageObj} />
    </TabsContent>
    <TabsContent value="roles">
      <RolesSection data={data} />
    </TabsContent>
    <TabsContent value="product">
      <ProductSection workflowId={data.id} />
    </TabsContent>
    <TabsContent value="taskboard">
      <ObjectivesSection
        workflowId={data.id}
        objectives={data.objectives || []}
        tasks={data.tasks || []}
        people={data.people?.map(p => ({ ...p.person, avatarImage: p.person.avatarImage || undefined })) || []}
      />
    </TabsContent>
  </div>
)
