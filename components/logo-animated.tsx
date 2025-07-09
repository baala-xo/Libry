"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

interface AnimatedLogoProps {
  className?: string
  variant?: "icon" | "wordmark"
  size?: number
}

export function AnimatedLogo({ className, variant = "icon", size = 32 }: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (variant === "wordmark") {
    return (
      <div
        className={cn("flex items-center gap-3 cursor-pointer", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatedLogoIcon size={size} isHovered={isHovered} />
        <span
          className={cn(
            "text-lg font-semibold tracking-tight transition-colors duration-300",
            isHovered && "text-emerald-600 dark:text-emerald-400",
          )}
        >
          Libry
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn("cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatedLogoIcon size={size} isHovered={isHovered} />
    </div>
  )
}

function AnimatedLogoIcon({ size = 32, isHovered }: { size?: number; isHovered: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(
          "bg-foreground rounded-lg flex items-center justify-center relative transition-all duration-300",
          isHovered && "scale-110 shadow-lg",
        )}
        style={{ width: size, height: size, borderRadius: size * 0.25 }}
      >
        {/* Link lines */}
        <div className="absolute inset-0 flex flex-col justify-center px-2 space-y-1">
          <div
            className="bg-background rounded-full transition-all duration-300"
            style={{
              height: Math.max(1, size * 0.0625),
              width: isHovered ? size * 0.5625 : size * 0.5,
            }}
          />
          <div
            className="bg-background rounded-full transition-all duration-300 delay-75"
            style={{
              height: Math.max(1, size * 0.0625),
              width: isHovered ? size * 0.4375 : size * 0.375,
            }}
          />
          <div
            className="bg-background rounded-full transition-all duration-300 delay-150"
            style={{
              height: Math.max(1, size * 0.0625),
              width: isHovered ? size * 0.3125 : size * 0.25,
            }}
          />
        </div>
        {/* Library indicator */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-300",
            isHovered ? "bg-emerald-400 shadow-emerald-400/50 shadow-sm" : "bg-emerald-500",
          )}
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
