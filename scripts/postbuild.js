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

const standaloneServer = path.join(standaloneDir, 'server.js');
const hostingerBootstrap =
  "/** Hostinger LiteSpeed: forcer écoute TCP (HOSTNAME socket sinon 503). */\n" +
  "process.env.HOSTNAME='0.0.0.0';\n";
let serverSrc = fs.readFileSync(standaloneServer, 'utf8');
if (!serverSrc.includes('Hostinger LiteSpeed')) {
  serverSrc = hostingerBootstrap + serverSrc;
  fs.writeFileSync(standaloneServer, serverSrc);
  console.log('[postbuild] Patched standalone/server.js (HOSTNAME=0.0.0.0)');
}

console.log('[postbuild] Done. Static assets are ready for standalone server.');
