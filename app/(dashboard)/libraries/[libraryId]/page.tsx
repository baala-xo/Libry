import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, Lock, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { AddLinkDialog } from "@/components/add-link-dialog"
import { LinkCard } from "@/components/link-card"
import { SearchLinks } from "@/components/search-links"
import { ImportExportButtons } from "@/components/import-export-buttons"

interface PageProps {
  params: Promise<{ libraryId: string }>
  searchParams: Promise<{ search?: string; tag?: string }>
}

export default async function ViewLibraryPage({ params, searchParams }: PageProps) {
  const { libraryId } = await params
  const { search, tag } = await searchParams
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch library details
  const { data: library, error: libraryError } = await supabase
    .from("libraries")
    .select("*")
    .eq("id", libraryId)
    .eq("user_id", session.user.id)
    .single()

  if (libraryError || !library) {
    notFound()
  }

  // Build query for items with search and tag filters
  let itemsQuery = supabase.from("items").select("*").eq("library_id", libraryId)

  if (search) {
    itemsQuery = itemsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,url.ilike.%${search}%`)
  }

  if (tag) {
    itemsQuery = itemsQuery.contains("tags", [tag])
  }

  const { data: items, error: itemsError } = await itemsQuery.order("created_at", { ascending: false })

  if (itemsError) {
    console.error("Error fetching items:", itemsError)
  }

  // Get all unique tags for filter
  const { data: allItems } = await supabase.from("items").select("tags").eq("library_id", libraryId)

  const allTags = Array.from(new Set(allItems?.flatMap((item) => item.tags || []) || [])).sort()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{library.name}</h1>
                <Badge variant={library.is_public ? "default" : "secondary"}>
                  {library.is_public ? (
                    <>
                      <Globe className="mr-1 h-3 w-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="mr-1 h-3 w-3" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
              {library.description && <p className="text-muted-foreground">{library.description}</p>}
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Calendar className="mr-1 h-3 w-3" />
                Created {new Date(library.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchLinks libraryId={libraryId} currentSearch={search} currentTag={tag} allTags={allTags} />
          </div>
          <div className="flex gap-2">
            <ImportExportButtons libraryId={libraryId} />
            <AddLinkDialog libraryId={libraryId}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </AddLinkDialog>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Links ({items?.length || 0})
              {search && <span className="text-muted-foreground ml-2">- searching "{search}"</span>}
              {tag && <span className="text-muted-foreground ml-2">- tagged "{tag}"</span>}
            </h2>
          </div>

          {items && items.length > 0 ? (
            <div className="grid gap-4">
              {items.map((item) => (
                <LinkCard key={item.id} item={item} libraryId={libraryId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-12 w-12">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {search || tag ? "No matching links found" : "No links yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {search || tag
                    ? "Try adjusting your search or filter criteria"
                    : "Add your first link to get started organizing your collection"}
                </p>
                {!search && !tag && (
                  <AddLinkDialog libraryId={libraryId}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Link
                    </Button>
                  </AddLinkDialog>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
