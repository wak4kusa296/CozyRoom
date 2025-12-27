import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/libs/auth'
import LoginForm from './components/LoginForm'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function Home() {
  try {
    const user = await getCurrentUser()
    
    // 既にログインしている場合はブログページにリダイレクト
    if (user) {
      redirect('/blog')
    }

    return <LoginForm />
  } catch (error) {
    console.error('Home page error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="border border-red-500 p-8 max-w-md">
          <h1 className="text-xl font-mono mb-4 text-red-400">エラーが発生しました</h1>
          <p className="text-sm text-gray-400 mb-4">
            環境変数の設定を確認してください。
          </p>
          <p className="text-xs text-gray-500">
            エラー: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}

