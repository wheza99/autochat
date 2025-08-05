import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Get the session token from cookies
  const token = req.cookies.get('sb-access-token')?.value
  
  // Define protected routes (routes that require authentication)
  const protectedRoutes = ['/', '/dashboard']
  const authRoutes = ['/login', '/register']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route) && !authRoutes.includes(req.nextUrl.pathname)
  )
  
  // If user is not signed in and trying to access protected route, redirect to /login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and trying to access auth routes, redirect to /
  if (token && authRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}