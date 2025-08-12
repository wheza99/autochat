'use client'

import { useEffect } from 'react'
import { AuthClient } from '@/lib/auth-client'

// Component untuk mengelola status autentikasi via cookie untuk middleware
export function AuthHeaderProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Function to update auth status cookie
    const updateAuthCookie = () => {
      if (AuthClient.isAuthenticated()) {
        document.cookie = 'client-auth-status=authenticated; path=/; max-age=86400; SameSite=Lax'
      } else {
        document.cookie = 'client-auth-status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }
    
    // Set initial auth status
    updateAuthCookie()
    
    // Update auth status periodically
    const interval = setInterval(updateAuthCookie, 5000) // Check every 5 seconds
    
    // Listen for storage changes (when localStorage is updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase-auth-status') {
        updateAuthCookie()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  return <>{children}</>
}