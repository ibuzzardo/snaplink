// @ts-nocheck
import { headers } from 'next/headers';

// Simple in-memory rate limiter (v1 - use Redis in v2)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// Get client IP from headers
export function getClientIp(): string {
  const headersList = headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    '127.0.0.1';
  return ip;
}

// Check rate limit for a given identifier
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = identifier;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Rate limit configurations
export const RATE_LIMITS = {
  // Anonymous users: 5 links per hour
  anonymous: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
  },
  // Authenticated users: 100 requests per minute
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Redirect endpoint: 1000 per minute per link
  redirect: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 1000,
  },
};

// Helper to get client identifier
export function getClientIdentifier(userId?: string | null): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${getClientIp()}`;
}
