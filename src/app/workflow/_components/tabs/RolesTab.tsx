import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RolesList from "../ui/RolesList";
import type { WorkflowData } from "@/types/workflow";
import { SECTION_CLASS } from "@/lib/constants";

interface RolesTabProps {
  data: WorkflowData;
  title: string;
  value: string;
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
          <h2 className="text-base font-medium tracking-tight">
            Structure your team
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg text-wrap">
            You haven&apos;t added any roles yet. Define the key roles and
            responsibilities to build a clear company overview and align your
            team.
          </p>
          <Button variant="link" className="no-underline font-normal">
            Add your first role
            <ArrowRight className="size-3 -rotate-45" />
          </Button>
        </div>
      )}
    </div>
  </section>
);
