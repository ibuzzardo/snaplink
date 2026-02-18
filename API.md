# SnapLink API Documentation

**Base URL:** `https://snaplink.72.60.194.93.nip.io` or `http://localhost:3000`  
**API Version:** 1.0.0  
**Protocol:** tRPC (type-safe RPC)  

---

## Overview

SnapLink uses **tRPC** for all API communication. This provides:
- **Type Safety:** Full TypeScript inference client → server
- **Automatic Serialization:** SuperJSON handles complex types
- **Error Handling:** Standardized error codes and messages
- **Authentication:** Session-based with NextAuth.js

### Endpoint Pattern
All tRPC procedures are accessible via:
```
POST /api/trpc/<router>.<procedure>
```

### Client Usage
```typescript
import { trpc } from '@/lib/trpc';

// Create short link
const { data, error, isLoading } = trpc.links.create.useMutation({
  onSuccess: (data) => console.log(data),
  onError: (error) => console.error(error),
});

// Call mutation
data.mutate({ url: 'https://example.com' });
```

---

## Authentication

### Session Management
- **Strategy:** JWT-based sessions (NextAuth.js)
- **Duration:** 30 days
- **Cookie:** Secure, HttpOnly, SameSite=Lax
- **Refresh:** Automatic (24-hour soft refresh)

### Required Headers
```
Cookie: next-auth.session-token=<token>
```

### Public vs Protected Procedures
- **Public:** Anyone can call (no auth required)
- **Protected:** Requires valid session (auth required)

---

## Router: `links`

### `links.create` (Public)
Create a new short link.

**Input:**
```typescript
{
  url: string;        // Full URL (required)
  customSlug?: string; // Optional custom slug (3-20 chars)
}
```

**Output:**
```typescript
{
  slug: string;
  shortUrl: string;
  createdAt: Date;
}
```

**Errors:**
- `CONFLICT` — Slug already in use
- `BAD_REQUEST` — Invalid URL or slug format
- `INTERNAL_SERVER_ERROR` — Database error

**Example:**
```bash
curl -X POST http://localhost:3000/api/trpc/links.create \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very/long/url",
    "customSlug": "my-link"
  }'
```

---

### `links.list` (Protected)
Get paginated list of user's links.

**Input:**
```typescript
{
  page?: number;   // Default: 1
  limit?: number;  // Default: 10, Max: 100
}
```

**Output:**
```typescript
{
  data: Array<{
    id: string;
    slug: string;
    originalUrl: string;
    createdAt: Date;
    shortUrl: string;
  }>;
  total: number;
  page: number;
  pages: number;
}
```

**Errors:**
- `UNAUTHORIZED` — Not logged in

---

### `links.get` (Public*)
Get details for a single link.
*Protected if link is owned by authenticated user

**Input:**
```typescript
{
  slug: string;
}
```

**Output:**
```typescript
{
  id: string;
  slug: string;
  originalUrl: string;
  createdAt: Date;
  customSlug: boolean;
  shortUrl: string;
}
```

**Errors:**
- `NOT_FOUND` — Link doesn't exist
- `FORBIDDEN` — Not the link owner
- `UNAUTHORIZED` — Protected link, must be logged in

---

### `links.update` (Protected)
Update a link's destination URL.

**Input:**
```typescript
{
  slug: string;
  originalUrl: string;
}
```

**Output:**
```typescript
{
  slug: string;
  originalUrl: string;
  updatedAt: Date;
}
```

**Errors:**
- `NOT_FOUND` — Link doesn't exist
- `FORBIDDEN` — Not the link owner
- `UNAUTHORIZED` — Not logged in

---

### `links.delete` (Protected)
Soft-delete a link (analytics preserved).

