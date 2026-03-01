#!/bin/bash
# Test webhook with simulated OpenClaw subagent lifecycle events
# Usage: ./scripts/test-webhook.sh [base_url]

BASE_URL="${1:-http://localhost:3002}"
WEBHOOK_URL="$BASE_URL/api/webhook"
SESSION_ID="test-session-$(date +%s)"

echo "🧪 Testing Mission Control Webhook"
echo "   URL: $WEBHOOK_URL"
echo "   Session: $SESSION_ID"
echo ""

# 1. Health check
echo "1️⃣  Health check..."
curl -s "$WEBHOOK_URL" | python3 -m json.tool 2>/dev/null || curl -s "$WEBHOOK_URL"
echo ""
echo ""

# 2. Simulate developer agent START
echo "2️⃣  Simulating developer agent START..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"start\",
    \"sessionId\": \"$SESSION_ID-dev\",
    \"label\": \"developer\",
    \"task\": \"Build the new API endpoint for user authentication with JWT tokens and refresh flow\",
    \"model\": \"anthropic/claude-opus-4-6\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 3. Simulate researcher agent START
echo "3️⃣  Simulating researcher agent START..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"start\",
    \"sessionId\": \"$SESSION_ID-res\",
    \"label\": \"researcher\",
    \"task\": \"Research best practices for OAuth2 implementation with Supabase Auth - analyze security tradeoffs\",
    \"model\": \"xai/grok-4\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 4. Simulate progress update
echo "4️⃣  Simulating developer PROGRESS..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"progress\",
    \"sessionId\": \"$SESSION_ID-dev\",
    \"label\": \"developer\",
    \"progress\": \"Created auth middleware, implementing JWT validation logic\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 5. Simulate marketer agent START (urgent)
echo "5️⃣  Simulating marketer agent START (urgent)..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"start\",
    \"sessionId\": \"$SESSION_ID-mkt\",
    \"label\": \"marketer\",
    \"task\": \"URGENT: Create Twitter thread about our new AI agent orchestration dashboard - need to post ASAP\",
    \"model\": \"xai/grok-4\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 6. Simulate document creation
echo "6️⃣  Simulating document creation..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"document\",
    \"sessionId\": \"$SESSION_ID-res\",
    \"label\": \"researcher\",
    \"document\": {
      \"title\": \"OAuth2 Security Analysis\",
      \"path\": \"docs/oauth2-analysis.md\"
    }
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 7. Simulate researcher END (success)
echo "7️⃣  Simulating researcher END..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"end\",
    \"sessionId\": \"$SESSION_ID-res\",
    \"label\": \"researcher\",
    \"result\": \"Completed OAuth2 analysis. Recommended Supabase Auth with PKCE flow for SPAs. Created detailed comparison doc.\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 8. Simulate developer ERROR
echo "8️⃣  Simulating developer ERROR..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"error\",
    \"sessionId\": \"$SESSION_ID-dev\",
    \"label\": \"developer\",
    \"error\": \"TypeScript compilation failed: Property 'refreshToken' does not exist on type 'Session'\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 9. Simulate ideator START
echo "9️⃣  Simulating ideator agent START..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"start\",
    \"sessionId\": \"$SESSION_ID-idea\",
    \"label\": \"ideator\",
    \"task\": \"Brainstorm feature ideas for the mission control dashboard - think about what would make this a nice to have product\",
    \"model\": \"xai/grok-4\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

sleep 1

# 10. Simulate marketer END
echo "🔟  Simulating marketer END..."
curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"end\",
    \"sessionId\": \"$SESSION_ID-mkt\",
    \"label\": \"marketer\",
    \"result\": \"Created 8-tweet thread about Mission Control. Scheduled for optimal engagement time. Draft saved to tweets/mc-launch.md\"
  }" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

echo ""
echo "✅ All webhook events sent!"
echo "   Check the dashboard at $BASE_URL to see tasks appear in real-time."
echo "   Expected: 5 tasks created (3 active, 1 done, 1 in review/error)"
