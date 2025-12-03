import { withAuth } from "next-auth/middleware"
import type { NextRequest } from "next/server"

export const middleware = withAuth(
  function middleware(request: NextRequest) {
    const token = request.nextauth.token
    const pathname = request.nextUrl.pathname

    // Role-based route protection
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return Response.redirect(new URL("/dashboard", request.url))
      }
    }

    if (pathname.startsWith("/owner")) {
      if (token?.role !== "business_owner") {
        return Response.redirect(new URL("/dashboard", request.url))
      }
    }

    if (pathname.startsWith("/investor")) {
      if (token?.role !== "investor") {
        return Response.redirect(new URL("/dashboard", request.url))
      }
    }

    return undefined
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Routes that require authentication
        const protectedRoutes = ["/admin", "/owner", "/investor", "/dashboard"]
        const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

        if (isProtectedRoute) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/owner/:path*",
    "/investor/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/api/owner/:path*",
    "/api/investor/:path*",
  ],
}
