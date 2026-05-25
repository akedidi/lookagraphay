#!/bin/sh
# À lancer SUR le serveur Hostinger (SSH), depuis public_html/ :
#   cd ~/domains/VOTRE-SITE.hostingersite.com/public_html && sh scripts/hostinger-emergency-sync.sh
set -e

SITE_ROOT="${1:-$(pwd)}"
cd "$SITE_ROOT"

if [ ! -f .next/standalone/server.js ]; then
  echo "ERREUR: pas de .next/standalone — lancez d'abord: npm run build"
  exit 1
fi

NODEJS="$(dirname "$SITE_ROOT")/nodejs"
if [ ! -d "$NODEJS" ]; then
  echo "ERREUR: nodejs/ introuvable à côté de public_html: $NODEJS"
  exit 1
fi

echo "=== Sync $SITE_ROOT/.next/standalone → $NODEJS ==="
rm -f "$NODEJS"/server-app.js "$NODEJS"/load-env.js "$NODEJS"/.lookagraphy-instance.lock "$NODEJS"/.lookagraphy.pid.lock 2>/dev/null || true

for item in server.js package.json public node_modules .next; do
  if [ -e ".next/standalone/$item" ]; then
    rm -rf "$NODEJS/$item"
    cp -a ".next/standalone/$item" "$NODEJS/"
    echo "  → nodejs/$item"
  fi
done

mkdir -p "$NODEJS/tmp"
date +%s > "$NODEJS/tmp/restart.txt"

echo "=== Sync .next/static → public_html ==="
rm -rf .next/static
cp -a .next/standalone/.next/static .next/static
cp .next/BUILD_ID .next/BUILD_ID 2>/dev/null || cp .next/standalone/.next/BUILD_ID .next/BUILD_ID

echo "BUILD_ID=$(cat .next/BUILD_ID)"
echo "CSS=$(ls .next/static/css/)"
echo "=== Fin — testez le site (Cmd+Shift+R) ==="
