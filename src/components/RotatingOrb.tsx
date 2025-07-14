"use client";

import { cn } from "@/lib/utils";

interface RotatingOrbProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showRing?: boolean;
}

export default function RotatingOrb({
  size = "md",
  className = "",
  showRing = false,
}: RotatingOrbProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const ringConfig = {
    sm: { radius: 50, starCount: 8 },
    md: { radius: 70, starCount: 12 },
    lg: { radius: 90, starCount: 16 },
  };

  const config = ringConfig[size];

  // Generate stars in a simple circle
  const stars = Array.from({ length: config.starCount }, (_, i) => {
    const angle = (360 / config.starCount) * i;
    return { angle, id: i };
  });

  return (
    <div className={`relative ${className}`}>
      {/* Main orb */}
      {/* Simple ring with stars */}
      {showRing && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 opacity-20"
          style={{
            animation: "rotate 40s linear infinite",
          }}
        >
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute text-foreground/50 dark:text-foreground/70 select-none pointer-events-none text-sm"
              style={{
                transform: `rotate(${star.angle}deg) translateY(-${config.radius}px)`,
              }}
            >
              🟄
            </div>
          ))}
        </div>
      )}
      <div
        className={cn(
          sizeClasses[size],
          
          "transition-all border-foreground border ease-in-out duration-150 rounded-full bg-gradient-to-br from-foreground via-foreground/60 to-foreground dark:from-foreground/90 dark:via-foreground/70 dark:to-foreground shadow-xs shadow-foreground/10 dark:shadow-foreground/20 animate-spin-slow relative before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-background/30 before:to-transparent before:animate-pulse-subtle after:absolute after:inset-0 after:rounded-full stroke-white"
        )}
        style={{
          animation:
            "rotate 8s linear infinite, pulse-glow 3s ease-in-out infinite alternate",
        }}
      >
        {/* Inner highlight */}
        {/* <div className="absolute top-1 left-1 w-2 h-2 bg-background/60 rounded-full blur-[1px]" /> */}
      </div>

      {/* Outer glow ring */}
      <div
        className={`
          absolute inset-0 ${sizeClasses[size]}
          rounded-full
          bg-gradient-to-br from-foreground/10 via-foreground/5 to-foreground/10
          dark:from-foreground/15 dark:via-foreground/10 dark:to-foreground/15
          animate-ping-slow
          scale-110
        `}
      />

      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 10px var(--color-foreground, rgba(0, 0, 0, 0.2));
            opacity: 0.9;
          }
          100% {
            box-shadow: 0 0 12px var(--color-foreground, rgba(0, 0, 0, 0.4));
            opacity: 0.7;
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.1);
            opacity: 0.7;
          }
        }

        .animate-spin-slow {
          animation: rotate 8s linear infinite;
        }

        .animate-pulse-subtle {
          animation: pulse 4s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
