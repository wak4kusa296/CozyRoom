'use server'

import { createClient } from '@/libs/supabase/server'
import { getCurrentUser } from '@/libs/auth'
import { revalidatePath } from 'next/cache'

export interface Comment {
  id: number
  post_id: string
  user_id: string
  body: string
  parent_id: number | null
  created_at: string
  user: {
    id: string
    name: string
    role: 'admin' | 'member'
  }
}

export type CommentResult = 
  | { error: string }
  | { success: true; comment: Comment }

/**
 * 記事のコメント一覧を取得（アプリケーション側でRLSロジックを実装）
 */
export async function getComments(postId: string): Promise<Comment[]> {
  const user = await getCurrentUser()
  if (!user) {
    return []
  }

  // Service Role Keyを使用してRLSをバイパス（アプリ側でRLSロジックを実装）
  const supabase = await createClient()
  
  // Service Role Keyが設定されている場合は使用（RLSをバイパス）
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseClient = serviceRoleKey
    ? await import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      )
    : supabase

  // 全コメントを取得（RLSポリシーはカスタムセッション管理では機能しないため、アプリ側でフィルタリング）
  const { data: comments, error } = await supabaseClient
    .from('comments')
    .select(`
      id,
      post_id,
      user_id,
      body,
      parent_id,
      created_at,
      user:users!comments_user_id_fkey (
        id,
        name,
        role
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  // 型を調整
  const formattedComments = (comments || []).map((comment: any) => ({
    id: comment.id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    body: comment.body,
    parent_id: comment.parent_id,
    created_at: comment.created_at,
    user: Array.isArray(comment.user) ? comment.user[0] : comment.user,
  }))

  // アプリケーション側でRLSロジックを実装
  if (user.role === 'admin') {
    // 管理人は全コメントを表示
    return formattedComments
  }

  // 一般ユーザー: 自分のコメントと、自分宛ての管理人からの返信のみ表示
  const userComments = formattedComments.filter((comment) => {
    // 自分のコメント
    if (comment.user_id === user.id) {
      return true
    }
    // 自分宛ての管理人からの返信（parent_idが自分のコメントID）
    if (comment.parent_id !== null) {
      const parentComment = formattedComments.find((c) => c.id === comment.parent_id)
      if (parentComment && parentComment.user_id === user.id && comment.user.role === 'admin') {
        return true
      }
    }
    return false
  })

  return userComments
}

/**
 * コメントを投稿
 */
export async function createComment(
  postId: string,
  body: string,
  parentId?: number
): Promise<CommentResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'ログインが必要です' }
  }

  if (!body || body.trim() === '') {
    return { error: 'コメントを入力してください' }
  }

  const supabase = await createClient()
  
  // Service Role Keyが設定されている場合は使用
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseClient = serviceRoleKey
    ? await import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      )
    : supabase

  const { data: comment, error } = await supabaseClient
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      body: body.trim(),
      parent_id: parentId || null,
    })
    .select(`
      id,
      post_id,
      user_id,
      body,
      parent_id,
      created_at,
      user:users!comments_user_id_fkey (
        id,
        name,
        role
      )
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { error: 'コメントの投稿に失敗しました' }
  }

  // 型を調整
  const formattedComment: Comment = {
    id: comment.id,
    post_id: comment.post_id,
    user_id: comment.user_id,
    body: comment.body,
    parent_id: comment.parent_id,
    created_at: comment.created_at,
    user: Array.isArray(comment.user) ? comment.user[0] : comment.user,
  }

  revalidatePath(`/blog/${postId}`)
  return { success: true, comment: formattedComment }
}

/**
 * コメントを削除
 */
export async function deleteComment(commentId: number): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'ログインが必要です' }
  }

  const supabase = await createClient()
  
  // Service Role Keyが設定されている場合は使用
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseClient = serviceRoleKey
    ? await import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
      )
    : supabase

  // 自分のコメントか確認
  const { data: comment, error: fetchError } = await supabaseClient
    .from('comments')
    .select('user_id, post_id')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    return { error: 'コメントが見つかりません' }
  }

  if (comment.user_id !== user.id && user.role !== 'admin') {
    return { error: 'このコメントを削除する権限がありません' }
  }

  const { error: deleteError } = await supabaseClient
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (deleteError) {
    console.error('Error deleting comment:', deleteError)
    return { error: 'コメントの削除に失敗しました' }
  }

  revalidatePath(`/blog/${comment.post_id}`)
  return {}
}

