import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('cozyroom_user_id')?.value
  
  // ブログエリアへのアクセス制御
  if (request.nextUrl.pathname.startsWith('/blog')) {
    if (!userId) {
      // 未認証の場合はトップページにリダイレクト
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // ログイン済みユーザーがトップページにアクセスした場合
  if (request.nextUrl.pathname === '/' && userId) {
    return NextResponse.redirect(new URL('/blog', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}





