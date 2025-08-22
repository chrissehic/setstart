import { CompetitorsPreview } from "../ui/CompetitorsPreview"
import { SECTION_CLASS } from "@/lib/constants"

interface CompetitorsTabProps {
  workflowId: string
  title: string
  value: string
  competitors?: any[]
}

export const CompetitorsTab = ({ workflowId, title, value, competitors }: CompetitorsTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <h4 id={value} className="scroll-m-20 text-lg font-medium text-start">
        {title}
      </h4>
      <CompetitorsPreview competitors={competitors} max={4} />
    </div>
  </section>
)
