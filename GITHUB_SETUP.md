# GitHub Setup & Deployment Guide

**Status:** Ready for GitHub push  
**Repository:** `ibuzzardo/snaplink`  
**Branch:** `main`  

---

## 🚀 Step 1: Create GitHub Repository

### Option A: GitHub Web UI (Recommended)
1. Go to https://github.com/new
2. Repository name: `snaplink`
3. Owner: `ibuzzardo`
4. Description: "Production-ready URL shortener with real-time analytics"
5. Visibility: Public (or Private)
6. **Do NOT** initialize with README (we have one)
7. Click "Create repository"

### Option B: GitHub CLI
```bash
gh repo create snaplink \
  --owner=ibuzzardo \
  --public \
  --source=. \
  --description="Production-ready URL shortener with real-time analytics" \
  --homepage="https://snaplink.72.60.194.93.nip.io"
```

---

## 🔗 Step 2: Add Remote & Push

### Setup Git Remote
```bash
cd /data/.openclaw/workspace/snaplink-app

# Add remote
git remote add origin https://github.com/ibuzzardo/snaplink.git

# Verify remote
git remote -v
# Should show:
# origin  https://github.com/ibuzzardo/snaplink.git (fetch)
# origin  https://github.com/ibuzzardo/snaplink.git (push)
```

### Push to GitHub
```bash
# Push main branch
git push -u origin main

# If using SSH (recommended for security):
git remote set-url origin git@github.com:ibuzzardo/snaplink.git
git push -u origin main
```

### Expected Output
```
Enumerating objects: 100, done.
Counting objects: 100% done.
Delta compression using up to 8 threads.
Compressing objects: 100% done.
Writing objects: 100% done.
Total [size] (delta [size]), reused 0 (delta 0), pack-reused 0
remote: Reviewing deployment key... done
To https://github.com/ibuzzardo/snaplink.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🔐 Step 3: Configure GitHub Actions Secrets

These secrets are needed for automated deployment:

### In GitHub Repository Settings → Secrets and variables → Actions

**Add these secrets:**

1. **COOLIFY_TOKEN**
   - Get from: Coolify → Settings → API Token
   - Value: Your Coolify API token

2. **COOLIFY_WEBHOOK_URL**
   - Format: `https://coolify.72.60.194.93/api/webhooks/trigger/{app-id}`
   - Get from: Coolify → Application → Deployment settings

3. **SLACK_WEBHOOK**
   - Get from: Slack → Create Incoming Webhook → Copy webhook URL
   - Value: `https://hooks.slack.com/services/YOUR/WEBHOOK/URL`

4. **SENTRY_AUTH_TOKEN** (Optional)
   - Get from: Sentry → Settings → Auth Tokens
   - Value: Your Sentry auth token

### CLI Command
```bash
gh secret set COOLIFY_TOKEN --body "your-token"
gh secret set COOLIFY_WEBHOOK_URL --body "https://coolify.72.60.194.93/api/webhooks/trigger/xxx"
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/services/..."
gh secret set SENTRY_AUTH_TOKEN --body "your-sentry-token"
```

---

## ✅ Step 4: Verify GitHub Repository

### Check Repository Settings

1. **Branch Protection** (Optional but recommended)
   - Go to: Settings → Branches → Branch protection rules
   - Add rule for `main`:
     - ✅ Require pull request reviews before merging
     - ✅ Require status checks to pass
     - ✅ Require branches to be up to date

2. **GitHub Pages** (Optional)
   - Go to: Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` (for documentation)

3. **Webhooks** (Already configured via GitHub Actions)
   - Go to: Settings → Webhooks
   - Should see Coolify webhook if configured

---

## 🔄 Step 5: Test CI/CD Pipeline

### Trigger GitHub Actions

1. **Push to main**
   ```bash
   git push origin main
   ```

2. **Monitor GitHub Actions**
   - Go to: Actions tab
   - Watch build progress
   - Should see:
     ✅ Lint
     ✅ Type check
     ✅ Tests
     ✅ Build Docker image
     ✅ Deploy to Coolify (if secrets configured)
     ✅ Slack notification

3. **Check Coolify**
   - Go to: Coolify UI
   - Application → Deployments
   - Should see new deployment in progress

4. **Check Sentry** (If configured)
   - New release should appear
   - Linked to deployment

---

## 🎯 Step 6: Configure Coolify for Auto-Deploy

### In Coolify Dashboard

1. **Create Application**
   - Source: GitHub (ibuzzardo/snaplink)
   - Branch: main
   - Build command: `npm run build`
   - Start command: `npm start`
   - Port: 3000

2. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://snaplink:password@postgres:5432/snaplink
   NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
   NEXTAUTH_URL=https://snaplink.72.60.194.93.nip.io
   GITHUB_ID=<your-github-app-id>
   GITHUB_SECRET=<your-github-app-secret>
   SENTRY_DSN=https://...@sentry.72.60.194.93:9000/...
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://snaplink.72.60.194.93.nip.io
   ```

