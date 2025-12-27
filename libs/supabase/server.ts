import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'

export async function createClient() {
  console.log('[createClient] Starting...')
  
  try {
    const cookieStore = await cookies()
    console.log('[createClient] Cookies obtained')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('[createClient] Environment variables:', {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? 'SET' : 'NOT SET',
    })
    
    if (!supabaseUrl || !supabaseKey) {
      const errorMsg = 'Supabase環境変数が設定されていません'
      console.error(`[createClient] ${errorMsg}:`, {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseKey,
      })
      throw new Error(errorMsg)
    }

    const client = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    console.log('[createClient] Client created successfully')
    return client
  } catch (error) {
    console.error('[createClient] Error:', error)
    throw error
  }
}

