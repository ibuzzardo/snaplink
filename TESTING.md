# SnapLink Testing Guide

**Comprehensive testing strategy for SnapLink MVP**

---

## Test Levels

### 1. Unit Tests (Vitest)
Test individual functions and utilities in isolation.

**Files:**
- `src/__tests__/lib/slug.test.ts` — Slug generation and validation
- `src/__tests__/lib/validation.test.ts` — Input validation schemas

**Run:**
```bash
npm run test
npm run test:coverage
```

**Coverage Target:** >80% for lib/ utilities

---

### 2. Integration Tests (Vitest + MSW)
Test API routes and database operations.

**Setup:** Mock Service Worker (MSW) for HTTP mocking

**Tests (to create):**
- Auth flow: signup → signin → session → signout
- Link creation → listing → analytics aggregation
- Error handling and validation

**Run:**
```bash
npm run test
```

---

### 3. E2E Tests (Playwright)
Test complete user workflows end-to-end.

**Setup:** Playwright with headless browser

**Tests (to create):**
- Landing page → Shorten URL → Get short link
- Sign up → Create link → View dashboard → Delete link
- Sign in → View analytics → Update profile
- OAuth sign in (GitHub)

**Run:**
```bash
npm run test:e2e
```

**Playwright Config:**
```javascript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### 4. Performance Tests
Verify performance targets are met.

**Metrics to Measure:**
- Redirect latency: <100ms p95
- API latency: <200ms p95
- Page load time: <2s
- Database query time: <1s

**Tools:**
- Chrome DevTools (in CI)
- Lighthouse (automated)
- Custom timing middleware

**Example:**
```typescript
// Measure API response time
const start = Date.now();
const response = await trpc.links.create.mutate({ url: 'https://example.com' });
const duration = Date.now() - start;
expect(duration).toBeLessThan(200);
```

---

### 5. Security Tests
Verify security measures are in place.

**OWASP Top-10:**
- ✅ A1: Injection — Drizzle ORM parameterized queries
- ✅ A2: Broken Auth — NextAuth.js + bcrypt
- ✅ A3: Sensitive Data Exposure — HTTPS, secure cookies
- ✅ A4: XML External Entity — Not applicable
- ✅ A5: Broken Access Control — Ownership checks
- ✅ A6: Security Misconfiguration — Security headers
- ✅ A7: XSS — React auto-escaping + CSP
- ✅ A8: Insecure Deserialization — N/A
- ✅ A9: Using Components with Known Vulnerabilities — Dependabot
- ✅ A10: Insufficient Logging/Monitoring — Sentry

**Manual Tests:**
```bash
# SQL Injection attempt
POST /api/trpc/links.create
{ "url": "' OR '1'='1" }
# Should reject with validation error

# XSS attempt
POST /api/trpc/links.create
{ "url": "https://example.com\"><script>alert('xss')</script>" }
# Should escape or reject

