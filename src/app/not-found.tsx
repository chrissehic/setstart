import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-1 justify-center items-center p-4 min-h-screen">
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="scroll-m-20 text-6xl font-extrabold tracking-tight text-balance mb-1">
          404
        </h1>
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-3">
          Not found
        </h2>
        <p className="mb-6 text-lg">
          This page doesn’t exist. Let’s find something that does.
        </p>
        <Button asChild className="text-base">
          <Link href="/">Back to square one</Link>
        </Button>
        <footer className="mt-12 text-sm">
          <p>If you believe this is a mistake,{' '}
            <Link className="underline" href={'/'}>contact our support team.</Link></p>
        </footer>
      </div>
    </div>
  );
}