3. **Configure Health Check**
   - Endpoint: `/api/health`
   - Expected status: 200
   - Interval: 30 seconds
   - Timeout: 5 seconds

4. **Enable Auto-Deploy**
   - Automatic deployment: ON
   - Trigger on: Push to main branch

---

## 📊 Step 7: Monitor Deployment

### Health Check
```bash
curl https://snaplink.72.60.194.93.nip.io/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-19T...",
  "uptime": ...,
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": ...
    }
  }
}
```

### Test Core Functionality

1. **Create Short Link**
   ```bash
   curl -X POST https://snaplink.72.60.194.93.nip.io/api/trpc/links.create \
     -H "Content-Type: application/json" \
     -d '{"json": {"url": "https://example.com"}}'
   ```

2. **Test Redirect**
   ```bash
   curl -L https://snaplink.72.60.194.93.nip.io/abc123
   # Should redirect to original URL
   ```

3. **Test Analytics**
   ```bash
   curl https://snaplink.72.60.194.93.nip.io/api/trpc/analytics.get?input=%7B%22json%22:%7B%22slug%22:%22abc123%22%7D%7D
   ```

4. **Visit Dashboard**
   - Go to: https://snaplink.72.60.194.93.nip.io
   - Sign up → Create link → View analytics

### Monitor Logs

**GitHub Actions:**
- https://github.com/ibuzzardo/snaplink/actions

**Coolify:**
- Dashboard → Application → Logs

**Sentry:**
- https://sentry.72.60.194.93 → Releases

---

## 🔧 Troubleshooting

### "Remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/ibuzzardo/snaplink.git
```

### "Authentication failed"
- Use GitHub CLI: `gh auth login`
- Or use SSH key: Configure SSH in GitHub settings
- Or use Personal Access Token (deprecated)

### "GitHub Actions failing"
1. Check if secrets are set: Settings → Secrets
2. Check workflow file: `.github/workflows/ci-cd.yml`
3. Review logs: Actions → Failed workflow

### "Coolify not deploying"
1. Verify GitHub token in Coolify
2. Check webhook: Settings → Webhooks
3. Verify branch protection isn't blocking

### "Database migrations not running"
1. Ensure `npm run db:migrate` is in deployment
2. Check PostgreSQL service is running
3. Verify DATABASE_URL is correct

---

## 📋 Final Checklist

Before considering deployment complete:

- [ ] GitHub repository created
- [ ] Remote added to local git
- [ ] Code pushed to main branch
- [ ] GitHub Actions secrets configured
- [ ] First CI/CD pipeline passed
- [ ] Coolify application created
- [ ] Environment variables set
- [ ] Health check endpoint returns 200
- [ ] Can create short link
- [ ] Redirect works
- [ ] Analytics page loads
- [ ] Auth flows working
- [ ] Slack notifications received
- [ ] Sentry tracking errors
- [ ] Domain accessible (snaplink.72.60.194.93.nip.io)

---

## 🚀 Next Steps After Deployment

1. **Monitor Production**
   - Watch Sentry for errors
   - Monitor Slack notifications
   - Check health endpoint regularly

2. **Gather Feedback**
   - Collect user feedback
   - Document issues
   - Plan improvements

3. **Plan v2.0**
   - Review v2.0 features
   - Prioritize roadmap
   - Start development

4. **Maintain & Scale**
   - Keep dependencies updated
   - Monitor performance
   - Plan scaling strategy

---

## 📞 Support

For issues during GitHub setup:
- GitHub Docs: https://docs.github.com
- Coolify Docs: https://coolify.io/docs
- Our DEPLOYMENT.md: Step-by-step guide

---

**SnapLink GitHub Setup Guide**  
*Complete & Ready for Production*  
*2026-02-19*

