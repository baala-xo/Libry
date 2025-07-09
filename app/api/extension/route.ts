import { createRouteClient } from "@/lib/supabase/route-handler"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient()

    // Get the session from the request
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("Session check:", { session: !!session, error: sessionError })

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized - No valid session" }, { status: 401 })
    }

    const body = await request.json()
    const { title, url, description, tags, libraryId } = body

    console.log("Request body:", { title, url, libraryId, userId: session.user.id })

    if (!title || !url || !libraryId) {
      return NextResponse.json({ error: "Title, URL, and libraryId are required" }, { status: 400 })
    }

    // Verify the library belongs to the user
    const { data: library, error: libraryError } = await supabase
      .from("libraries")
      .select("id, user_id")
      .eq("id", libraryId)
      .eq("user_id", session.user.id)
      .single()

    console.log("Library check:", { library, error: libraryError })

    if (libraryError || !library) {
      return NextResponse.json({ error: "Library not found or access denied" }, { status: 404 })
    }

    // Insert the link with explicit user context
    const { data: item, error } = await supabase
      .from("items")
      .insert({
        title: title.trim(),
        url: url.trim(),
        description: description?.trim() || null,
        tags: tags && tags.length > 0 ? tags : null,
        library_id: libraryId,
      })
      .select()
      .single()

    console.log("Insert result:", { item, error })

    if (error) {
      console.error("Insert error details:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error("Extension API error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteClient()

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's libraries for the extension
    const { data: libraries, error } = await supabase
      .from("libraries")
      .select("id, name, description, is_public")
      .eq("user_id", session.user.id)
      .order("name")

    if (error) {
      throw error
    }

    return NextResponse.json({ libraries })
  } catch (error) {
    console.error("Extension API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
