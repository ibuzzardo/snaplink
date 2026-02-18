# SnapLink — Production-Ready URL Shortener

A modern, full-stack URL shortening service with real-time analytics, built with Next.js, PostgreSQL, and tRPC.

## Features

✨ **Core Features**
- 🔗 URL shortening with random or custom slugs
- 📊 Real-time click analytics and insights
- 🔐 User authentication (Email/Password + GitHub OAuth)
- 🎯 Link management dashboard
- 📱 Responsive design (mobile, tablet, desktop)
- 🚀 High-performance redirect endpoint (<100ms p95)
- 🔒 Security-first architecture (OWASP top-10)
- 📈 Click tracking with geographic & device data
- 🛡️ Rate limiting (prevent abuse)
- 🧪 Comprehensive test coverage
- 📝 Full API documentation (tRPC)
- 🐳 Docker containerization
- ⚙️ CI/CD pipeline (GitHub Actions)
- 📡 Error tracking (Sentry integration)

## Tech Stack

**Frontend:**
- Next.js 14 (App Router + API Routes)
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui
- tRPC Client

**Backend:**
- Next.js API Routes
- tRPC Server
- Node.js + PostgreSQL
- Drizzle ORM (type-safe queries)
- NextAuth.js (authentication)

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 16
- Sentry (error tracking)
- GitHub Actions (CI/CD)
- Coolify (deployment orchestration)

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- GitHub OAuth app (for GitHub login)

### Local Development

1. **Clone & Install**
   ```bash
   git clone https://github.com/ibuzzardo/snaplink.git
   cd snaplink
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Start Database**
   ```bash
   docker-compose up postgres -d
   ```

4. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start Dev Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. **Build & Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Deploy to Coolify**
   ```bash
   # Configure Coolify webhook in GitHub Actions secrets
   # Push to main branch to trigger automatic deployment
   git push origin main
   ```

## API Documentation

### tRPC Procedures

#### Links Router
```typescript
// Create short link
POST /api/trpc/links.create
{
  url: string;        // Full URL
  customSlug?: string; // Optional 3-20 char slug
}
→ { slug, shortUrl, createdAt }

// List user's links (paginated)
GET /api/trpc/links.list?page=1&limit=10
→ { data: Link[], total, page, pages }

// Get link details
GET /api/trpc/links.get?slug=abc123
→ { id, slug, originalUrl, createdAt, customSlug }

// Update link destination
POST /api/trpc/links.update
{ slug, originalUrl }
→ { slug, originalUrl, updatedAt }

// Delete link (soft delete)
POST /api/trpc/links.delete
{ slug }
→ { success }
```

#### Analytics Router
```typescript
// Get analytics for a link
GET /api/trpc/analytics.get?slug=abc123&period=day
→ {
    slug,
    totalClicks,
    uniqueClicks,
    clicksByTime: Array<{ timestamp, clicks }>,
    topReferrers: Array<{ referrer, clicks }>,
    topCountries: Array<{ country, clicks }>,
    deviceBreakdown: { mobile, tablet, desktop },
    browserBreakdown: Array<{ browser, clicks }>
  }
```

#### User Router
```typescript
// Get user profile
GET /api/trpc/user.profile
→ { id, email, name, createdAt }

// Update profile
POST /api/trpc/user.update
{ name?, email? }
→ { id, email, name }

// Change password
POST /api/trpc/user.changePassword
{ oldPassword, newPassword }
→ { success }

// Delete account
POST /api/trpc/user.deleteAccount
{ password }
→ { success }
```

### Public Endpoints
```
GET /:slug        → 301 redirect to original URL
GET /api/health   → Health check status
```

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/snaplink"

# NextAuth
NEXTAUTH_SECRET="min-32-character-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"

# Sentry (optional)
SENTRY_DSN="https://...@sentry.example.com/123"
SENTRY_AUTH_TOKEN="token"

# App
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://snaplink.example.com"
```

## Security

✅ **Implemented**
- HTTPS/TLS encryption
- bcrypt password hashing
- CSRF protection (NextAuth.js)
- SQL injection prevention (Drizzle ORM)
- XSS protection (React auto-escaping)
- Rate limiting (IP + user-based)
- Secure cookies (HttpOnly, SameSite, Secure)
- Input validation (Zod)
- OWASP top-10 compliance
- IP hashing for privacy
- Soft deletes for audit trails

## Performance

**Target Metrics:**
- Redirect latency (p95): <100ms
- API latency (p95): <200ms
- Dashboard load time: <2s
- Uptime: 99.5%

**Optimizations:**
- Database connection pooling
- Composite indexes on high-traffic queries
- In-memory session caching (v2)
- CDN for static assets (v2)
- Query result caching (v2)

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## Database

### Schema
- `users` — User accounts
- `links` — Short URLs (with references to users)
- `clicks` — Analytics events
- `sessions` — NextAuth.js session storage
- `accounts` — OAuth provider accounts
- `verification_tokens` — Email verification

### Migrations
```bash
# Generate new migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema (dev only)
npm run db:push

# Open Drizzle Studio (UI)
npm run db:studio
```

## Deployment

### Via Coolify

1. Create Coolify application
2. Connect GitHub repository
3. Set environment variables
4. Enable auto-deploy on push to `main`
5. Configure health checks

### Manual Deployment

```bash
# Build Docker image
docker build -t snaplink:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  snaplink:latest

# Health check
curl http://localhost:3000/api/health
```

### CI/CD Pipeline

GitHub Actions automatically:
1. Lints code on PR
2. Runs tests
3. Type checks
4. Builds Docker image
5. Pushes to registry
6. Deploys to Coolify (on main branch)
7. Sends Slack notifications

## Monitoring

- **Errors:** Tracked via Sentry
- **Performance:** API latency, page load time
- **Uptime:** Health check endpoint
- **Logs:** Structured logging to stdout (Docker)

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push branch: `git push origin feature/amazing-feature`
4. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Update documentation
- Run linter: `npm run lint`
- Format code: `npm run format`

## Roadmap (v2.0)

- [ ] Teams & user roles
- [ ] API key management
- [ ] Custom domains
- [ ] Webhooks for click events
- [ ] Link expiration & password protection
- [ ] CSV/PDF export
- [ ] Advanced analytics (cohorts, funnels)
- [ ] Redis caching layer
- [ ] Mobile app (React Native)
- [ ] Paid tiers & billing

## License

MIT — See [LICENSE](LICENSE) file

## Support

- 📧 Email: support@snaplink.app
- 🐛 GitHub Issues: [Report a bug](https://github.com/ibuzzardo/snaplink/issues)
- 💬 Discussions: [Ask a question](https://github.com/ibuzzardo/snaplink/discussions)

## Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Sentry](https://sentry.io/)

---

**Status:** MVP Ready | **Version:** 1.0.0 | **Last Updated:** 2026-02-19
