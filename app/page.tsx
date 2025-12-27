import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/libs/auth'
import LoginForm from './components/LoginForm'

export default async function Home() {
  const user = await getCurrentUser()
  
  // 既にログインしている場合はブログページにリダイレクト
  if (user) {
    redirect('/blog')
  }

  return <LoginForm />
}

