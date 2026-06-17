import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

const LOGIN_PATH = '/admin/login';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  const isAuthed = Boolean(session);

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  // The login page is always reachable; bounce already-authed users to /admin.
  if (pathname === LOGIN_PATH) {
    if (isAuthed) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // Block unauthenticated access to admin pages and admin APIs.
  if (!isAuthed && (isAdminPage || isAdminApi)) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to login, remembering where the user was headed.
    const loginUrl = new URL(LOGIN_PATH, req.url);
    // Only preserve internal admin destinations to avoid open redirects.
    if (pathname.startsWith('/admin')) {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated (or a public matched route like /api/jobs): forward the
  // request, tagging it with the admin role header that route handlers expect.
  if (isAuthed) {
    const headers = new Headers(req.headers);
    headers.set('x-admin-role', 'true');
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/jobs/:path*'],
};
