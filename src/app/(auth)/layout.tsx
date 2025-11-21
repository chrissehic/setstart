import React, { ReactNode } from "react";
import Image from "next/image";
import SetIcon from "@/components/SetIcon";
function layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row h-screen justify-center items-center w-full bg-red">
      <div className="flex-2 justify-center items-center w-full h-full">
        <div className="relative flex flex-col justify-center w-full h-full items-center overflow-hidden">
          <Image
            src="/images/iconlogoglass.png"
            alt="Logo"
            objectFit="cover"
            fill
            style={{
              filter: 'contrast(1.6) brightness(1.3) hue-rotate(490deg) invert(1)',
            }}
          />
        </div>
      </div>
      <div className="flex-3 justify-center items-center w-full h-full">
        <div className="relative w-full h-full flex flex-col justify-center items-center">
          <SetIcon className="size-24 -mb-8 z-10" animated fill="var(--primary)" />
          {children}
        </div>
      </div>
    </div>
  );
}

export default layout;
