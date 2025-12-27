import { getComments, createComment, deleteComment, type Comment } from '@/app/actions/comments'
import { getCurrentUser } from '@/libs/auth'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface CommentsProps {
  postId: string
}

export default async function Comments({ postId }: CommentsProps) {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }
  
  const comments = await getComments(postId)

  // コメントを階層構造に変換
  const rootComments = comments.filter((c) => c.parent_id === null)
  const repliesMap = new Map<number, Comment[]>()
  
  comments.forEach((comment) => {
    if (comment.parent_id !== null) {
      if (!repliesMap.has(comment.parent_id)) {
        repliesMap.set(comment.parent_id, [])
      }
      repliesMap.get(comment.parent_id)!.push(comment)
    }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-mono border-b border-white pb-2">コメント</h2>
      
      {user && <CommentForm postId={postId} />}

      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <p className="text-gray-400 text-sm">コメントはまだありません。</p>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <CommentItem 
                comment={comment} 
                postId={postId}
                isAdmin={user.role === 'admin'}
                currentUserId={user.id}
              />
              {repliesMap.has(comment.id) && (
                <div className="ml-8 space-y-2 border-l border-gray-700 pl-4">
                  {repliesMap.get(comment.id)!.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      isAdmin={user.role === 'admin'}
                      currentUserId={user.id}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

