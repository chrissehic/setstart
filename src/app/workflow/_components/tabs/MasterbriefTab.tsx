import SetIcon from "@/components/SetIcon";

interface MasterbriefTabProps {
  title: string;
  value: string;
}

export const MasterbriefTab = ({ title, value }: MasterbriefTabProps) => (
  <div className="flex flex-col justify-start gap-2 w-full p-1">
    <h4 className="scroll-m-20 text-lg font-medium text-start">
      {title}
    </h4>
    <div className="flex flex-col justify-start gap-4 w-full text-wrap">
      {/* Single Masterbrief Row */}
      <div className="flex items-center justify-between w-full p-3 bg-muted rounded-lg border border-border/50 ">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
            <SetIcon className="size-6 fill-primary text-primary"/>
          </div>
          <div className="flex flex-col justify-start">
            <span className="text-base font-medium text-foreground">Masterbrief_v1</span>
            <span className="text-xs text-muted-foreground">Strategic foundation document</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-foreground/20 text-foreground px-2 py-1 rounded-md">v1.0</span>
        </div>
      </div>
    </div>
  </div>
);
