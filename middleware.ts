import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    const isLoginPage = req.nextUrl.pathname === '/admin/login';

    // Allow login page
    if (isLoginPage) {
      return NextResponse.next();
    }

    // Redirect to login if no token
    if (isAdminRoute && !token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Allow any authenticated user with a role (not just admin)
    // If you want to restrict to specific roles, you can modify this check
    if (isAdminRoute && token && !(token as any).role) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
        const isLoginPage = req.nextUrl.pathname === '/admin/login';

        if (isLoginPage) {
          return true;
        }

        // Allow any authenticated user with a role to access admin panel
        // Modify this to restrict to specific roles if needed
        if (isAdminRoute) {
          return !!token && !!(token as any).role;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