# CSRF attempt
POST /api/trpc/links.create without CSRF token
# Should fail (NextAuth protects)
```

---

### 6. Load Testing
Verify performance under load.

**Tools:** k6, Apache JMeter, or Artillery

**Scenario:**
- 100 concurrent users
- Create links over 5 minutes
- Measure response times and error rates

**Example (k6):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  const res = http.post('http://localhost:3000/api/trpc/links.create', {
    url: 'https://example.com',
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

---

## Manual Testing Checklist

### Landing Page
- [ ] URL shortening form loads
- [ ] Can enter valid URL
- [ ] Custom slug input works
- [ ] Submit creates link
- [ ] Short URL displayed and copyable
- [ ] "Sign in" button navigates to auth page
- [ ] Responsive on mobile/tablet/desktop

### Authentication
- [ ] Sign up with email/password
  - [ ] Validates email format
  - [ ] Validates password strength
  - [ ] Rejects duplicate email
  - [ ] Creates user and logs in
  - [ ] Redirects to dashboard
- [ ] Sign in with credentials
  - [ ] Rejects invalid email/password
  - [ ] Creates session
  - [ ] Maintains session on page reload
- [ ] Sign in with GitHub
  - [ ] Redirects to GitHub
  - [ ] Creates/links account
  - [ ] Redirect back to app
- [ ] Sign out
  - [ ] Clears session
  - [ ] Redirects to home

### Dashboard
- [ ] Displays user's links
- [ ] Pagination works (if 10+ links)
- [ ] Can create new link
  - [ ] Form validates URL
  - [ ] Custom slug validation
  - [ ] Link appears in table
- [ ] Can view link analytics
  - [ ] Charts load
  - [ ] Metrics display
- [ ] Can edit link
  - [ ] Updates original URL
  - [ ] Existing short code preserved
- [ ] Can delete link
  - [ ] Soft delete (analytics preserved)
  - [ ] Removed from table
- [ ] Can copy short URL
  - [ ] Copies to clipboard
  - [ ] Shows confirmation

### Analytics Page
- [ ] Loads analytics for link
- [ ] Shows total clicks
- [ ] Shows unique clicks
- [ ] Click-over-time chart renders
- [ ] Device breakdown pie chart renders
- [ ] Top referrers table displays
- [ ] Top countries table displays
- [ ] Browser breakdown table displays
- [ ] Period selector works (hour/day/week/month)

### Account Settings
- [ ] Profile tab
  - [ ] Displays current name/email
  - [ ] Can update name
  - [ ] Can update email
  - [ ] Validates email uniqueness
- [ ] Password tab
  - [ ] Validates current password
  - [ ] Validates new password strength
  - [ ] Requires confirmation
  - [ ] Updates password
- [ ] Danger zone tab
  - [ ] Requires password confirmation
  - [ ] Soft deletes account
  - [ ] Session ends

### Redirect Endpoint
- [ ] GET /:slug redirects to original URL
- [ ] Returns 301 (permanent redirect)
- [ ] Invalid slug returns 404
- [ ] Deleted link returns 410
- [ ] Click event recorded (<5s latency)
- [ ] Analytics updated within 1 minute

### Error Handling
- [ ] Invalid URL shows error
- [ ] Duplicate slug shows error
- [ ] Missing required fields show error
- [ ] Unauthorized access shows 401
- [ ] Forbidden access shows 403
- [ ] Server errors show friendly message
- [ ] Errors appear in Sentry

### Performance
- [ ] Landing page loads <1s
- [ ] Dashboard loads <2s
- [ ] Analytics page loads <2s
- [ ] Redirect happens <100ms
- [ ] API calls complete <200ms
- [ ] No memory leaks on dashboard
- [ ] Charts render smoothly

### Security
- [ ] HTTPS enforced in production
- [ ] Cookies are HttpOnly
- [ ] CSRF tokens present
- [ ] XSS attempts blocked
- [ ] SQL injection attempts rejected
- [ ] Rate limiting blocks abusers
- [ ] Passwords hashed (not stored)
- [ ] IP hashed in analytics

---

## Continuous Integration

### GitHub Actions Workflow
```bash
# On PR:
- Run linting (ESLint)
- Run type checking (TypeScript)
- Run unit tests (Vitest)
- Generate coverage report
- Build Docker image

# On merge to main:
- All above
- Push Docker image to registry
- Deploy to Coolify
- Notify Slack
```

---

## Smoke Tests (Post-Deployment)

After deploying to production, run these quick checks:

```bash
# Health check
curl https://snaplink.72.60.194.93.nip.io/api/health
# Should return { "status": "ok" }

# Create link
curl -X POST https://snaplink.72.60.194.93.nip.io/api/trpc/links.create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
# Should return slug and shortUrl

# Test redirect
curl -L https://snaplink.72.60.194.93.nip.io/abc123
# Should redirect to original URL

# Check monitoring
# Visit Sentry dashboard → See releases
# Check Slack → See deployment notification
```

---

## Debugging Tips

### Common Issues

**"Cannot find module '@/lib/trpc'"**
- Check paths in `tsconfig.json`
- Rebuild: `npm run build`

**"Session is null in protected route"**
- Check `NEXTAUTH_SECRET` is set
- Verify cookie in browser DevTools
- Check NextAuth logs

**"Database connection timeout"**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` is correct
- Verify network connectivity
- Check firewall rules

**"Rate limit exceeded"**
- Wait for window to reset (1 hour for anonymous)
- Or use different IP/user

**"CORS error in browser"**
- tRPC doesn't need CORS (same-origin)
- Check if calling external API from client

---

## Test Data

### Sample URLs
- Short: `https://google.com`
- Medium: `https://example.com/api/users/123/details?tab=profile`
- Long: `https://shop.example.com/products/very-long-product-name-with-many-keywords/reviews?filter=5stars&sort=date&page=2`

### Sample Slugs
- Valid: `my-link`, `abc123`, `test-2024`
- Invalid: `UPPERCASE`, `my link`, `my_link`, `admin`, `api`

### Test Accounts
```
Email: test@example.com
Password: TestPassword123

Email: demo@example.com
Password: DemoPassword456
```

---

**Last Updated:** 2026-02-19  
**Next:** Phase 7 QA & Testing

