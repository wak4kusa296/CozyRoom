import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/libs/auth'
import { signOut } from '../actions/auth'
import { getArticles, type MicroCMSArticle } from '@/libs/microcms'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function BlogPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  let articles: MicroCMSArticle[] = []
  let errorMessage: string | null = null
  
  try {
    const response = await getArticles(20, 0)
    articles = response.contents
  } catch (error) {
    console.error('Error fetching articles:', error)
    articles = []
    errorMessage = error instanceof Error ? error.message : '記事の取得に失敗しました'
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border-b border-white pb-4 mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-mono">CozyRoom</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">ようこそ、{user.name}さん</span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm border border-white px-3 py-1 hover:bg-white hover:text-black transition-colors font-mono"
              >
                ログアウト
              </button>
            </form>
          </div>
        </header>
        
        <main>
          <h2 className="text-xl font-mono mb-6 border-b border-white pb-2">記事一覧</h2>
          
          {errorMessage ? (
            <div className="border border-red-500 p-4 space-y-2">
              <p className="text-red-400 font-mono text-sm">エラーが発生しました</p>
              <p className="text-gray-400 text-xs whitespace-pre-wrap">{errorMessage}</p>
              <p className="text-gray-500 text-xs mt-4">
                MicroCMSの設定を確認してください：
                <br />- 環境変数 MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が正しく設定されているか
                <br />- MicroCMSでAPIエンドポイント名が "blog" になっているか
              </p>
            </div>
          ) : articles.length === 0 ? (
            <p className="text-gray-400">記事がありません。</p>
          ) : (
            <ul className="space-y-4">
              {articles.map((article) => (
                <li key={article.id} className="border border-white p-4 hover:bg-gray-900 transition-colors">
                  <Link href={`/blog/${article.id}`} className="block">
                    <h3 className="text-lg font-mono mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  )
}

