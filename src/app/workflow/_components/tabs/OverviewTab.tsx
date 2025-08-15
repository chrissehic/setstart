import { EditableImage } from "../ui/EditableImage"
import TagsList from "../ui/TagsList"
import Description from "@/components/ClampedDescription"
import type { WorkflowData } from "@/types/workflow"
import { SECTION_CLASS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface OverviewTabProps {
  data: WorkflowData
}

export const OverviewTab = ({ data }: OverviewTabProps) => (
  <div className="w-full flex flex-col justify-center items-center gap-4 rounded-md p-1 border-2 border-transparent">
    <div className="h-12 flex flex-col justify-end">
      <EditableImage
        workflowId={data.id}
        field="logoImage"
        imageUrl={data.logoImage || undefined}
        alt="Logo"
        className="relative aspect-square size-32 bg-accent rounded-lg border-input/60 border"
        imageClassName="object-cover object-center rounded-lg"
      />
    </div>
    <h2 className="text-3xl font-medium tracking-tight first:mt-0 text-center scroll-m-80 text-foreground text-wrap">
      {data.name}
    </h2>
    <div className="flex flex-col justify-start gap-4 w-full text-start text-wrap">
      <TagsList tags={data.tags} maxTags={6} />
      <div className={cn(SECTION_CLASS, "gap-2")}>
        {data.tagline && (
          <h3 className="scroll-m-20 text-2xl font-medium tracking-tight text-foreground">{data.tagline}</h3>
        )}
        {data.description && <Description text={data.description} clampLines={2} />}
      </div>
    </div>
  </div>
)
