import { SECTION_CLASS } from "@/lib/constants";
import { ReferencesSection } from "../sections/ReferencesSection";

interface ReferenceHubTabProps {
  workflowId: string;
}

export const ReferenceHubTab = ({ workflowId }: ReferenceHubTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <ReferencesSection workflowId={workflowId} />
    </div>
  </section>
);
