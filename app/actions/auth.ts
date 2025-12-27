'use server'

import { createClient } from '@/libs/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthResult = 
  | { error: string }
  | { success: true }

export async function authenticateWithInvitationCode(
  formData: FormData
): Promise<AuthResult | void> {
  const invitationCode = formData.get('invitation_code') as string

  if (!invitationCode || invitationCode.trim() === '') {
    return {
      error: '招待コードを入力してください。',
    }
  }

  const supabase = await createClient()

  // Service Role Keyを使用してRLSをバイパス（カスタムセッション管理のため）
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let supabaseClient = supabase

  if (serviceRoleKey) {
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    supabaseClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    ) as any
  }

  // 招待コードでユーザーを検索
  const { data: user, error: userError } = await supabaseClient
    .from('users')
    .select('id, name, role, invitation_code')
    .eq('invitation_code', invitationCode.trim())
    .single()

  if (userError) {
    console.error('Supabase query error:', userError)
    return {
      error: 'コードが違います。管理人に連絡してください。',
    }
  }

  if (!user) {
    console.error('User not found for invitation code:', invitationCode.trim())
    return {
      error: 'コードが違います。管理人に連絡してください。',
    }
  }

  // カスタムセッション管理: Cookieにユーザー情報を保存
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  // セッション情報をCookieに保存（30日間有効）
  cookieStore.set('cozyroom_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30日
    path: '/',
  })
  
  cookieStore.set('cozyroom_user_name', user.name, {
    httpOnly: false, // クライアント側でも参照可能
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  
  cookieStore.set('cozyroom_user_role', user.role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  revalidatePath('/')
  redirect('/blog')
}

export async function signOut() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  cookieStore.delete('cozyroom_user_id')
  cookieStore.delete('cozyroom_user_name')
  cookieStore.delete('cozyroom_user_role')

  revalidatePath('/')
  redirect('/')
}

