#!/bin/bash
# SnapLink GitHub Push Script
# Execute this to push the complete application to GitHub

set -e

echo "🚀 SnapLink - GitHub Push Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if git is configured
if ! git config user.name > /dev/null; then
    echo -e "${RED}❌ Git not configured!${NC}"
    echo ""
    echo "Configure git first:"
    echo "  git config --global user.name 'Your Name'"
    echo "  git config --global user.email 'your@email.com'"
    exit 1
fi

echo -e "${BLUE}ℹ️  Git Configuration:${NC}"
echo "  Name: $(git config user.name)"
echo "  Email: $(git config user.email)"
echo ""

# Prompt for GitHub username
echo -e "${YELLOW}📝 Enter GitHub username:${NC}"
read -p "  GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ GitHub username is required!${NC}"
    exit 1
fi

REPO_URL="https://github.com/$GITHUB_USERNAME/snaplink.git"

echo ""
echo -e "${BLUE}Repository:${NC}"
echo "  URL: $REPO_URL"
echo ""

# Check if remote already exists
if git remote -v | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    read -p "  Remove and add new remote? (y/n): " REMOVE_REMOTE
    if [ "$REMOVE_REMOTE" = "y" ]; then
        git remote remove origin
        echo -e "${GREEN}✓ Remote removed${NC}"
    else
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Adding remote...${NC}"
git remote add origin "$REPO_URL"
echo -e "${GREEN}✓ Remote added${NC}"

echo ""
echo -e "${BLUE}Verifying repository...${NC}"
git remote -v
echo ""

echo -e "${BLUE}Current branch:${NC}"
git branch
echo ""

echo -e "${BLUE}Commits to push:${NC}"
git log --oneline
echo ""

echo -e "${YELLOW}⚠️  Make sure your GitHub repository is already created!${NC}"
echo "  If not, create it at: https://github.com/new"
echo ""

read -p "  Push to $REPO_URL? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo -e "${RED}❌ Aborted${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Push successful!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Visit: https://github.com/$GITHUB_USERNAME/snaplink"
    echo "  2. Configure GitHub Actions secrets:"
    echo "     - COOLIFY_TOKEN"
    echo "     - COOLIFY_WEBHOOK_URL"
    echo "     - SLACK_WEBHOOK"
    echo "     - SENTRY_AUTH_TOKEN (optional)"
    echo ""
    echo "  3. Run: npm run db:migrate (on deployment server)"
    echo "  4. Monitor deployments: https://github.com/$GITHUB_USERNAME/snaplink/actions"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Push failed!${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check GitHub repository exists: https://github.com/new"
    echo "  2. Verify authentication: gh auth login"
    echo "  3. Try SSH: git remote set-url origin git@github.com:$GITHUB_USERNAME/snaplink.git"
    echo ""
    exit 1
fi
