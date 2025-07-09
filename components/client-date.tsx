"use client"

import { useEffect, useState } from "react"

interface ClientDateProps {
  date: string
  format?: "short" | "long" | "relative"
}

export function ClientDate({ date, format = "short" }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    try {
      const dateObj = new Date(date)

      switch (format) {
        case "long":
          setFormattedDate(
            dateObj.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          )
          break
        case "relative":
          const now = new Date()
          const diffTime = Math.abs(now.getTime() - dateObj.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays === 1) {
            setFormattedDate("Yesterday")
          } else if (diffDays < 7) {
            setFormattedDate(`${diffDays} days ago`)
          } else {
            setFormattedDate(dateObj.toLocaleDateString())
          }
          break
        default:
          setFormattedDate(dateObj.toLocaleDateString())
      }
    } catch (error) {
      console.error("Error formatting date:", error)
      setFormattedDate("Invalid date")
    }
  }, [date, format])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <span className="font-mono">Loading...</span>
  }

  return <span className="font-mono">{formattedDate}</span>
}
