import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col w-full h-screen">
    {children}</div>;
}
