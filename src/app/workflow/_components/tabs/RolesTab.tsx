import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import RolesList from "../RolesList"
import type { WorkflowData } from "@/types/workflow"
import { SECTION_CLASS } from "@/lib/constants"

interface RolesTabProps {
  data: WorkflowData
  title: string
  value: string
}

export const RolesTab = ({ data, title, value }: RolesTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <h4 id={value} className="scroll-m-20 text-lg font-medium text-start">
        {title}
      </h4>
      {data.people?.length ? (
        <div className="flex flex-row justify-start items-center flex-wrap gap-2 w-full">
          <RolesList data={data} readOnly={true} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-medium tracking-tight">Structure your team</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg text-wrap">
            You haven&apos;t added any roles yet. Define the key roles and responsibilities to build a clear company overview
            and align your team.
          </p>
          <Button className="mt-2" variant="link">
            Add your first role
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  </section>
)
