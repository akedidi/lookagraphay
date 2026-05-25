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

echo "=== Install launcher + purge copies obsolètes dans nodejs/ ==="
rm -f "$NODEJS"/server-app.js "$NODEJS"/load-env.js "$NODEJS"/.lookagraphy-instance.lock "$NODEJS"/.lookagraphy.pid.lock 2>/dev/null || true
rm -rf "$NODEJS/.next" "$NODEJS/node_modules" "$NODEJS/public" 2>/dev/null || true
cp "$SITE_ROOT/scripts/hostinger-launcher.js" "$NODEJS/server.js"
echo "  → nodejs/server.js (launcher → public_html/.next/standalone)"

mkdir -p "$NODEJS/tmp"
date +%s > "$NODEJS/tmp/restart.txt"

echo "=== Merge .next/static → public_html (conserve anciens CSS/JS pour HTML CDN en cache) ==="
mkdir -p .next/static
cp -a .next/standalone/.next/static/. .next/static/
cp .next/BUILD_ID .next/BUILD_ID 2>/dev/null || cp .next/standalone/.next/BUILD_ID .next/BUILD_ID

echo "BUILD_ID=$(cat .next/BUILD_ID)"
echo "CSS=$(ls .next/static/css/)"
echo "=== Fin — testez le site (Cmd+Shift+R) ==="
