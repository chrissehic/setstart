import { usePathname } from "next/navigation";
import React from "react";
import { SlashIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "./ui/sidebar";
export default function BreadcrumbHeader() {
  const pathName = usePathname();
  const paths = pathName === "/" ? [""] : pathName?.split("/");

  return (
    <div className="flex flex-row items-center flex-start gap-4">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          {paths.map((path, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/${path}`}
                  className="data-[active=true]:text-white"
                >
                  {path === "" ? "home" : path}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index !== paths.length - 1 && (
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
