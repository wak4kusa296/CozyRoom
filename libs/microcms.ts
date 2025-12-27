export interface MicroCMSArticle {
  id: string
  title: string
  content: string
  publishedAt: string
  updatedAt: string
  eyecatch?: {
    url: string
    width: number
    height: number
  }
}

export interface MicroCMSListResponse<T> {
  contents: T[]
  totalCount: number
  offset: number
  limit: number
}

const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY
const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN

if (!MICROCMS_API_KEY || !MICROCMS_SERVICE_DOMAIN) {
  throw new Error('MicroCMS環境変数が設定されていません')
}

// 型アサーション: 上記のチェックでundefinedではないことが保証されている
const API_KEY: string = MICROCMS_API_KEY
const SERVICE_DOMAIN: string = MICROCMS_SERVICE_DOMAIN

const API_BASE_URL = `https://${SERVICE_DOMAIN}.microcms.io/api/v1`

/**
 * MicroCMSから記事一覧を取得
 */
export async function getArticles(
  limit: number = 10,
  offset: number = 0
): Promise<MicroCMSListResponse<MicroCMSArticle>> {
  const url = `${API_BASE_URL}/blog?limit=${limit}&offset=${offset}`
  
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY,
    },
    next: { revalidate: 60 }, // 60秒間キャッシュ
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    console.error('MicroCMS API Error:', {
      status: response.status,
      statusText: response.statusText,
      url,
      error: errorText,
    })
    
    if (response.status === 404) {
      throw new Error(
        `MicroCMS API エンドポイントが見つかりません。` +
        `\nエンドポイント名が "blog" であることを確認してください。` +
        `\nURL: ${url}`
      )
    }
    
    throw new Error(`MicroCMS API Error: ${response.status} - ${response.statusText}`)
  }

  return response.json()
}

/**
 * MicroCMSから記事詳細を取得
 */
export async function getArticleById(
  contentId: string
): Promise<MicroCMSArticle> {
  const url = `${API_BASE_URL}/blog/${contentId}`
  
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY,
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`記事が見つかりません (ID: ${contentId})`)
    }
    const errorText = await response.text().catch(() => 'Unknown error')
    console.error('MicroCMS API Error:', {
      status: response.status,
      statusText: response.statusText,
      url,
      error: errorText,
    })
    throw new Error(`MicroCMS API Error: ${response.status} - ${response.statusText}`)
  }

  return response.json()
}

/**
 * 全記事のID一覧を取得（静的生成用）
 */
export async function getAllArticleIds(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/blog?limit=1000&fields=id`, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY,
    },
    next: { revalidate: 3600 }, // 1時間キャッシュ
  })

  if (!response.ok) {
    throw new Error(`MicroCMS API Error: ${response.status}`)
  }

  const data = await response.json()
  return data.contents.map((article: { id: string }) => article.id)
}

