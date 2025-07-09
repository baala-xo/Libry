"use client"

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Globe, Lock, Calendar, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ClientDate } from "@/components/client-date"
import { LibrarySkeleton } from "@/components/library-skeleton"

async function LibrariesContent() {
  try {
    const supabase = await createServerClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error details:", {
        message: sessionError.message,
        details: sessionError.details,
        hint: sessionError.hint,
        code: sessionError.code,
      })
      redirect("/login")
    }

    if (!session) {
      console.log("No session found, redirecting to login")
      redirect("/login")
    }

    console.log("User session found:", session.user.id)

    const { data: libraries, error } = await supabase
      .from("libraries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      if (error.message?.includes("JWT") || error.code === "PGRST301") {
        console.log("JWT expired, redirecting to login")
        redirect("/login")
      }

      // Return error state instead of throwing
      return <LibrariesErrorState error={error} />
    }

    console.log("Libraries fetched successfully:", libraries?.length || 0)

    if (libraries && libraries.length > 0) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {libraries.map((library) => (
            <Card key={library.id} className="hover:shadow-md transition-all duration-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-serif font-semibold">{library.name}</CardTitle>
                  <div className="flex items-center text-muted-foreground">
                    {library.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>
                </div>
                {library.description && <CardDescription className="font-sans">{library.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    <ClientDate date={library.created_at} />
                  </div>
                  <Button variant="outline" size="sm" asChild className="shadow-xs bg-transparent">
                    <Link href={`/libraries/${library.id}`} className="font-serif font-medium">
                      View Library
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    return <EmptyLibrariesState />
  } catch (err) {
    console.error("Unexpected error in LibrariesContent:", err)
    return <LibrariesErrorState error={err} />
  }
}

function LibrariesErrorState({ error }: { error: any }) {
  return (
    <>
      {/* Error Banner */}
      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Database Error</p>
        </div>
        <p className="text-sm text-destructive font-mono mb-1">{error.message}</p>
        {error.hint && <p className="text-xs text-muted-foreground font-mono">Hint: {error.hint}</p>}
        {error.code && <p className="text-xs text-muted-foreground font-mono">Code: {error.code}</p>}
      </div>

      {/* Error State UI */}
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-12 w-12 text-destructive mb-4">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2 font-serif">Error loading libraries</h3>
          <p className="text-muted-foreground mb-6 font-sans">
            There was an issue loading your libraries. Try creating a new one or refreshing the page.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild className="shadow-sm">
              <Link href="/libraries/create" className="font-serif font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Try Creating a Library
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="font-serif font-medium">
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function EmptyLibrariesState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto max-w-md">
        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-12 w-12">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2 font-serif">No libraries yet</h3>
        <p className="text-muted-foreground mb-6 font-sans">Create your first library to start organizing your links</p>
        <Button asChild className="shadow-sm">
          <Link href="/libraries/create" className="font-serif font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Library
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif">My Libraries</h1>
          <p className="text-muted-foreground font-sans">Organize your links into custom collections</p>
        </div>
        <Button asChild className="shadow-sm">
          <Link href="/libraries/create" className="font-serif font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Create Library
          </Link>
        </Button>
      </div>

      <Suspense fallback={<LibrarySkeleton />}>
        <LibrariesContent />
      </Suspense>
    </div>
  )
}
