'use client'

import { useState } from 'react'
import { createComment } from '@/app/actions/comments'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  postId: string
  parentId?: number
  onSuccess?: () => void
}

export default function CommentForm({ postId, parentId, onSuccess }: CommentFormProps) {
  const [body, setBody] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await createComment(postId, body, parentId)
      
      if ('error' in result) {
        setError(result.error)
        setIsLoading(false)
      } else {
        setBody('')
        setIsLoading(false)
        router.refresh()
        onSuccess?.()
      }
    } catch (err) {
      setError('コメントの投稿に失敗しました')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-6">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? '返信を入力...' : 'コメントを入力...'}
        required
        disabled={isLoading}
        rows={4}
        className="w-full bg-black border border-white px-3 py-2 text-white focus:outline-none focus:border-gray-400 font-mono disabled:opacity-50 resize-none"
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={isLoading || !body.trim()}
        className="border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? '投稿中...' : parentId ? '返信' : '投稿'}
      </button>
    </form>
  )
}





