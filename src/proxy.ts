import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/rider/:path*', '/orders/:path*', '/create-order/:path*', '/profile/:path*'],
};
