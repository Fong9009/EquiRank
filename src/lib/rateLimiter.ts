import { NextRequest } from 'next/server';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
};

export const STRICT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window for sensitive endpoints
  message: 'Too many requests from this IP, please try again later.'
};

export function getClientIP(request: NextRequest): string {
  // Get IP from various headers (considering proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Clean up expired entries
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
  
  // Get or create rate limit entry for this IP
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }
  
  const entry = rateLimitStore[ip];
  
  // Check if window has reset
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;
  }
  
  // Increment count
  entry.count++;
  
  const allowed = entry.count <= config.max;
  const remaining = Math.max(0, config.max - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime
  };
}

export function createRateLimitHeaders(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Record<string, string> {
  const result = checkRateLimit(request, config);
  
  return {
    'X-RateLimit-Limit': config.max.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    'X-RateLimit-Reset-Time': result.resetTime.toString()
  };
}
