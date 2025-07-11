"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { ArrowRight, ArrowUpRight, Info, Loader2 } from "lucide-react";

import { EditableImage } from "./EditableImage";
import TagsList from "./TagsList";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RolesList from "./RolesList";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "./SidebarMenu";
import AboutSection from "./sections/AboutSection";
import RolesSection from "./sections/RolesSection";
import Description from "@/components/ClampedDescription";
import { Button } from "@/components/ui/button";
import StagesSection from "./sections/StagesSection";
import StagePreview from "./StagePreview";
import { WorkflowData } from "@/types/workflow";

const stages = [
  { stageNumber: 1, title: "Existence" },
  { stageNumber: 2, title: "Survival" },
  { stageNumber: 3, title: "Success" },
  { stageNumber: 4, title: "Take-off" },
  { stageNumber: 5, title: "Maturity" },
];

export const sectionClass =
  "relative w-full flex flex-row justify-start items-center flex-wrap gap-2 rounded-sm p-1 border-2 border-transparent";

interface WorkspaceProps {
  id: string;
  data: WorkflowData;
}

const cardClass =
  "flex h-full overflow-auto flex-col bg-accent w-full rounded-2xl group border pb-26 bg-card";

// Menu items.
const items = [
  {
    title: "About",
    url: "#about",
    value: "about",
  },
  {
    title: "Current stage",
    url: "#stages",
    value: "stages",
  },
  {
    title: "Roles",
    url: "#roles",
    value: "roles",
  },
];

const Workspace = ({ id, data }: WorkspaceProps) => {
  const [mounted, setMounted] = useState(false);
  const [tabActive, setTabActive] = useState("about");

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      if (newHash && items.some((i) => i.value === newHash)) {
        setTabActive(newHash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    handleHashChange(); // initialize

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="h-full w-full">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  const handleTabChange = (value: string) => {
    setTabActive(value);
    window.location.hash = value;
  };

  return (
    <main
      className={cn(
        "grid gap-2 h-full w-full overflow-hidden p-2",
        tabActive === "" ? "grid-cols-4" : "grid-cols-7"
      )}
    >
      <div
        className={cn(
          tabActive === "" ? "col-span-1" : "col-span-1",
          cardClass
        )}
      >
        <div className={sectionClass}>
          <Sidebar
            active={tabActive}
            onTabChange={handleTabChange}
            items={items}
          />
        </div>
      </div>

      <Tabs
        value={tabActive}
        onValueChange={handleTabChange}
        defaultValue="about"
      >
        <div
          className={cn(
            tabActive === "" ? "col-span-2" : "col-span-3",
            cardClass
          )}
          data-testid={`workspace-${id}`}
        >
          <EditableImage
            workflowId={data.id}
            field="backgroundImage"
            imageUrl={data.backgroundImage || undefined}
            alt="Background"
            className="relative flex-1 bg-card/50 aspect-7/3 max-h-40 z-10"
            imageClassName="object-cover object-center brightness-90"
          />
          <TabsList className="flex flex-col flex-3 p-2 gap-5 z-20">
            {items.map((item) => (
              <TabsTrigger
                asChild
                key={item.value}
                value={item.value}
                onClick={() => handleTabChange(item.value)}
              >
                <section
                  id={item.value}
                  className={cn(
                    "flex flex-col justify-start gap-4 w-full text-wrap",
                    sectionClass
                  )}
                >
                  {item.value === "about" && (
                    <div className="flex flex-col justify-center items-center gap-4 rounded-md p-1 border-2 border-transparent">
                      <div className="h-12 flex flex-col justify-end">
                        <EditableImage
                          workflowId={data.id}
                          field="logoImage"
                          imageUrl={data.logoImage || undefined}
                          alt="Logo"
                          className="relative aspect-square size-32 bg-accent rounded-lg border-input/60 border"
                          imageClassName="object-cover object-center rounded-lg"
                        />
                      </div>
                      <h2 className="text-4xl font-semibold tracking-tight first:mt-0 text-center scroll-m-36 text-foreground text-wrap">
                        {data.name}
                      </h2>
                      <div className="flex flex-col justify-start gap-4 w-full text-start text-wrap">
                        <TagsList tags={data.tags} />
                        <div className={sectionClass}>
                          {data.tagline && (
                            <h3 className="scroll-m-20 text-2xl font-medium tracking-tight text-foreground">
                              {data.tagline}
                            </h3>
                          )}
                          {data.description && (
                            <Description
                              text={data.description}
                              clampLines={2}
                            ></Description>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {item.value === "stages" && (
                    <section className={sectionClass}>
                      <Tooltip>
                        <TooltipTrigger>
                          <h4 className="scroll-m-20 text-xl font-medium inline-flex justify-center items-center gap-2">
                            Current stage <Info className="size-4" />
                          </h4>
                        </TooltipTrigger>
                        <TooltipContent>
                          <Link
                            className="flex flex-row justify-center items-center"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://hbr.org/1983/05/the-five-stages-of-small-business-growth"
                          >
                            <p className="text-xs underline">
                              Based on HBR&apos;s Five Stages of Growth
                            </p>
                            <ArrowUpRight className="size-3" />
                          </Link>
                        </TooltipContent>
                      </Tooltip>
                      <StagePreview
                        stage={stages[1]}
                        index={1}
                        isLast={stages.length === 1}
                      />
                    </section>
                  )}

                  {item.value === "roles" && (
                    <section className={sectionClass}>
                      <div className="flex flex-col justify-start gap-2 w-full">
                        <h4 className="scroll-m-20 text-xl font-medium">
                          Roles
                        </h4>
                        {data.people?.length ? (
                          <div className="flex flex-row justify-start items-center flex-wrap gap-2 w-full">
                            <RolesList data={data} readOnly={true} />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center">
                            <h2 className="text-xl font-semibold">
                              Start structuring your team
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground max-w-lg text-wrap">
                              You haven’t added any roles yet. Define the key
                              roles and responsibilities to build a clear
                              company overview and align your team.
                            </p>
                            <Button className="mt-2" variant={"link"}>
                              Add your first role
                              <ArrowRight className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </section>
                  )}
                </section>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabActive !== "" && (
          <div className={cn("col-span-3 relative", cardClass)}>
            <header className="w-full sticky top-0 p-4 flex flex-row justify-between items-center z-30 backdrop-blur-md border-b border-accent">
              <div className="flex-1">
                {/* <Button
                  className="size-9"
                  variant={"outline"}
                  onClick={() => setTabActive("")}
                >
                  <ChevronLeft className="size-7" />
                </Button> */}
              </div>
              <div className="flex-1 text-center justify-center items-center">
                <h4 className="scroll-m-20 text-md font-medium capitalize">
                  {tabActive}
                </h4>
              </div>
              <div className="flex-1"></div>
            </header>

            <div className={"flex flex-col flex-3 p-4 gap-5 z-20"}>
              <TabsContent value="about">
                <AboutSection data={data} />
              </TabsContent>
              <TabsContent value="stages">
                <StagesSection />
              </TabsContent>
              <TabsContent value="roles">
                <RolesSection data={data} />
              </TabsContent>
            </div>
          </div>
        )}
      </Tabs>
    </main>
  );
};

export default Workspace;
