import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis only if URLs are provided (to prevent crashing on local without env vars)
let ratelimitTools: Ratelimit | null = null;
let ratelimitAuth: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create a new ratelimiter, that allows 100 requests per 1 minute for general API
  ratelimitTools = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/tools'
  });

  // Stricter ratelimiter for auth/admin routes (20 requests per minute)
  ratelimitAuth = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: '@upstash/ratelimit/auth'
  });
}

export async function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  let ratelimitResult;

  if (request.nextUrl.pathname.startsWith('/api/tools') && ratelimitTools) {
      ratelimitResult = await ratelimitTools.limit(ip);
  } else if ((request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname.startsWith('/api/admin')) && ratelimitAuth) {
      ratelimitResult = await ratelimitAuth.limit(ip);
  }
  
  if (ratelimitResult && !ratelimitResult.success) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'You have hit the rate limit. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': ratelimitResult.limit.toString(),
          'X-RateLimit-Remaining': ratelimitResult.remaining.toString(),
          'X-RateLimit-Reset': ratelimitResult.reset.toString(),
        }
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/tools/:path*',
    '/api/auth/:path*',
    '/api/admin/:path*'
  ],
};
