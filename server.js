const path = require('path');
const fs = require('fs');

const port = parseInt(process.env.PORT || '3000', 10);
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

function fatal(message, err) {
  console.error('[lookagraphy]', message);
  if (err) console.error(err);
  process.exit(1);
}

// Hostinger / Docker définissent souvent HOSTNAME=nom-du-conteneur → le serveur
// n’écoute pas sur l’interface attendue par le proxy (503). Toujours 0.0.0.0.
process.env.HOSTNAME = '0.0.0.0';
process.env.NODE_ENV = 'production';
process.env.PORT = String(port);

if (!fs.existsSync(standaloneServer)) {
  fatal(
    `Build standalone manquant (${standaloneServer}). Lancez "npm run build" sur le serveur.`
  );
}

const staticDir = path.join(standaloneDir, '.next', 'static');
const publicDir = path.join(standaloneDir, 'public');
if (!fs.existsSync(staticDir) || !fs.existsSync(publicDir)) {
  console.warn(
    '[lookagraphy] WARN: assets static/public absents dans standalone — vérifiez scripts/postbuild.js'
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

console.log(`[lookagraphy] Starting standalone on http://0.0.0.0:${port}`);
console.log(`[lookagraphy] cwd → ${standaloneDir}`);

process.chdir(standaloneDir);

try {
  require(standaloneServer);
} catch (err) {
  fatal('Impossible de démarrer le serveur standalone', err);
}