**Input:**
```typescript
{
  slug: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

**Errors:**
- `NOT_FOUND` — Link doesn't exist
- `FORBIDDEN` — Not the link owner
- `UNAUTHORIZED` — Not logged in

---

## Router: `analytics`

### `analytics.get` (Public)
Get analytics data for a link.

**Input:**
```typescript
{
  slug: string;
  period?: 'hour' | 'day' | 'week' | 'month'; // Default: 'day'
}
```

**Output:**
```typescript
{
  slug: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksByTime: Array<{
    timestamp: Date;
    clicks: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    clicks: number;
  }>;
  topCountries: Array<{
    country: string;
    clicks: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  browserBreakdown: Array<{
    browser: string;
    clicks: number;
  }>;
}
```

**Errors:**
- `NOT_FOUND` — Link doesn't exist

**Notes:**
- Returns last 24 hours for `hour` period
- Returns last 7 days for `week` period
- Returns last 30 days for `month` period

---

## Router: `user`

### `user.profile` (Protected)
Get current user's profile.

**Input:** None

**Output:**
```typescript
{
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
```

**Errors:**
- `UNAUTHORIZED` — Not logged in

---

### `user.update` (Protected)
Update user's profile information.

**Input:**
```typescript
{
  name?: string;
  email?: string;
}
```

**Output:**
```typescript
{
  id: string;
  email: string;
  name: string;
}
```

**Errors:**
- `UNAUTHORIZED` — Not logged in
- `CONFLICT` — Email already in use

---

### `user.changePassword` (Protected)
Change user's password.

**Input:**
```typescript
{
  oldPassword: string;
  newPassword: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

**Errors:**
- `UNAUTHORIZED` — Not logged in or invalid current password
- `BAD_REQUEST` — New password doesn't meet requirements

---

### `user.deleteAccount` (Protected)
Permanently delete user account and all associated data.

**Input:**
```typescript
{
  password: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

**Errors:**
- `UNAUTHORIZED` — Invalid password
- `NOT_FOUND` — User doesn't exist

---

## Public HTTP Endpoints

### Redirect Endpoint
```
GET /:slug
```

**Response:**
- `301` redirect to original URL
- Click event recorded asynchronously
- No JSON response (HTTP redirect)

**Example:**
```bash
curl -i http://localhost:3000/abc123
# HTTP/1.1 301 Moved Permanently
# Location: https://example.com/target
```

---

### Health Check
```
GET /api/health
```

**Response:**
```typescript
{
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime: number;
    };
  };
}
```

**Use For:**
- Load balancer health checks
- Uptime monitoring
- Docker container health checks

---

## Error Responses

All errors follow this format:

```typescript
{
  code: string;
  message: string;
  data?: any;
}
```

**Common Error Codes:**
- `PARSE_ERROR` — Request parsing failed
- `BAD_REQUEST` — Invalid input
- `UNAUTHORIZED` — Not authenticated
- `FORBIDDEN` — Not authorized for this resource
- `NOT_FOUND` — Resource doesn't exist
- `CONFLICT` — Resource already exists
- `INTERNAL_SERVER_ERROR` — Server error

---

## Rate Limiting

### Anonymous Users
- **Limit:** 5 requests/hour
- **Identifier:** IP address
- **Scope:** Entire application

### Authenticated Users
- **Limit:** 100 requests/minute per user
- **Identifier:** User ID
- **Scope:** All tRPC procedures

### Redirect Endpoint
- **Limit:** 1000 requests/minute per link
- **Identifier:** IP address
- **Scope:** GET /:slug only

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Authentication Flows

### Email/Password Sign Up
```
1. POST /api/auth/register (email, password, name)
2. User account created
3. Auto-sign in via credentials provider
4. Session token issued
```

### Email/Password Sign In
```
1. POST /api/auth/signin (provider: 'credentials', email, password)
2. Credentials validated against hashed password
3. Session token issued
4. Redirect to /dashboard
```

### GitHub OAuth
```
1. User clicks "Sign in with GitHub"
2. Redirected to GitHub authorization page
3. User authorizes SnapLink app
4. GitHub redirects back with authorization code
5. SnapLink exchanges code for access token
6. User account created or linked
7. Session token issued
8. Redirect to /dashboard
```

### Sign Out
```
1. User clicks "Sign Out"
2. Session token deleted
3. Cookies cleared
4. Redirect to home page
```

---

## Examples

### TypeScript Client
```typescript
import { trpc } from '@/lib/trpc';

// Create link
const createLinkMutation = trpc.links.create.useMutation();
createLinkMutation.mutate({
  url: 'https://example.com',
  customSlug: 'my-link',
});

// List links
const { data: links } = trpc.links.list.useQuery({ page: 1, limit: 10 });

// Get analytics
const { data: analytics } = trpc.analytics.get.useQuery({ slug: 'abc123' });

// Update profile
const updateProfile = trpc.user.update.useMutation();
updateProfile.mutate({ name: 'John Doe' });
```

### cURL Examples
```bash
# Create link
curl -X POST http://localhost:3000/api/trpc/links.create \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -d '{"json": {"url": "https://example.com"}}'

# Get analytics
curl http://localhost:3000/api/trpc/analytics.get?input=%7B%22json%22:%7B%22slug%22:%22abc123%22%7D%7D

# Health check
curl http://localhost:3000/api/health
```

---

## Pagination

List endpoints support pagination:

```typescript
trpc.links.list.useQuery({
  page: 2,      // Page number (1-indexed)
  limit: 25,    // Items per page (1-100)
});
```

Response includes:
```typescript
{
  data: [...],
  total: 500,    // Total items across all pages
  page: 2,       // Current page
  pages: 20,     // Total pages
}
```

---

## Versioning

API version is included in responses:
```
X-API-Version: 1.0.0
```

Breaking changes will increment the version number.

---

## Support

- **Documentation:** This file
- **Issues:** https://github.com/ibuzzardo/snaplink/issues
- **Discussions:** https://github.com/ibuzzardo/snaplink/discussions

---

**Last Updated:** 2026-02-19  
**Status:** MVP Ready  

