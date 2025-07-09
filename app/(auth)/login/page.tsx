"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check if user was just signed out
  const wasSignedOut = searchParams.get("signed_out") === "true"

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        // If user was just signed out, don't auto-redirect
        if (wasSignedOut) {
          console.log("User was just signed out, staying on login page")
          setCheckingSession(false)
          return
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.log("Session check error:", error.message)
          setCheckingSession(false)
          return
        }

        if (session) {
          console.log("Existing session found, redirecting...")
          setRedirecting(true)
          setTimeout(() => {
            if (mounted) {
              router.push("/")
            }
          }, 500)
        } else {
          setCheckingSession(false)
        }
      } catch (error) {
        console.error("Error checking session:", error)
        if (mounted) {
          setCheckingSession(false)
        }
      }
    }

    const timeoutId = setTimeout(checkSession, wasSignedOut ? 0 : 100)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [supabase.auth, router, wasSignedOut])

  const handleGoogleSignIn = async () => {
    if (loading || checkingSession || redirecting) return

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error signing in:", error.message)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error:", error)
      setLoading(false)
    }
  }

  if (checkingSession || redirecting) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-sans">
            {redirecting ? "Redirecting..." : "Checking authentication..."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Logo variant="wordmark" />
        </div>
        {wasSignedOut && (
          <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-400 font-sans">Successfully signed out</span>
          </div>
        )}
        <CardTitle className="text-2xl font-serif font-bold">Welcome to Link Library</CardTitle>
        <CardDescription className="font-sans">
          Sign in with your Google account to start organizing your links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading || checkingSession || redirecting}
          className="w-full shadow-sm font-serif font-medium"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <div className="flex items-center">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
