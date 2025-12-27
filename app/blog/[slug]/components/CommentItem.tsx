'use client'

import { useState } from 'react'
import { deleteComment, type Comment } from '@/app/actions/comments'
import { useRouter } from 'next/navigation'
import CommentForm from './CommentForm'

interface CommentItemProps {
  comment: Comment
  postId: string
  isAdmin: boolean
  currentUserId?: string
}

export default function CommentItem({ comment, postId, isAdmin, currentUserId }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('このコメントを削除しますか？')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteComment(comment.id)
      if (!result.error) {
        router.refresh()
      } else {
        alert(result.error)
        setIsDeleting(false)
      }
    } catch (err) {
      alert('削除に失敗しました')
      setIsDeleting(false)
    }
  }

  const canDelete = isAdmin || (currentUserId && comment.user_id === currentUserId)
  const isAdminComment = comment.user.role === 'admin'

  return (
    <div className="border border-white p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {comment.user.name}
            </span>
            {isAdminComment && (
              <span className="text-xs text-gray-400 border border-gray-400 px-1">
                管理人
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(comment.created_at).toLocaleString('ja-JP')}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        )}
      </div>
      
      <p className="text-sm whitespace-pre-wrap font-mono">{comment.body}</p>
      
      {!comment.parent_id && (
        <div>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-gray-400 hover:text-white mt-2"
          >
            {showReplyForm ? '返信をキャンセル' : '返信'}
          </button>
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

