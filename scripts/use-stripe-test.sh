#!/bin/bash
# Switch .env.local from LIVE Stripe keys to TEST keys for local development.
#
# Usage: paste your test keys when prompted. Existing live keys are saved to
# .env.local.live-backup so you can swap back any time.
#
# Test keys: https://dashboard.stripe.com/test/apikeys

set -e

ENV=.env.local
BACKUP=.env.local.live-backup

if [ ! -f "$ENV" ]; then
  echo "❌ $ENV not found"
  exit 1
fi

# 1. Backup current live keys (only if backup doesn't already exist or current keys are live)
if grep -q "sk_live_" "$ENV"; then
  cp "$ENV" "$BACKUP"
  echo "✓ Live keys backed up to $BACKUP"
fi

# 2. Prompt for test keys
echo ""
echo "Paste your STRIPE TEST keys from https://dashboard.stripe.com/test/apikeys"
echo ""
read -p "Publishable key (pk_test_...): " PK_TEST
read -p "Secret key (sk_test_...): " SK_TEST

if [[ ! "$PK_TEST" =~ ^pk_test_ ]] || [[ ! "$SK_TEST" =~ ^sk_test_ ]]; then
  echo "❌ Keys must start with pk_test_ and sk_test_"
  exit 1
fi

# 3. Update .env.local
node - <<EOF
const fs = require('fs');
let s = fs.readFileSync('$ENV', 'utf8');
const set = (k, v) => {
  const re = new RegExp(\`^\${k}=.*\$\`, 'm');
  s = re.test(s) ? s.replace(re, \`\${k}=\${v}\`) : s + \`\\n\${k}=\${v}\`;
};
set('STRIPE_SECRET_KEY', '$SK_TEST');
set('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', '$PK_TEST');
fs.writeFileSync('$ENV', s);
console.log('✓ Test keys written to $ENV');
EOF

echo ""
echo "🔁 Now do these:"
echo "   1. Stop dev server (Ctrl+C)"
echo "   2. In your stripe-cli terminal, restart with NEW listen + capture new whsec_..."
echo "      stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo "   3. Update STRIPE_WEBHOOK_SECRET in $ENV with the new whsec_..."
echo "   4. npm run dev"
echo ""
echo "📝 Test cards:"
echo "   4242 4242 4242 4242 — success"
echo "   4000 0000 0000 9995 — declined"
echo "   any future date · any CVC"
echo ""
echo "♻️ To revert to live: cp $BACKUP $ENV (and restart)"
