// Layout autentikasi dengan redirect otomatis untuk user login
'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GalleryVerticalEnd } from "lucide-react"
import { useAuthContext } from '@/components/auth-provider'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  // If user is already logged in, don't render children (will redirect)
  if (user) {
    return null
  }

  // Render auth page for users who are not logged in
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        {children}
      </div>
    </div>
  )
}