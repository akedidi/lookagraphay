#!/bin/sh
# Diagnostic + nettoyage verrous Hostinger (à lancer SUR le serveur via SSH).
# Usage local :
#   ssh -p 65002 u376353647@82.29.191.162 'sh -s' < scripts/hostinger-ssh-fix.sh
#
# Ou : ssh -p 65002 u376353647@82.29.191.162
#      puis coller les commandes entre === ci-dessous.

set -e

echo "=== Hostinger lookagraphy fix ==="
echo "User: $(whoami)  Host: $(hostname)  Date: $(date -Iseconds 2>/dev/null || date)"

SITE_ROOT=""
NODEJS_ROOT=""
for f in $(find "$HOME/domains" -maxdepth 6 -name package.json 2>/dev/null); do
  if grep -q '"name": "lucagraphy"' "$f" 2>/dev/null; then
    SITE_ROOT=$(dirname "$f")
    break
  fi
done

# LiteSpeed exécute souvent domains/…/nodejs/, pas public_html seul
if [ -d "$HOME/domains" ]; then
  for d in "$HOME/domains"/*/nodejs; do
    if [ -f "$d/server.js" ]; then NODEJS_ROOT="$d"; break; fi
  done
fi

if [ -z "$SITE_ROOT" ]; then
  echo "ERREUR: public_html (sources) introuvable"
  exit 1
fi

echo "SITE_ROOT=$SITE_ROOT"
echo "NODEJS_ROOT=${NODEJS_ROOT:-non trouvé}"
STANDALONE="$SITE_ROOT/.next/standalone"
APP_ROOT="${NODEJS_ROOT:-$STANDALONE}"
cd "$APP_ROOT"
echo "APP_ROOT (runtime)=$APP_ROOT"
echo ""
echo "=== Verrous / flock (anciens deploys) ==="
for f in \
  "$STANDALONE/.lookagraphy-instance.lock" \
  "$STANDALONE/.lookagraphy.pid.lock" \
  "$APP_ROOT/.lookagraphy-instance.lock" \
  ; do
  if [ -e "$f" ]; then
    echo "LOCK: $f"
    cat "$f" 2>/dev/null || true
    rm -f "$f" && echo "  -> supprimé" || echo "  -> échec suppression"
  else
    echo "absent: $f"
  fi
done

echo ""
echo "=== server.js (premières lignes) ==="
if [ -f "$STANDALONE/server.js" ]; then
  head -25 "$STANDALONE/server.js"
else
  echo "MANQUANT: $STANDALONE/server.js — lancer npm run build"
fi

echo ""
echo "=== Processus Node / port 3000 ==="
(ps aux 2>/dev/null | grep -E '[n]ode|[n]ext' || true) | head -15
(command -v lsof >/dev/null && lsof -iTCP:3000 -sTCP:LISTEN 2>/dev/null) || true
(command -v fuser >/dev/null && fuser 3000/tcp 2>/dev/null) || true

echo ""
echo "=== Test local /api/ping (si Next écoute) ==="
(command -v curl >/dev/null && curl -sS -m 3 "http://127.0.0.1:${PORT:-3000}/api/ping" 2>/dev/null) || echo "curl indisponible ou pas de réponse"

echo ""
echo "=== Variables DB (noms seulement) ==="
env | grep -E '^DB_' | sed 's/=.*/=***/' || true

echo ""
if [ -n "$NODEJS_ROOT" ] && [ -d "$STANDALONE" ] && [ -f "$STANDALONE/server.js" ]; then
  echo "=== Sync recommandé: $STANDALONE -> $NODEJS_ROOT ==="
  echo "  rm -f $NODEJS_ROOT/.lookagraphy-instance.lock"
  echo "  cp -a $STANDALONE/server.js $STANDALONE/.next $STANDALONE/node_modules $STANDALONE/public $NODEJS_ROOT/"
  echo "  rm -f $NODEJS_ROOT/server-app.js $NODEJS_ROOT/load-env.js  # ancien flock v16"
fi

echo ""
echo "=== Fin — redeploy hPanel après sync si besoin ==="
