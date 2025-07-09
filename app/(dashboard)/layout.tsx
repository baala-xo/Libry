import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

async function SignOutButton() {
  async function signOut() {
    "use server"
    const supabase = await createServerClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  return (
    <form action={signOut}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simplified dashboard layout since navigation is now in root layout */}
      {children}
    </div>
  )
}
