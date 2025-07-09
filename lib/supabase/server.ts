
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

/**
 * Server-side Supabase client (for Server Components & Actions).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createServerClient = () => {
  const cookieStore = cookies() // no await needed
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
