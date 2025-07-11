import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NavHistory() {
  const router = useRouter();

  return (
    <div className="flex items-center flex-row gap-1">
      <button className="size-8 cursor-pointer" onClick={() => router.back()}>
        <ChevronLeft className="size-6"/>
      </button>
      <button className="size-8 cursor-pointer" onClick={() => router.forward()}>
        <ChevronRight />
      </button>
    </div>
  );
}

export default NavHistory;
