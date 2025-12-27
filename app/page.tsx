import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/libs/auth'
import LoginForm from './components/LoginForm'

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    console.log('[Home] Starting...')
    console.log('[Home] Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    
    const user = await getCurrentUser()
    console.log('[Home] User:', user ? 'Logged in' : 'Not logged in')
    
    // 既にログインしている場合はブログページにリダイレクト
    if (user) {
      redirect('/blog')
    }

    return <LoginForm />
  } catch (error) {
    console.error('[Home] Error:', error)
    console.error('[Home] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="border border-red-500 p-8 max-w-md">
          <h1 className="text-xl font-mono mb-4 text-red-400">エラーが発生しました</h1>
          <p className="text-sm text-gray-400 mb-4">
            環境変数の設定を確認してください。
          </p>
          <p className="text-xs text-gray-500 font-mono whitespace-pre-wrap break-all">
            {error instanceof Error ? error.message : String(error)}
          </p>
          {error instanceof Error && error.stack && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">スタックトレース</summary>
              <pre className="text-xs text-gray-600 mt-2 overflow-auto">{error.stack}</pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}

