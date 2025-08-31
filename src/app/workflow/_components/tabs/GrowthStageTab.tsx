import { ArrowUpRight, Info } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import StagePreview from "../stages/StagePreview"
import { SECTION_CLASS } from "@/lib/constants"
import { COMPANY_STAGES } from "@/types/companyStages"
import { CompanyStage } from "@/types"

interface GrowthStageTabProps {
  title: string
  value: string
  stageObj: CompanyStage
} 

export const GrowthStageTab = ({ title, value, stageObj }: GrowthStageTabProps) => {
  // Find the full stage object from COMPANY_STAGES based on the stage key
  const fullStage = COMPANY_STAGES.find(stage => stage.key === stageObj);
  
  if (!fullStage) {
    return null; // Handle case where stage is not found
  }

  return (
    <section className={SECTION_CLASS}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <h4 id={value} className="scroll-m-20 text-lg font-medium inline-flex justify-center text-start items-center gap-2">
              {title} <Info className="size-4" />
            </h4>
          </TooltipTrigger>
          <TooltipContent>
            <Link
              className="flex flex-row justify-center items-center"
              target="_blank"
              rel="noopener noreferrer"
              href="https://hbr.org/1983/05/the-five-stages-of-small-business-growth"
            >
              <p className="text-xs underline">Based on HBR&apos;s Five Stages of Growth</p>
              <ArrowUpRight className="size-3" />
            </Link>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <StagePreview stage={fullStage} isLast={COMPANY_STAGES.length === fullStage.stageNumber} />
    </section>
  )
}
