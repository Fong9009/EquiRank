import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  // Convert to base64
  return btoa(String.fromCharCode(...array));
}

// Security middleware
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  const nonce = generateNonce();
  response.headers.set(
      'Content-Security-Policy',
      `default-src 'self'; ` +
      `script-src 'self' 'unsafe-eval' https://www.google.com https://www.gstatic.com; ` +
      `script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; ` +
      `connect-src 'self' https://www.google.com https://www.gstatic.com; ` +
      `style-src 'self' 'unsafe-inline'; ` +
      `frame-src https://www.google.com https://www.gstatic.com; ` +
      `img-src 'self' data: https:; ` +
      `font-src 'self' data:;`
  );
  response.headers.set('X-Nonce', nonce);

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
