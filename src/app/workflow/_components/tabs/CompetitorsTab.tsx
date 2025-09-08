import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SECTION_CLASS } from "@/lib/constants"
import type { Competitor } from "@/types/workflow"

interface CompetitorsTabProps {
  workflowId: string
  title: string
  value: string
  competitors?: Competitor[]
}

function CompetitorPreview({ 
  competitors = [], 
  maxDisplay = 4 
}: { competitors: Competitor[], maxDisplay?: number }) {
  const displayCompetitors = competitors.slice(0, maxDisplay)
  const remainingCount = competitors.length - maxDisplay

  if (!competitors.length) {
    return (
      <div className="text-center">
        <div>
          <h3 className="text-base font-medium">No competitors yet</h3>
          <p className="text-muted-foreground text-sm">
            Start tracking your competitors to understand the market landscape
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="grid grid-cols-4 gap-2 auto-cols-max w-full">
        {displayCompetitors.map((competitor) => (
          <div
            key={competitor.id}
            className="flex items-center gap-2 p-2 rounded-md border bg-card"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage 
                src={competitor.logoImage || undefined} 
                alt={competitor.name}
                className="bg-foreground"
              />
              <AvatarFallback className="text-xs font-medium bg-accent">
                {competitor.name
                  .split(' ')
                  .map(word => word.charAt(0))
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground truncate max-w-[80px]">
              {competitor.name}
            </span>
          </div>
        ))}
      </div>
      
      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}

export const CompetitorsTab = ({ title, value, competitors }: CompetitorsTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <h4 id={value} className="scroll-m-20 text-lg font-medium text-start">
        {title}
      </h4>
      <CompetitorPreview competitors={competitors || []} maxDisplay={4} />
    </div>
  </section>
)
