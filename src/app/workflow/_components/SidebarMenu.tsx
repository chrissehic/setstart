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
  items: {
    title: string;
    value: string;
    url: string;
    icon?: React.ElementType;
  }[];
}) {
  return (
    <SidebarContent>
      <SidebarGroup className="px-1">
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
                  <a href={`#${item.value}`} className="text-sm">
                    {item.icon && <item.icon className="size-4! text-xs" />}
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
