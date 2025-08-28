"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AuroraEffectProps {
  isVisible: boolean
  className?: string
}

export default function AuroraEffect({ isVisible, className }: AuroraEffectProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div
      className={cn(
        "absolute -bottom-6 left-0 w-full overflow-hidden pointer-events-none -z-10 px-4",
        "transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]",
        className,
      )}
      style={{
        transformOrigin: "bottom center",
        animation: isVisible
          ? "aurora-rise 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards"
          : "aurora-fall 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards",
      }}
    >
      <style jsx>{`
        @keyframes aurora-rise {
          0% { opacity: 0; transform: translateY(100%) scaleY(0.2); }
          100% { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes aurora-fall {
          0% { opacity: 1; transform: translateY(0) scaleY(1); }
          100% { opacity: 0; transform: translateY(100%) scaleY(1); }
        }

        @keyframes aurora-wave-primary {
          0% { transform: translateX(-1%) translateY(0); } 
          50% { transform: translateX(1%) translateY(-1%); } 
          100% { transform: translateX(-1%) translateY(0); }
        }
        @keyframes aurora-wave-secondary {
          0% { transform: translateX(2%) translateY(0); } 
          50% { transform: translateX(-2%) translateY(-2%); } 
          100% { transform: translateX(2%) translateY(0); }
        }

        @keyframes side-grow-left {
          0% { transform: scaleY(0.1); opacity: 0; } 
          50% { transform: scaleY(1.2); opacity: 1; } 
          100% { transform: scaleY(0.1); opacity: 0; } 

        }
        @keyframes side-grow-right {
          0% { transform: scaleY(0.1); opacity: 0; } 
          50% { transform: scaleY(1.2); opacity: 1; } 
          100% { transform: scaleY(0.1); opacity: 0; } 
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: `radial-gradient(50% 10% at 50% 100%, black 40%, transparent 80%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)`,
          maskImage: `radial-gradient(50% 10% at 50% 100%, black 40%, transparent 80%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)`,
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-3/5 transform origin-left"
          style={{
            pointerEvents: "none",
            background: `
              linear-gradient(95deg,
                rgba(255,255,255,0) 0%,
                rgb(var(--aurora-primary) / 0.05) 20%,
                rgb(var(--aurora-primary) / 0.3) 50%,
                rgb(var(--aurora-secondary) / 0.2) 60%,
                rgba(255,255,255,0) 100%)
            `,
            mixBlendMode: "screen",
            filter: "blur(3px)",
            animation: "side-grow-left 6s ease-out infinite",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-3/5 transform origin-right"
          style={{
            pointerEvents: "none",
            background: `
              linear-gradient(265deg,
                rgba(255,255,255,0) 0%,
                rgb(var(--aurora-tertiary) / 0.04) 20%,
                rgb(var(--aurora-primary) / 0.3) 40%,
                rgb(var(--aurora-accent) / 0.25) 60%,
                rgba(255,255,255,0) 100%)
            `,
            mixBlendMode: "screen",
            filter: "blur(3px)",
            animation: "side-grow-right 6s ease-out infinite",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 rounded-t-[60%] pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 90% 100% at 50% 100%,
                rgb(var(--aurora-primary) / 0.7) 0%,
                rgb(var(--aurora-primary) / 0.45) 25%,
                rgb(var(--aurora-secondary) / 0.25) 50%,
                rgb(var(--aurora-secondary) / 0.12) 75%,
                transparent 90%)
            `,
            filter: "blur(3px)",
            transformOrigin: "50% 100%",
            animation: "aurora-wave-primary 15s linear infinite",
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 rounded-t-[50%] pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 90% at 40% 100%,
                rgb(var(--aurora-tertiary) / 0.45) 0%,
                rgb(var(--aurora-secondary) / 0.3) 30%,
                rgb(var(--aurora-quaternary) / 0.2) 65%,
                transparent 85%)
            `,
            filter: "blur(2px)",
            transformOrigin: "50% 100%",
            animation: "aurora-wave-secondary 50s ease-in-out infinite",
          }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to top, 
              rgb(var(--aurora-primary) / 0.25) 0%, 
              rgb(var(--aurora-secondary) / 0.05) 10%, 
              transparent 25%)
          `,
          mixBlendMode: "screen",
        }}
      />
    </div>
  )
}
