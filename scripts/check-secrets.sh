#!/usr/bin/env sh
# Détecte des clés Stripe/API commitées par erreur dans le dépôt (hors .env* ignorés).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PATTERN='sk_(live|test)_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|GOCSPX-[A-Za-z0-9_-]{10,}|const ADMIN_PASS\s*=\s*['\''"][^'\''"]+['\''"]'

if git grep -nE "$PATTERN" -- ':!scripts/check-secrets.sh' ':!.env.example' 2>/dev/null; then
  echo "❌ Clé secrète détectée dans des fichiers versionnés. Retirez-la et régénérez la clé dans Stripe."
  exit 1
fi

echo "✓ Aucune clé Stripe secrète dans les fichiers suivis par git."
