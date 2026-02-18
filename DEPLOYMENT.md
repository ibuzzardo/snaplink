# SnapLink Deployment Guide

**Target Environment:** Hostinger VPS (72.60.194.93) via Coolify  
**Domain:** snaplink.72.60.194.93.nip.io  
**Status:** Ready for deployment  

---

## Pre-Deployment Checklist

- [ ] GitHub repo created: `ibuzzardo/snaplink`
- [ ] Repository settings:
  - [ ] Require branch protection on `main`
  - [ ] Require status checks to pass (CI/CD)
  - [ ] Dismiss stale PR approvals
- [ ] Secrets configured in GitHub:
  - [ ] `COOLIFY_TOKEN` — Coolify API token
  - [ ] `COOLIFY_WEBHOOK_URL` — Coolify webhook endpoint
  - [ ] `SLACK_WEBHOOK` — Slack channel webhook
  - [ ] `SENTRY_AUTH_TOKEN` — Sentry auth token
- [ ] Environment variables prepared (see .env.example)
- [ ] PostgreSQL database created on VPS
- [ ] Coolify application configured

---

## Step 1: Initialize GitHub Repository

```bash
# Create empty repo on GitHub (ibuzzardo/snaplink)

cd snaplink-app

# Initialize git and push
git init
git add .
git commit -m "Initial commit: SnapLink v1.0.0 MVP"
git branch -M main
git remote add origin https://github.com/ibuzzardo/snaplink.git
git push -u origin main
```

---

## Step 2: Configure GitHub Actions Secrets

In GitHub repo settings → Secrets and variables:

```
COOLIFY_TOKEN=<your-coolify-api-token>
COOLIFY_WEBHOOK_URL=https://coolify.72.60.194.93/api/webhooks/trigger/<app-id>
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SENTRY_AUTH_TOKEN=<sentry-auth-token>
```

---

## Step 3: Setup Coolify Application

### 3.1 Connect Docker Registry
```bash
# SSH into VPS
ssh root@72.60.194.93

# Coolify already running on port 3000 (or configured port)
# Navigate to https://coolify.72.60.194.93/
```

### 3.2 Create Application
1. Go to Applications → New Application
2. Connect GitHub repository: `ibuzzardo/snaplink`
3. Select branch: `main`
4. Configure deployment:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Port:** 3000
   - **Root directory:** `/`
   - **Auto-deploy:** Enabled

### 3.3 Configure Environment Variables

In Coolify application settings:

```env
DATABASE_URL=postgresql://snaplink:${DB_PASSWORD}@postgres:5432/snaplink
NEXTAUTH_SECRET=<generate-32-char-secret>
NEXTAUTH_URL=https://snaplink.72.60.194.93.nip.io
GITHUB_ID=<github-oauth-app-id>
GITHUB_SECRET=<github-oauth-app-secret>
SENTRY_DSN=https://<key>@sentry.72.60.194.93:9000/<project-id>
SENTRY_AUTH_TOKEN=<auth-token>
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://snaplink.72.60.194.93.nip.io
```

### 3.4 Configure PostgreSQL Service

In Coolify:
1. Create PostgreSQL service (if not using existing)
2. Database name: `snaplink`
3. User: `snaplink`
4. Password: Generate strong password
5. Port: 5432

Or use existing database with environment variables.

### 3.5 Setup Health Check

In Coolify application settings:
- **Health check URL:** `/api/health`
- **Expected status:** 200
- **Interval:** 30s
- **Timeout:** 5s

---

## Step 4: Database Setup

### 4.1 Connect to Database

```bash
# Via SSH tunnel to VPS
psql postgresql://snaplink:password@localhost:5432/snaplink
```

### 4.2 Run Migrations

```bash
# In Coolify, run as build post-command or manual step
npm run db:migrate
```

---

## Step 5: Test Deployment

### 5.1 Check Application Status

```bash
# Health check
curl https://snaplink.72.60.194.93.nip.io/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-02-19T...",
  "uptime": ...,
  "checks": { "database": { "status": "ok", "responseTime": ... } }
}
```

### 5.2 Test Core Functionality

1. **Landing page:** Visit https://snaplink.72.60.194.93.nip.io/
2. **Anonymous shortening:** Create a test short URL
3. **Redirect test:** Click the short URL, verify redirect
4. **Authentication:** Sign up with email/password or GitHub
5. **Dashboard:** View created links
6. **Analytics:** Check click counts

