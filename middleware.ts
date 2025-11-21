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

    // Check admin role
    if (isAdminRoute && token && (token as any).role !== 'admin') {
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

        if (isAdminRoute) {
          return !!token && (token as any).role === 'admin';
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};

