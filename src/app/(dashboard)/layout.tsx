"use client";

import { AppSidebar } from "@/components/AppSideBar";
import BreadcrumbHeader from "@/components/BreadcrumbHeader";
// import NavHistory from "@/components/NavHistory";
import { ModeToggle } from "@/components/ThemeModeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-1 h-auto flex-col">
        <header className="flex justify-between items-center px-6 py-4 h-14">
          <div className="flex items-center flex-row gap-4">
            {/* <NavHistory />  */}
            <BreadcrumbHeader />
          </div>
          <div className="flex items-center flex-row gap-2.5">
            <ModeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <Button>Log In</Button>
              </SignInButton>
              <SignUpButton>
                <Button variant={"outline"}>Sign Up</Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </header>
        <Separator />
        <div className="flex flex-1 overflow-auto">
          <div className="flex-1 px-6 py-4">{children}</div>
        </div>
      </SidebarInset>
    </>
  );
}
