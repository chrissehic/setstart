"use client";

import * as React from "react";
import { AsteriskSquare, Fingerprint, Gauge, Network } from "lucide-react";

import { NavMain } from "@/components/NavMain";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Gauge,
    },
    {
      title: "Projects",
      url: "/workflows",
      icon: Network,
    },
    {
      title: "Credentials",
      url: "/credentials",
      icon: Fingerprint,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props} className="h-auto">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row justify-between items-center">
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex flex-row gap-2 items-center">
                  <AsteriskSquare />
                  <span className=" text-xl text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-semibold">
                    setstart
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
