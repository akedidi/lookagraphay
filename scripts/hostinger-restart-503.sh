#!/bin/sh
# Redémarrage d'urgence après 503 (workers Next en boucle « Starting… »).
# Usage: ssh -p 65002 u376353647@HOST 'sh -s' < scripts/hostinger-restart-503.sh
set -e

PUBLIC="$HOME/domains/blue-squirrel-716769.hostingersite.com/public_html"
NODEJS="$HOME/domains/blue-squirrel-716769.hostingersite.com/nodejs"
STAND="$PUBLIC/.next/standalone"

echo "=== Kill workers Next / lsnode zombies ==="
for pid in $(pgrep -u "$(whoami)" -f 'next-server' 2>/dev/null || true); do
  kill -9 "$pid" 2>/dev/null || true
done
for pid in $(pgrep -u "$(whoami)" -f 'lsnode' 2>/dev/null || true); do
  kill -9 "$pid" 2>/dev/null || true
done
sleep 2

echo "=== Supprimer verrous obsolètes ==="
rm -rf "$STAND/.lookagraphy.lock.d" "$STAND/.lookagraphy-instance.lock" "$STAND/.lookagraphy.pid.lock" 2>/dev/null || true

echo "=== Launcher + restart Passenger ==="
cp "$PUBLIC/scripts/hostinger-launcher.js" "$NODEJS/server.js"
rm -rf "$NODEJS/.next" "$NODEJS/node_modules" "$NODEJS/public" 2>/dev/null || true
mkdir -p "$NODEJS/tmp"
date +%s > "$NODEJS/tmp/restart.txt"

echo "=== Attente 8s ==="
sleep 8

echo "=== Processus ==="
pgrep -u "$(whoami)" -f 'next-server' 2>/dev/null | wc -l
ps aux 2>/dev/null | grep -E '[n]ext-server' | head -5

echo "=== Logs (Ready?) ==="
tail -15 "$NODEJS/console.log" 2>/dev/null | grep -E 'Ready|Starting|principale|secondaire|ERREUR' || tail -8 "$NODEJS/console.log"

echo "=== Test ping ==="
curl -sS -m 5 "http://127.0.0.1:${PORT:-3000}/api/ping" 2>/dev/null || echo "ping local: échec (normal si Passenger socket uniquement)"

echo "=== Fin ==="
