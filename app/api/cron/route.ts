import { NextResponse } from 'next/server'
import { createClient } from '@/libs/supabase/server'

export const runtime = 'edge'

/**
 * Keep-Alive用APIエンドポイント
 * GitHub Actionsから定期的に呼び出してSupabaseの自動停止を防ぐ
 */
export async function GET(request: Request) {
  // 認証キーチェック
  const authHeader = request.headers.get('authorization')
  const secret = process.env.KEEP_ALIVE_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: 'KEEP_ALIVE_SECRET is not configured' },
      { status: 500 }
    )
  }

  // Bearerトークンまたはクエリパラメータで認証
  const url = new URL(request.url)
  const token = authHeader?.replace('Bearer ', '') || url.searchParams.get('token')

  if (token !== secret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Supabaseに接続してKeep-Alive（簡単なクエリを実行）
    const supabase = await createClient()
    
    // 軽量なクエリで接続を維持
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Supabase keep-alive error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Keep-alive successful',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Keep-alive error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}



