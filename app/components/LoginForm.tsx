'use client'

import { useState } from 'react'
import { authenticateWithInvitationCode } from '../actions/auth'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setIsLoading(true)
    
    try {
      const result = await authenticateWithInvitationCode(formData)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // 成功時はredirectされるので、ここには到達しない
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md">
        <div className="border border-white p-8 space-y-6">
          <h1 className="text-2xl font-mono text-center">CozyRoom</h1>
          <p className="text-sm text-center text-gray-400">
            完全招待制のブログ
          </p>
          
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="invitation_code" className="block text-sm mb-2">
                招待コード
              </label>
              <input
                type="text"
                id="invitation_code"
                name="invitation_code"
                required
                disabled={isLoading}
                className="w-full bg-black border border-white px-3 py-2 text-white focus:outline-none focus:border-gray-400 font-mono disabled:opacity-50"
                placeholder="招待コードを入力"
                autoComplete="off"
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '確認中...' : '入室'}
            </button>
          </form>
        </div>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          ※ コードが違います。管理人に連絡してください。
        </p>
      </div>
    </div>
  )
}


