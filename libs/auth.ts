import { cookies } from 'next/headers'

export interface User {
  id: string
  name: string
  role: 'admin' | 'member'
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('cozyroom_user_id')?.value
  const userName = cookieStore.get('cozyroom_user_name')?.value
  const userRole = cookieStore.get('cozyroom_user_role')?.value as 'admin' | 'member' | undefined

  if (!userId || !userName || !userRole) {
    return null
  }

  return {
    id: userId,
    name: userName,
    role: userRole,
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}




