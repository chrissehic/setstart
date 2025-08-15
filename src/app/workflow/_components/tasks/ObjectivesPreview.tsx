import { Badge } from "@/components/ui/badge"

interface Objective {
  id: string
  title: string
  description?: string | null
  tasks?: Array<{ id: string }>
}

interface ObjectiveRowProps {
  objective: Objective
}

function ObjectiveRow({ objective }: ObjectiveRowProps) {
  const taskCount = objective.tasks?.length || 0

  return (
    <div className="flex items-center justify-between gap-2 p-1 px-2 rounded-md bg-accent transition-colors">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground text-sm truncate">{objective.title}</h3>
        {objective.description && <p className="text-xs text-muted-foreground truncate">{objective.description}</p>}
      </div>

      <Badge variant="secondary" className="text-xs flex-shrink-0">
        {taskCount}
      </Badge>
    </div>
  )
}

interface ObjectivesPreviewProps {
  objectives: Objective[]
  max?: number
}

export default function ObjectivesPreview({ objectives = [], max = 4 }: ObjectivesPreviewProps) {
  if (!objectives || objectives.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 border border-dashed border-border rounded">
        <p className="text-muted-foreground text-xs">No objectives</p>
      </div>
    )
  }

  const visibleObjectives = objectives.slice(0, max)

  return (
    <div className="flex flex-col gap-1 relative mb-2">
      {visibleObjectives.map((objective) => (
        <ObjectiveRow key={objective.id} objective={objective} />
      ))}

      {objectives.length > max && (
        <div className="absolute flex flex-row w-full items-center justify-center  bg-transparent -bottom-3">
          <Badge variant="inverse" className="text-xs bg-accent-foreground/20 hover:bg-accent-foreground/30">
            <span className="text-foreground">+{objectives.length - max} more</span>
          </Badge>
        </div>
      )}
    </div>
  )
}
