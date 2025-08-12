import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`[Middleware] Processing: ${pathname}`)
  
  // Check for client-side auth status cookie
  const clientAuthStatus = request.cookies.get('client-auth-status')?.value
  
  // Get all cookies for debugging
  const allCookies = request.cookies.getAll()
  console.log('[Middleware] Available cookies:', allCookies.map(c => c.name))
  console.log('[Middleware] Client auth status:', clientAuthStatus)
  
  // Check for Supabase session cookies
  const hasSupabaseTokens = (
    request.cookies.has('sb-access-token') ||
    request.cookies.has('supabase-auth-token') ||
    request.cookies.has('sb-refresh-token') ||
    request.cookies.has('supabase-refresh-token') ||
    allCookies.some(cookie => 
      cookie.name.includes('supabase') && 
      cookie.name.includes('token') &&
      !cookie.name.includes('hmr')
    )
  )
  
  // Consider user authenticated if either cookies or client header indicates so
  const isAuthenticated = hasSupabaseTokens || clientAuthStatus === 'authenticated'
  
  console.log('[Middleware] hasSupabaseTokens:', hasSupabaseTokens)
  console.log('[Middleware] isAuthenticated:', isAuthenticated)
  
  // Define route types
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth')
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/chat')
  const isPublicRoute = pathname === '/' || pathname.startsWith('/api')
  
  console.log(`[Middleware] Route analysis - Auth: ${isAuthRoute}, Protected: ${isProtectedRoute}, Public: ${isPublicRoute}`)
  
  // Prevent redirect loops by checking for redirected parameter
  const url = request.nextUrl.clone()
  const hasRedirectedParam = url.searchParams.has('redirected')
  
  if (hasRedirectedParam) {
    console.log('[Middleware] Redirected parameter detected, allowing request')
    // Remove the redirected parameter to clean up URL
    url.searchParams.delete('redirected')
    return NextResponse.rewrite(url)
  }
  
  // If user is authenticated but is on auth route, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    console.log('[Middleware] Authenticated user on auth route, redirecting to dashboard')
    url.pathname = '/dashboard'
    url.searchParams.set('redirected', 'true')
    return NextResponse.redirect(url)
  }
  
  // If user is not authenticated and is on protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    console.log('[Middleware] Unauthenticated user on protected route, redirecting to login')
    url.pathname = '/login'
    url.searchParams.set('redirected', 'true')
    return NextResponse.redirect(url)
  }
  
  console.log('[Middleware] Allowing request to proceed')
  return NextResponse.next()
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
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
