import RotatingOrb from "@/components/RotatingOrb";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Stage } from "@/types";
import { Separator } from "@radix-ui/react-separator";
import React from "react";

type StagesCarouselProps = {
  stages: Stage[];
  currentStage: Stage;
  current: number;
  onCurrentChange: (current: number) => void;
  onApi: (api: CarouselApi) => void;
};

function StagesCarousel({
  stages,
  currentStage,
  current,
  onCurrentChange,
  onApi,
}: StagesCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;

    onApi(api); // send api to parent

    onCurrentChange(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      onCurrentChange(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        startIndex: currentStage.stageNumber - 1,
      }}
    >
      <CarouselContent>
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;

          return (
            <CarouselItem
              key={idx}
              className="w-full grid grid-cols-6 select-none cursor-grab"
            >
              <div className="col-span-2 flex flex-col justify-center items-start">
                {stage.stageNumber > 1 && (
                  <div className="h-5 flex flex-col w-full justify-center items-center">
                    <Separator
                      className={cn(
                        "w-full h-1 rounded-r-full from-accent-foreground",
                        currentStage.title === stage.title
                          ? "bg-gradient-to-l from-accent-foreground to-input"
                          : "bg-input"
                      )}
                    />
                  </div>
                )}
              </div>
              <div className="col-span-2 flex flex-col justify-center items-center gap-5">
                <span
                  className={cn(
                    "uppercase text-foreground h-7",
                    currentStage.title === stage.title ? "text-lg" : "text-sm"
                  )}
                >
                  Stage {stage.stageNumber}
                </span>
                <div className="flex flex-col justify-center items-center">
                  <RotatingOrb
                    size={currentStage.title === stage.title ? "lg" : "sm"}
                    showRing={currentStage.title === stage.title ? true : false}
                    className={cn(
                      "mx-auto transition-all duration-1500 ease-in-out",
                      current - 1 === idx
                        ? currentStage.title === stage.title
                          ? "opacity-100"
                          : "opacity-70"
                        : currentStage.title === stage.title
                        ? "opacity-70"
                        : "opacity-30"
                    )}
                  />
                </div>

                <div className="flex flex-col justify-center items-center gap-1">
                  {currentStage.title === stage.title && (
                    <Badge variant={"outline"} className="font-normal bg-muted">
                      Current stage
                    </Badge>
                  )}
                  <span
                    className={cn(
                      "mx-auto transition-all duration-1500 ease-in-out",
                      current - 1 === idx
                        ? currentStage.title === stage.title
                          ? "text-foreground text-3xl font-light"
                          : "text-foreground/80 text-xl font-normal"
                        : currentStage.title === stage.title
                        ? "text-3xl font-light text-foreground "
                        : "text-xl font-normal dark:text-muted-foreground"
                    )}
                  >
                    {stage.title}
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex flex-col justify-center items-start">
                {!isLast && (
                  <div className="h-5 flex flex-col w-full justify-center items-center">
                    <Separator
                      className={cn(
                        "w-full h-1 rounded-l-full from-accent-foreground",
                        currentStage.title === stage.title
                          ? "bg-gradient-to-r from-accent-foreground to-input"
                          : "bg-input"
                      )}
                    />
                  </div>
                )}
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default StagesCarousel;
