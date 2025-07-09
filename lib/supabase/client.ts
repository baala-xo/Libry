import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

/**
 * Public Supabase client for the browser.
 * We must pass `supabaseUrl` and `supabaseKey` explicitly so the helper
 * doesn’t rely on env-var discovery (which fails in the preview runtime).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () =>
  createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
