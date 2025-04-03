import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if user is authenticated
  const isAuthenticated = !!token

  // Define protected routes
  const isAuthRoute = pathname.startsWith("/auth")
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isRecruiterRoute = pathname.startsWith("/recruiter")

  // Redirect logic
  if (isAuthRoute && isAuthenticated) {
    // If user is already logged in and tries to access auth routes
    const role = (token.role as string) || "job_finder"
    if (role === "recruiter") {
      return NextResponse.redirect(new URL("/recruiter/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  if (!isAuthenticated && (isDashboardRoute || isRecruiterRoute)) {
    // If user is not logged in and tries to access protected routes
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (isAuthenticated && isRecruiterRoute && (token.role as string) !== "recruiter") {
    // If user is not a recruiter but tries to access recruiter routes
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which paths should be processed by the middleware
export const config = {
  matcher: ["/dashboard/:path*", "/recruiter/:path*", "/auth/:path*", "/profile/:path*"],
}

