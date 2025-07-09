"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function SessionRefresh() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      }

      if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  return null
}
