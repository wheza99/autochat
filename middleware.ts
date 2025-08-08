// Middleware untuk autentikasi dan proteksi route aplikasi
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // This is used for setting cookies in the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          // This is used for removing cookies in the response
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // Get the current session and refresh if needed
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // If there's an error getting the session, clear auth cookies
    if (error) {
      console.error('Session error in middleware:', error)
      // Clear auth-related cookies
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
    }
    
    // Check if we're accessing a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/(protected)')
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/register') ||
                       request.nextUrl.pathname.startsWith('/forgot-password')
    
    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Redirect to dashboard if accessing auth routes with valid session
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // Clear potentially corrupted auth cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
