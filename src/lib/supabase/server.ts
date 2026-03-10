import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

export function createClient(request: Request) {
  const headers = new Headers()

  const envUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zhnasgdvxolfisaqillk.supabase.co';
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobmFzZ2R2eG9sZmlzYXFpbGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODgxMzcsImV4cCI6MjA4NzE2NDEzN30.JwTlbS1qGyOvKhWomahEaARPtu-rVXL3Bkc-1beM9b8';
  
  const supabaseUrl = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;

  const supabase = createServerClient(
    supabaseUrl,
    envKey,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '') as {
            name: string
            value: string
          }[]
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      },
    }
  )

  return { supabase, headers }
}
