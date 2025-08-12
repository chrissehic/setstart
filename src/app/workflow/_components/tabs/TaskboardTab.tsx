import TasksPreviewSection from "../sections/TasksPreviewSection"
import { SECTION_CLASS } from "@/lib/constants"

interface TaskboardTabProps {
  workflowId: string
  title: string
  value: string
}

export const TaskboardTab = ({ workflowId, title, value }: TaskboardTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <h4 id={value} className="scroll-m-20 text-lg font-medium text-start">
        {title}
      </h4>
      <TasksPreviewSection workflowId={workflowId} />
    </div>
  </section>
)
