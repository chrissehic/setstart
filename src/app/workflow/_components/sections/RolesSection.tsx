import React from "react";
import RolesList from "../ui/RolesList";
import { WorkflowData } from "@/types/workflow";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Badge } from "@/components/ui/badge";
import { SECTION_CLASS } from "@/lib/constants";

ChartJS.register(ArcElement, Tooltip, Legend);

const classWrapper = "flex flex-col justify-start gap-2 w-full";

function RolesSection({ data }: { data: WorkflowData }) {
  const people = data.people ?? [];

  const labels = people.map((p) => p.person.name);

  const equalShare =
    people.length > 0 ? parseFloat((100 / people.length).toFixed(2)) : 0;

  const values = people.map(() => equalShare);

  // fallback neutral colors in case there are more than 5 people
  const fallbackColors = [
    "#D9D9D9",
    "#B5B5B5",
    "#919191",
    "#656565",
    "#bfbfbf",
    "#b3b3b3",
    "#a6a6a6",
  ];

  const datasetColors = labels.map((_, i) => {
    const cssVarName = `--chart-${(i % 5) + 1}`;
    const cssValue =
      getComputedStyle(document.documentElement)
        .getPropertyValue(cssVarName)
        .trim();

    // fallback if CSS var not set
    return cssValue || fallbackColors[i % fallbackColors.length];
  });

  return (
    <div className={cn(SECTION_CLASS, "gap-6")}>
      <div className={classWrapper}>
        <span className="uppercase text-xs font-semibold text-muted-foreground">
          Team cards
        </span>
        <div className="flex flex-row justify-start items-center gap-3 flex-wrap">
          <RolesList data={data} />
        </div>
      </div>

      <Separator className="h-0.5" />

      <div className={classWrapper}>
        <div className="flex flex-row justify-between items-center gap-3">
          <span className="uppercase text-xs font-semibold text-muted-foreground">
            Equity stake
          </span>
        </div>

        {people.length > 0 ? (
          <>
            <div className="size-60 p-2 self-center text-foreground">
              <Pie
                data={{
                  labels,
                  datasets: [
                    {
                      label: "Equal share",
                      data: values,
                      backgroundColor: datasetColors,
                      hoverOffset: 4,
                      borderColor:
                        getComputedStyle(document.documentElement)
                          .getPropertyValue("--accent")
                          .trim() || "#000",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const value = context.parsed || 0;
                          return `Equity: ${value}%`;
                        },
                      },
                    },
                  },
                  maintainAspectRatio: false,
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {people.map((person, idx) => (
                <Badge
                  key={person.person.id}
                  variant={"outline"}
                  className="flex items-center gap-2"
                >
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: datasetColors[idx] }}
                  ></span>
                  <div className="text-sm">{person.person.name}</div>
                </Badge>
              ))}
            </div>
          </>
        ) : (
          <div className="size-60 p-2 self-center text-foreground opacity-80">
            <Pie
            className="opacity-20"
              data={{
                labels: ["Placeholder"],
                datasets: [
                  {
                    label: "No data",
                    data: [80, 20],
                    backgroundColor: ["#e5e5e5", '#B5B5B5' ],
                    hoverOffset: 0,
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    enabled: false,
                  },
                },
                maintainAspectRatio: false,
              }}
            />
            <p className="text-center text-xs text-muted-foreground mt-2">
              No people assigned yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RolesSection;
