import React from "react";
import StagesCarousel from "../StagesCarousel";
import { CompanyStage, Stage } from "@/types";
import { Button } from "@/components/ui/button";
import { View } from "lucide-react";
import { cn } from "@/lib/utils";
import { CarouselApi } from "@/components/ui/carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StageChecklistDialog } from "../StageChecklistDialog";
import { SECTION_CLASS } from "@/lib/constants";

const classWrapper = "flex flex-col justify-start gap-2 w-full";

type StagesSectionProps = {
  workflowId: string;
  stages: Stage[];
  currentStage: Stage;
};

function StagesSection({
  stages,
  currentStage,
  workflowId,
}: StagesSectionProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const viewedStage = stages[current - 1];

  return (
    <div className={SECTION_CLASS}>
      <div className={classWrapper}>
        <div className="flex flex-row justify-between items-start gap-3">
          <span className="uppercase text-xs font-semibold text-muted-foreground">
            Company stages
          </span>

          <Button
            variant="outline"
            className={cn(
              "opacity-100 transition-all ease-in-out",
              currentStage.stageNumber === current && "invisible opacity-0"
            )}
            onClick={() => {
              if (api) {
                api.scrollTo(currentStage.stageNumber - 1);
              }
            }}
          >
            <View />
            View current stage
          </Button>
        </div>

        <StagesCarousel
          stages={stages}
          currentStage={currentStage}
          current={current}
          onCurrentChange={setCurrent}
          onApi={setApi}
        />
      </div>
      <div className={cn(classWrapper, "py-4")}>
        {currentStage.stageNumber === current ? (
          <div className="flex flex-col justify-start items-start gap-5">
            <section className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <p className="leading-6 text-md">{viewedStage?.description}</p>
            </section>

            <div className="grid grid-cols-2 gap-3 w-full">
              <section
                className={
                  "p-4 rounded-lg border border-input col-span-1 w-full space-y-1"
                }
              >
                <h4 className="scroll-m-20 text-base text-muted-foreground font-medium tracking-tight">
                  Goals
                </h4>
                <ul className="list-disc pl-4 text-sm space-y-2">
                  {viewedStage?.goals.map((goal, i) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </section>

              <section
                className={
                  "p-4 rounded-lg border border-input col-span-1 w-full space-y-1"
                }
              >
                <h4 className="scroll-m-20 text-base text-muted-foreground font-medium tracking-tight">
                  Challenges
                </h4>
                <ul className="list-disc pl-4 text-sm space-y-2">
                  {viewedStage?.challenges.map((challenge, i) => (
                    <li key={i}>{challenge}</li>
                  ))}
                </ul>
              </section>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              <section
                className={
                  "p-4 rounded-lg border border-input col-span-1 w-full space-y-1"
                }
              >
                <h4 className="scroll-m-20 text-base text-muted-foreground font-medium tracking-tight">
                  Next steps
                </h4>
                <ul className="list-disc pl-4 text-sm space-y-2">
                  {viewedStage?.nextSteps.map((challenge, i) => (
                    <li key={i}>{challenge}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        ) : viewedStage?.stageNumber < currentStage.stageNumber ? (
          // ⬅️ Rolling back
          <Alert variant="default">
            <AlertTitle className="text-base">
              You’re viewing a previous stage
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p>
                You’re currently on the <b>{currentStage?.title}</b> stage.
                You’re viewing <b>{viewedStage?.title}</b>, which is an earlier
                stage. You can review its goals, challenges, and checklist here
                — but note your progress remains at <b>{currentStage?.title}</b>
                .
              </p>

              <StageChecklistDialog
                workflowId={workflowId}
                stageName={viewedStage?.title ?? ""}
                stageKey={viewedStage?.key as CompanyStage}
                checklist={viewedStage?.checklist}
                direction="backward"
              />
            </AlertDescription>
          </Alert>
        ) : (
          // ➡️ Moving forward
          <Alert variant="default">
            <AlertTitle className="text-base">Ready to move on?</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <p>
                You’re currently on the <b>{currentStage?.title}</b> stage.
                Before moving on to <b>{viewedStage?.title}</b>, review or
                complete the current stage’s checklist. Don’t worry — you can
                always come back later if needed.
              </p>

              <StageChecklistDialog
                workflowId={workflowId}
                stageName={viewedStage?.title ?? ""}
                stageKey={viewedStage?.key as CompanyStage}
                checklist={viewedStage?.checklist}
                direction="forward"
              />
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

export default StagesSection;
