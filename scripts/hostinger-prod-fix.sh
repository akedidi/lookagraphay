#!/bin/sh
# Fix prod (static dans standalone + alias CDN + restart Passenger).
# Usage: ssh -p 65002 u376353647@82.29.191.162 'sh -s' < scripts/hostinger-prod-fix.sh
set -e

DOMAIN="$HOME/domains/blue-squirrel-716769.hostingersite.com"
PUBLIC="$DOMAIN/public_html"
NODEJS="$DOMAIN/nodejs"
STAND="$PUBLIC/.next/standalone"

echo "=== lookagraphy prod fix $(date -Iseconds 2>/dev/null || date) ==="
echo "PUBLIC=$PUBLIC"
echo "NODEJS=$NODEJS"

if [ ! -f "$PUBLIC/package.json" ]; then
  echo "ERREUR: public_html introuvable"
  exit 1
fi

cd "$PUBLIC"

echo ""
echo "=== BUILD_ID / CSS ==="
cat .next/BUILD_ID 2>/dev/null || echo "BUILD_ID manquant"
ls -la .next/static/css/ 2>/dev/null || true

if [ -d "$STAND/.next/static" ]; then
  echo ""
  echo "=== Merge public_html/static → standalone/static ==="
  mkdir -p "$STAND/.next/static"
  cp -a .next/static/. "$STAND/.next/static/"
  [ -f .next/BUILD_ID ] && cp .next/BUILD_ID "$STAND/.next/BUILD_ID"
fi

echo ""
echo "=== Alias CSS + chunks (HTML CDN en cache) ==="
CSS_DIR=".next/static/css"
if [ -d "$CSS_DIR" ]; then
  LATEST=$(ls -1 "$CSS_DIR"/*.css 2>/dev/null | grep -v 23ea256 | head -1)
  [ -n "$LATEST" ] && cp "$LATEST" "$CSS_DIR/23ea256a7d8792f9.css"
fi
NEW_PAGE=$(ls -1 .next/static/chunks/app/page-*.js 2>/dev/null | grep -v 5d0e5f4 | head -1)
[ -n "$NEW_PAGE" ] && cp "$NEW_PAGE" .next/static/chunks/app/page-5d0e5f4fd89dd04c.js
MAIN_NEW=$(ls -1 .next/static/chunks/main-app-*.js 2>/dev/null | grep -v cb7eadc96 | head -1)
[ -n "$MAIN_NEW" ] && cp "$MAIN_NEW" .next/static/chunks/main-app-cb7eadc96fcf139c.js

if [ -d "$STAND/.next/static" ]; then
  cp -a .next/static/. "$STAND/.next/static/"
fi

echo ""
echo "=== Passenger restart ==="
if [ -f "$PUBLIC/scripts/hostinger-launcher.js" ]; then
  rm -rf "$NODEJS/.next" "$NODEJS/node_modules" "$NODEJS/public" 2>/dev/null || true
  cp "$PUBLIC/scripts/hostinger-launcher.js" "$NODEJS/server.js"
fi
mkdir -p "$NODEJS/tmp"
date +%s > "$NODEJS/tmp/restart.txt"

for pid in $(pgrep -u "$(whoami)" -f 'next-server' 2>/dev/null || true); do
  kill -9 "$pid" 2>/dev/null || true
done
sleep 3
date +%s > "$NODEJS/tmp/restart.txt"

[ -x /usr/local/lsws/admin/misc/cleancache.sh ] && /usr/local/lsws/admin/misc/cleancache.sh 2>/dev/null || true

echo ""
echo "=== Tests HTTPS ==="
curl -sS -m 8 -o /dev/null -w "css23: %{http_code}\n" "https://blue-squirrel-716769.hostingersite.com/_next/static/css/23ea256a7d8792f9.css"
curl -sS -m 8 -o /dev/null -w "page-old: %{http_code}\n" "https://blue-squirrel-716769.hostingersite.com/_next/static/chunks/app/page-5d0e5f4fd89dd04c.js"
curl -sS -m 8 -o /dev/null -w "ping: %{http_code}\n" "https://blue-squirrel-716769.hostingersite.com/api/ping"
curl -sS -m 8 -D - "https://blue-squirrel-716769.hostingersite.com/?v=$(date +%s)" -o /dev/null 2>&1 | grep -iE 'cache|hcdn'

echo ""
echo "=== HOSTINGER_NODEJS_DIR (à définir dans hPanel si absent des logs build) ==="
echo "/home/u376353647/domains/blue-squirrel-716769.hostingersite.com/nodejs"
echo ""
echo "Purge CDN : hPanel → Websites → CDN → Flush cache (non disponible en SSH)."
echo "=== Fin ==="
