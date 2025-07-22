import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-1 justify-center items-center p-6 min-h-screen bg-background">
      <div className="flex flex-col justify-center items-center text-center space-y-4">

         
        <h1 className="text-7xl font-light tracking-tighter text-foreground/80">
          404
        </h1>
        {/* Illustration */}
        {/* <div className="mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-10 text-muted-foreground/50"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="32" cy="32" r="30" strokeDasharray="4 2" />
            <path d="M20 40 L44 24" />
            <path d="M20 24 L44 40" />
          </svg>
        </div> */}
        <h2 className="text-2xl font-medium tracking-tight text-muted-foreground">
          Page not found
        </h2>
        <p className="text-base text-muted-foreground max-w-md">
          We couldn’t find the page you were looking for. It might have been moved, or it no longer exists.
        </p>

        <Button asChild variant="default" className="text-sm px-6 py-2">
          <Link href="/">Return home</Link>
        </Button>

        <footer className="mt-16 text-xs text-muted-foreground">
          <p>
            Need help?{" "}
            <Link className="underline underline-offset-4" href="/contact">
              Contact support
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
