#!/usr/bin/env bash
# Deploys the assistant to Cloudflare (free plan is enough) and connects your site to it.
# Safe to run again any time, for example after editing knowledge.txt.
# Your OpenAI key is typed into THIS terminal only: it goes straight to Cloudflare as a secret. Never paste it into a chat or a file.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
ROOT="$(cd .. && pwd)"

echo "1/5 Installing tools"
npm install --no-audit --no-fund --loglevel=error

echo "2/5 Cloudflare account"
if ! npx wrangler whoami 2>/dev/null | grep -qi "associated with"; then
  echo "    A browser window will open. Log in (or create a free account), then click Allow."
  npx wrangler login
fi

echo "3/5 Deploying the assistant"
LOG="$(mktemp)"
npx wrangler deploy 2>&1 | tee "$LOG"
URL="$(grep -Eo 'https://[A-Za-z0-9._-]+\.workers\.dev' "$LOG" | head -1 || true)"
rm -f "$LOG"
if [ -z "$URL" ]; then echo "Could not read the Worker address from the output above. Copy the https://...workers.dev address into $ROOT/.env as VITE_CHAT_URL=..."; exit 1; fi

echo "4/5 OpenAI key"
SECRETS="$(npx wrangler secret list 2>/dev/null || true)"
if printf '%s' "$SECRETS" | grep -q '"PORTFOLIO_CHAT_API"'; then
  echo "    Already stored on Cloudflare as PORTFOLIO_CHAT_API (to replace it: npx wrangler secret put PORTFOLIO_CHAT_API)"
else
  echo "    Create a key at https://platform.openai.com/api-keys (Permissions: All), then paste it below (the typing is hidden) and press Enter."
  npx wrangler secret put PORTFOLIO_CHAT_API
fi
if printf '%s' "$SECRETS" | grep -q '"OPENAI_API_KEY"'; then
  echo "    Note: an older, unused secret named OPENAI_API_KEY is still on Cloudflare. Remove it with: npx wrangler secret delete OPENAI_API_KEY"
fi

echo "5/5 Connecting your site and checking everything"
touch "$ROOT/.env"
grep -v '^VITE_CHAT_URL=' "$ROOT/.env" > "$ROOT/.env.tmp" || true
echo "VITE_CHAT_URL=$URL" >> "$ROOT/.env.tmp"
mv "$ROOT/.env.tmp" "$ROOT/.env"
sleep 2
CHECK="$(curl -fsS --max-time 30 "$URL/health" || true)"
echo "    $CHECK"
case "$CHECK" in
  *'"ok":true'*) echo; echo "All good. The assistant is live at $URL";;
  *) echo; echo "The Worker is deployed but the check did not pass. Read the message above, fix it (for example the model name in wrangler.toml), and run this script again.";;
esac
cat <<MSG

Next:
  cd $ROOT && npm run dev      then open http://localhost:5173/adhik-portfolio/ and ask the chat a question
  When you like it, publish as usual (git add .env, commit, push). The .env file holds only the public Worker address, not a secret.
MSG
