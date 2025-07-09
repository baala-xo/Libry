import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

/**
 * Supabase client for Route Handlers.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createRouteClient = () => {
  const cookieStore = cookies()
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
