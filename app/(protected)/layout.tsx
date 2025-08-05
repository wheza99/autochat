'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth-provider'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    // Jika user belum login, redirect ke halaman login
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Tampilkan loading saat mengecek authentication status
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Checking authentication status
          </div>
        </div>
      </div>
    )
  }

  // Jika user belum login, jangan render children (akan redirect)
  if (!user) {
    return null
  }

  // Render halaman protected untuk user yang sudah login
  return <>{children}</>
}