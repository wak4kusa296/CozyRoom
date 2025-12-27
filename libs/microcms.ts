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

const API_KEY = process.env.MICROCMS_API_KEY
const SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN
const API_BASE_URL = SERVICE_DOMAIN ? `https://${SERVICE_DOMAIN}.microcms.io/api/v1` : ''

/**
 * MicroCMSから記事一覧を取得
 */
export async function getArticles(
  limit: number = 10,
  offset: number = 0
): Promise<MicroCMSListResponse<MicroCMSArticle>> {
  if (!API_KEY || !SERVICE_DOMAIN) {
    return {
      contents: [],
      totalCount: 0,
      offset,
      limit,
    }
  }
  const url = `${API_BASE_URL}/blog?limit=${limit}&offset=${offset}`
  
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY!,
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
  if (!API_KEY || !SERVICE_DOMAIN) {
    // ビルド時や環境変数が無い場合にエラーでビルドを止めないよう、ダミーデータを返すか
    // あるいは呼び出し元で適切にハンドリングされるようにする
    return {
      id: contentId,
      title: '記事を取得できません',
      content: '<p>MicroCMSの環境変数が設定されていないか、記事の取得に失敗しました。</p>',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  const url = `${API_BASE_URL}/blog/${contentId}`
  
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY!,
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
  if (!API_KEY || !SERVICE_DOMAIN) {
    console.warn('MicroCMS環境変数が設定されていないため、getAllArticleIds は空配列を返します。ビルド時のみ発生する場合は問題ありませんが、デプロイ後の環境では確認が必要です。')
    return []
  }

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

