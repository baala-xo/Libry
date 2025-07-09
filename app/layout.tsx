import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogOut, Home, Plus } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Link Library",
  description: "Organize and manage your web links in custom libraries",
}


async function SignOutButton() {
  async function signOut() {
    "use server"
    try {
      const supabase = await createServerClient()
      // Clear the session completely
      await supabase.auth.signOut({ scope: "global" })
    } catch (error) {
      console.error("Error signing out:", error)
    }
    // Force redirect to login with a flag to prevent auto-login
    redirect("/login?signed_out=true")
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

async function DashboardHeader() {
  try {
    const supabase = await createServerClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return null
    }
    const userName = session.user?.user_metadata.full_name || ""

    // If session is invalid or expired, don't show the header
    if (sessionError || !session) {
      return null
    }
  
    const currentHour = new Date().getHours()
    let greeting
    if (currentHour < 12) {
      greeting = "Good morning"
    } else if (currentHour < 18) {
      greeting = "Good afternoon"
    } else {
      greeting = "Good evening"
    }

    return (
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <Logo variant="wordmark" />
              </Link>
              <nav className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/" className="font-serif font-medium">
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/libraries/create" className="font-serif font-medium">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Library
                  </Link>
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground font-mono">{greeting},{userName }🖤</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>
    )
  } catch (error) {
    console.error("Error in DashboardHeader:", error)
    return null
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <main>{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
