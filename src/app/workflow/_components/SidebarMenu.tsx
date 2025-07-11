import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React from "react";

function Sidebar({
  active,
  onTabChange,
  items,
}: {
  active: string;
  onTabChange: (tab: string) => void;
  items: { title: string; value: string; url: string }[];
}) {
  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="mb-4">Sections</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.value === active}
                  onClick={() => onTabChange(item.value)}
                >
                  <a href={`#${item.value}`}>
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

export default Sidebar;
