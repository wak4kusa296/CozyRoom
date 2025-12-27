import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/libs/auth'
import { getArticleById, type MicroCMSArticle } from '@/libs/microcms'
import Comments from './components/Comments'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  let article: MicroCMSArticle
  try {
    article = await getArticleById(slug)
  } catch (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-400">記事が見つかりません。</p>
          <Link href="/blog" className="text-blue-400 hover:underline mt-4 inline-block">
            記事一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link 
            href="/blog" 
            className="text-sm text-gray-400 hover:text-white mb-4 inline-block"
          >
            ← 記事一覧に戻る
          </Link>
        </header>

        <article className="mb-12">
          <h1 className="text-3xl font-mono mb-4">{article.title}</h1>
          <p className="text-sm text-gray-400 mb-8">
            公開日: {new Date(article.publishedAt).toLocaleDateString('ja-JP')}
            {article.updatedAt !== article.publishedAt && (
              <span className="ml-4">
                更新日: {new Date(article.updatedAt).toLocaleDateString('ja-JP')}
              </span>
            )}
          </p>
          
          {article.eyecatch && (
            <div className="mb-8">
              <img
                src={article.eyecatch.url}
                alt={article.title}
                width={article.eyecatch.width}
                height={article.eyecatch.height}
                className="w-full h-auto"
              />
            </div>
          )}

          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              color: '#ffffff',
            }}
          />
        </article>

        <div className="border-t border-white pt-8">
          <Comments postId={slug} />
        </div>
      </div>
    </div>
  )
}

