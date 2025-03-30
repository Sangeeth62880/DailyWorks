import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/post-job") || pathname.startsWith("/jobs/apply")

  // Check if the path is auth-related
  const isAuthPath = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")

  // Get the token
  const token = await getToken({ req: request })

  // If the path is protected and the user is not authenticated, redirect to login
  if (isProtectedPath && !token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/post-job/:path*", "/jobs/:path*/apply", "/auth/login", "/auth/register"],
}

