import { SECTION_CLASS } from "@/lib/constants";
import { ReferencesPreview } from "../ui/ReferencesPreview";

interface ReferenceHubTabProps {
  title: string;
  value: string;
}

export const ReferenceHubTab = ({ title, value }: ReferenceHubTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <h4 id={value} className="scroll-m-20 text-lg font-medium text-start">
        {title}
      </h4>
      
      <ReferencesPreview />
    </div>
  </section>
);
