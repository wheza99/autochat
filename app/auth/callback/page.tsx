// Halaman callback untuk menangani proses autentikasi OAuth
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error during auth callback:', error)
        router.push('/login?error=auth_callback_error')
        return
      }

      if (data.session) {
        // Redirect to dashboard or home page after successful login
        router.push('/')
      } else {
        // No session found, redirect back to login
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing login...</p>
      </div>
    </div>
  )
}