---

## Step 6: Setup Domain Name (Optional)

If using custom domain instead of nip.io:

### 6.1 Update DNS Records

```
A record: snaplink.yourdomain.com → 72.60.194.93
```

### 6.2 Update Coolify Settings
- Change domain to: `snaplink.yourdomain.com`
- Let Coolify handle SSL/TLS (automatic via Let's Encrypt)

### 6.3 Update Environment Variables
```bash
NEXTAUTH_URL=https://snaplink.yourdomain.com
NEXT_PUBLIC_API_URL=https://snaplink.yourdomain.com
```

---

## Step 7: Monitoring & Alerts

### 7.1 Sentry Configuration

```bash
# Initialize Sentry in app (already done in next.config.js)
# Verify in Sentry dashboard:
#   - Releases appear on new deployments
#   - Errors are captured
#   - Performance metrics are tracked
```

### 7.2 Slack Notifications

```bash
# GitHub Actions will send notifications on:
#   - Successful deployments ✅
#   - Failed deployments ❌
#   - See .github/workflows/ci-cd.yml
```

### 7.3 Health Check Monitoring

```bash
# Optional: Setup external monitoring (e.g., UptimeRobot)
# Health endpoint: https://snaplink.72.60.194.93.nip.io/api/health
# Check every 5 minutes
```

---

## Step 8: Backup & Disaster Recovery

### 8.1 Database Backups

```bash
# Configure automatic backups via Coolify
# Or manual:
pg_dump postgresql://snaplink:password@localhost/snaplink > backup.sql

# Restore:
psql postgresql://snaplink:password@localhost/snaplink < backup.sql
```

### 8.2 Disaster Recovery Plan

1. **Database failure:** Restore from latest backup
2. **Application crash:** Coolify restarts container automatically
3. **Full VPS failure:** Restore from Hostinger backup, redeploy via Coolify

---

## Rollback Procedure

If deployment causes issues:

```bash
# Option 1: GitHub — Revert commit
git revert <commit-hash>
git push origin main
# Coolify auto-deploys with reverted code

# Option 2: Coolify — Manual rollback
# Go to Coolify Application → Deployments
# Select previous deployment → Rollback
```

---

## Post-Deployment Verification

### Checklist

- [ ] Application accessible at domain
- [ ] Health check returns 200 OK
- [ ] Database connected (check /api/health)
- [ ] Redirect endpoint works (<100ms)
- [ ] Authentication working (signup, login, OAuth)
- [ ] Dashboard loads analytics data
- [ ] Sentry capturing errors
- [ ] Slack notifications working
- [ ] GitHub Actions pipeline passing
- [ ] No critical errors in logs

### Performance Metrics

- [ ] Redirect latency p95 <100ms
- [ ] API latency p95 <200ms
- [ ] Dashboard load time <2s
- [ ] Database query time <1s

---

## Scaling Considerations (v2+)

- **Horizontal scaling:** Add more app instances behind load balancer
- **Database replication:** Setup read replicas for analytics queries
- **Caching layer:** Redis for sessions and hot link data
- **CDN:** Cloudflare for static assets and edge caching
- **Database sharding:** If click data exceeds 100M rows/month

---

## Troubleshooting

### App won't start
```bash
# Check logs in Coolify
# Verify DATABASE_URL is correct
# Ensure database is accessible
# Check environment variables are set
npm run db:migrate  # May need to run migrations
```

### Database connection timeout
```bash
# Verify PostgreSQL service is running
# Check firewall rules (port 5432)
# Verify credentials in DATABASE_URL
# Increase connection timeout in drizzle config
```

### Redirect endpoint slow
```bash
# Check database indexes: CREATE INDEX idx_links_slug ON links(slug)
# Monitor query performance in logs
# Consider adding Redis cache in v2
```

### High error rate
```bash
# Check Sentry dashboard for error patterns
# Review application logs
# Check GitHub Actions CI/CD for recent changes
# Rollback if necessary
```

---

## Contact & Support

- **Deployment issues:** Check Coolify logs + Sentry
- **Database issues:** Check PostgreSQL logs
- **Application errors:** See Sentry dashboard
- **CI/CD failures:** Check GitHub Actions workflow

---

**Deployment Status:** ✅ Ready  
**Last Updated:** 2026-02-19  
**Next Steps:** Execute deployment steps 1-8 above

