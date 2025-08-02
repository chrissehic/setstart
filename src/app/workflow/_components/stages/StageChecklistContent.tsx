import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StageChecklistContentProps {
  stageName: string;
  checklist?: {
    id: string;
    title: string;
    description: string;
  }[];
  onSkip?: () => void;
  direction?: "forward" | "backward"; // new
  onContinue?: () => void;
}

export function StageChecklistContent({
  stageName,
  checklist,
  direction = "forward",
  onContinue,
}: StageChecklistContentProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    () =>
      checklist?.reduce((acc, item) => {
        acc[item.id] = false;
        return acc;
      }, {} as Record<string, boolean>) ?? {}
  );

  if (!checklist || checklist.length === 0) {
    return (
      <div>
        <p>No checklist required for {stageName}. You can proceed.</p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant={"inverse"} onClick={onContinue}>
            {direction === "backward"
              ? `Return to ${stageName}`
              : `Advance to ${stageName}`}
          </Button>
        </div>
      </div>
    );
  }

  const handleToggle = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allChecked = Object.values(checkedItems).every(Boolean);

  return (
    <div className="space-y-4">
      {checklist.map((item) => (
        <Label
          key={item.id}
          htmlFor={item.id}
          className="cursor-pointer ease-in-out transition-colors duration-100 hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/10 dark:has-[[aria-checked=true]]:bg-primary/20"
        >
          <Checkbox
            id={item.id}
            checked={checkedItems[item.id]}
            onCheckedChange={() => handleToggle(item.id)}
            className="rounded border border-border text-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">{item.title}</p>
            <p className="text-muted-foreground text-sm">{item.description}</p>
          </div>
        </Label>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        {onContinue && (
          <Button
            variant={"inverse"}
            onClick={onContinue}
            disabled={!allChecked}
          >
            {direction === "backward"
              ? `Return to ${stageName}`
              : `Advance to ${stageName}`}
          </Button>
        )}
      </div>
    </div>
  );
}
