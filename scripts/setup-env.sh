#!/bin/bash
# SnapLink Environment Setup Script
# Run this after deploying to configure environment variables

set -e

echo "🔧 SnapLink Environment Setup"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo "Please copy .env.example to .env.local and fill in values:"
    echo "  cp .env.example .env.local"
    exit 1
fi

echo -e "${GREEN}✓ .env.local exists${NC}"

# Validate required variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "GITHUB_ID"
    "GITHUB_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^$var=" .env.local; then
        VALUE=$(grep "^$var=" .env.local | cut -d'=' -f2)
        if [ -z "$VALUE" ] || [ "$VALUE" = "\"\"" ]; then
            echo -e "${RED}❌ $var is empty!${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ $var is set${NC}"
    else
        echo -e "${RED}❌ $var is missing!${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}✓ All required environment variables are set!${NC}"
echo ""
echo "📋 Environment Summary:"
echo "  DATABASE_URL: $(grep '^DATABASE_URL=' .env.local | cut -d'=' -f2 | head -c 50)..."
echo "  NEXTAUTH_URL: $(grep '^NEXTAUTH_URL=' .env.local | cut -d'=' -f2)"
echo "  GitHub OAuth: Configured"
echo ""
echo "🚀 Next steps:"
echo "  1. Run migrations: npm run db:migrate"
echo "  2. Start dev server: npm run dev"
echo "  3. Visit: http://localhost:3000"
