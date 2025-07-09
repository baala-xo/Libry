// /components/libraries-error-state.tsx
"use client"

import Link from "next/link"
import { AlertTriangle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LibrariesErrorState({ error }: { error: any }) {
  return (
    <>
      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Database Error</p>
        </div>
        <p className="text-sm text-destructive font-mono mb-1">{error.message}</p>
        {error.hint && <p className="text-xs text-muted-foreground font-mono">Hint: {error.hint}</p>}
        {error.code && <p className="text-xs text-muted-foreground font-mono">Code: {error.code}</p>}
      </div>

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
            {/* The onClick handler is what makes this a client component */}
            <Button variant="outline" onClick={() => window.location.reload()} className="font-serif font-medium">
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}