'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { onAuthChange, signOut } from '@/lib/firebase-auth'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, setLoading } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (user) login(user)
      else logout()
    })
    return unsub
  }, [login, logout])

  return <>{children}</>
}