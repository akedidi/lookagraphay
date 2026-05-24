const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`[postbuild] Source not found: ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const root = path.resolve(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.log('[postbuild] Skipped — no standalone output (prod uses node server.js).');
  process.exit(0);
}

console.log('[postbuild] Copying public/ → .next/standalone/public/');
copyDir(path.join(root, 'public'), path.join(standaloneDir, 'public'));

console.log('[postbuild] Copying .next/static/ → .next/standalone/.next/static/');
copyDir(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

// LiteSpeed (lsnode) : le server.js Next par défaut appelle listen() plusieurs fois → crash.
// On le remplace par un wrapper vers notre démarrage à un seul listen().
const standaloneServer = path.join(standaloneDir, 'server.js');
const wrapper = `/**
 * Généré par scripts/postbuild.js — ne pas modifier.
 * Hostinger peut lancer ce fichier directement ; un seul listen() pour LiteSpeed.
 */
const path = require('path');
require(path.resolve(__dirname, '../../scripts/start-hostinger.js'));
`;
fs.writeFileSync(standaloneServer, wrapper);
console.log('[postbuild] Replaced standalone/server.js with LiteSpeed-safe wrapper');

console.log('[postbuild] Done. Static assets are ready for standalone server.');
