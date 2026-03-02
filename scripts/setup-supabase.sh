#!/bin/bash
# Mission Control — Supabase Setup Script
# Run this after creating a Supabase project at https://supabase.com/dashboard
#
# Usage:
#   ./scripts/setup-supabase.sh <SUPABASE_URL> <ANON_KEY> [SERVICE_ROLE_KEY] [WEBHOOK_SECRET]
#
# Example:
#   ./scripts/setup-supabase.sh https://abc123.supabase.co eyJhbGciOi... eyJhbGciOi... my-secret-123

set -euo pipefail

SUPABASE_URL="${1:-}"
ANON_KEY="${2:-}"
SERVICE_ROLE_KEY="${3:-}"
WEBHOOK_SECRET="${4:-$(openssl rand -hex 16)}"

if [ -z "$SUPABASE_URL" ] || [ -z "$ANON_KEY" ]; then
  echo "❌ Usage: $0 <SUPABASE_URL> <ANON_KEY> [SERVICE_ROLE_KEY] [WEBHOOK_SECRET]"
  echo ""
  echo "Get these from: https://supabase.com/dashboard → Project Settings → API"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.local"

echo "🚀 Setting up Mission Control Supabase integration..."
echo ""

# 1. Write .env.local
cat > "$ENV_FILE" << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}

# Webhook secret (shared with OpenClaw gateway hook)
WEBHOOK_SECRET=${WEBHOOK_SECRET}

# Service role key for server-side operations
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY:-${ANON_KEY}}
EOF

echo "✅ Created $ENV_FILE"

# 2. Set Vercel env vars (if vercel CLI available)
if command -v vercel &>/dev/null; then
  echo ""
  echo "📦 Setting Vercel environment variables..."
  echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development --force 2>/dev/null || true
  echo "$ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --force 2>/dev/null || true
  echo "$WEBHOOK_SECRET" | vercel env add WEBHOOK_SECRET production preview development --force 2>/dev/null || true
  if [ -n "$SERVICE_ROLE_KEY" ]; then
    echo "$SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development --force 2>/dev/null || true
  fi
  echo "✅ Vercel env vars set"
fi

# 3. Print schema instructions
echo ""
echo "📋 Next steps:"
echo "   1. Go to Supabase Dashboard → SQL Editor"
echo "   2. Run the contents of: supabase/schema.sql"
echo "   3. Enable Realtime for both tables (should be in the schema)"
echo "   4. Deploy: vercel --prod"
echo ""
echo "🔗 Webhook URL for OpenClaw hook:"
echo "   https://your-vercel-domain.vercel.app/api/webhook"
echo ""
echo "🔑 Webhook secret: ${WEBHOOK_SECRET}"
echo "   (Save this — you'll need it for the OpenClaw hook config)"
