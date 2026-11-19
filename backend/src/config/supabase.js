import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
}

// Service-role client: full database access + Auth admin. Server-side only.
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  clientOptions,
)

// Anon client: only used for password sign-in / session refresh.
export const supabaseAnon = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  clientOptions,
)
