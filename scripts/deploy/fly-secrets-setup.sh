#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# moatazalai — Fly.io secrets bootstrap
#
# Generates strong random secrets and pushes them to Fly, plus DATA_DIR
# and NEXT_PUBLIC_BASE_URL. Run this ONCE after `flyctl apps create`,
# before (or right after) your first `flyctl deploy`.
#
# Usage:
#   ./scripts/deploy/fly-secrets-setup.sh <fly-app-name> <public-https-url>
#
# Example:
#   ./scripts/deploy/fly-secrets-setup.sh moatazalai-yourname https://moatazalai-yourname.fly.dev
# ─────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_NAME="${1:-}"
BASE_URL="${2:-}"

if [[ -z "$APP_NAME" || -z "$BASE_URL" ]]; then
  echo "Usage: $0 <fly-app-name> <public-https-url>"
  echo "Example: $0 moatazalai-yourname https://moatazalai-yourname.fly.dev"
  exit 1
fi

if ! command -v flyctl >/dev/null 2>&1; then
  echo "flyctl not found. Install it first: curl -L https://fly.io/install.sh | sh"
  exit 1
fi

rand_hex() { openssl rand -hex "$1"; }

echo "Generating secrets for app: $APP_NAME"

flyctl secrets set \
  API_KEY_SECRET="$(rand_hex 32)" \
  JWT_SECRET="$(rand_hex 64)" \
  MACHINE_ID_SALT="$(rand_hex 32)" \
  STORAGE_ENCRYPTION_KEY="$(rand_hex 32)" \
  MOATAZALAI_WS_BRIDGE_SECRET="$(rand_hex 32)" \
  DATA_DIR="/data" \
  NEXT_PUBLIC_BASE_URL="$BASE_URL" \
  -a "$APP_NAME"

echo ""
echo "Done. Secrets set for '$APP_NAME'."
echo "Optional: set an initial dashboard password with:"
echo "  flyctl secrets set INITIAL_PASSWORD='your-strong-password' -a $APP_NAME"
