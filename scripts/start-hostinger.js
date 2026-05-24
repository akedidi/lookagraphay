/**
 * Démarrage production (Hostinger / LiteSpeed).
 * LiteSpeed injecte souvent HOSTNAME=…/extapp-sock/… ce qui empêche Next d’atteindre « Ready ».
 */
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

function fatal(message, err) {
  console.error('[lookagraphy]', message);
  if (err) console.error(err);
  process.exit(1);
}

// Ne jamais laisser le socket LiteSpeed dans HOSTNAME (bind invalide → 503, jamais « Ready »).
if (process.env.HOSTNAME && /lsws|extapp-sock|\.sock/i.test(process.env.HOSTNAME)) {
  console.warn(
    '[lookagraphy] HOSTNAME LiteSpeed ignoré:',
    process.env.HOSTNAME
  );
}
process.env.HOSTNAME = '0.0.0.0';
process.env.NODE_ENV = 'production';

const port = parseInt(process.env.PORT || '3000', 10);
if (!Number.isFinite(port) || port <= 0) {
  fatal(`PORT invalide: ${process.env.PORT}`);
}
process.env.PORT = String(port);

if (!process.env.NODE_OPTIONS?.includes('max-old-space-size')) {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--max-old-space-size=512']
    .filter(Boolean)
    .join(' ')
    .trim();
}

if (!fs.existsSync(standaloneServer)) {
  fatal(`Build manquant: ${standaloneServer} — exécutez "npm run build".`);
}

const staticDir = path.join(standaloneDir, '.next', 'static');
const publicDir = path.join(standaloneDir, 'public');
if (!fs.existsSync(staticDir) || !fs.existsSync(publicDir)) {
  fatal(
    'Assets standalone incomplets (public ou .next/static). Relancez npm run build.'
  );
}

process.on('uncaughtException', (err) => {
  console.error('[lookagraphy] uncaughtException', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('[lookagraphy] unhandledRejection', err);
  process.exit(1);
});

console.log('[lookagraphy] Node', process.version);
console.log('[lookagraphy] PORT=', port, 'HOSTNAME=', process.env.HOSTNAME);
console.log('[lookagraphy] cwd →', standaloneDir);

process.chdir(standaloneDir);

try {
  require(standaloneServer);
} catch (err) {
  fatal('Échec démarrage standalone', err);
}
