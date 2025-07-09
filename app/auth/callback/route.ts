import { createRouteClient } from "@/lib/supabase/route-handler"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error)
    return NextResponse.redirect(new URL("/login?error=oauth_error", request.url))
  }

  if (code) {
    try {
      const supabase = await createRouteClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(new URL("/login?error=session_error", request.url))
      }

      console.log("Successfully exchanged code for session")
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(new URL("/login?error=unexpected_error", request.url))
    }
  }

  // Clean redirect to root dashboard without query parameters
  return NextResponse.redirect(new URL("/", request.url))
}
