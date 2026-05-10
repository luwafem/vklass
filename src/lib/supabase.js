import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Check .env file.')
}

// ── CRITICAL FIX: Singleton Pattern ──────────────────────────────
// Prevents React StrictMode / Vite HMR from creating multiple clients
// that fight over the localStorage lock, causing session drops.
if (!window.__supabaseInstance) {
  window.__supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  })
}

if (!window.__supabasePublicInstance) {
  window.__supabasePublicInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'vklass-public-no-auth',
    }
  })
}

export const supabase = window.__supabaseInstance
export const supabasePublic = window.__supabasePublicInstance