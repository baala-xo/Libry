"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  variant?: "icon" | "wordmark"
  size?: number
}

export function Logo({ className, variant = "icon", size = 32 }: LogoProps) {
  if (variant === "wordmark") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <LogoIcon size={size} />
        <span className="text-lg font-bold tracking-tight font-serif">Libry</span>
      </div>
    )
  }

  return <LogoIcon className={className} size={size} />
}

function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <div className={cn("relative flex-shrink-0", className)} style={{ width: size, height: size }}>
      <div
        className="bg-foreground rounded-lg flex items-center justify-center relative shadow-sm"
        style={{ width: size, height: size, borderRadius: size * 0.25 }}
      >
        {/* Link lines */}
        <div className="absolute inset-0 flex flex-col justify-center px-2 space-y-1">
          <div
            className="bg-background rounded-full"
            style={{ height: Math.max(1, size * 0.0625), width: size * 0.5 }}
          />
          <div
            className="bg-background rounded-full"
            style={{ height: Math.max(1, size * 0.0625), width: size * 0.375 }}
          />
          <div
            className="bg-background rounded-full"
            style={{ height: Math.max(1, size * 0.0625), width: size * 0.25 }}
          />
        </div>
        {/* Library indicator */}
        <div
          className="absolute bg-emerald-500 rounded-full"
          style={{
            right: size * 0.125,
            top: size * 0.1875,
            bottom: size * 0.1875,
            width: Math.max(1, size * 0.0625),
          }}
        />
      </div>
    </div>
  )
}
