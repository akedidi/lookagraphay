const fs = require('fs');
const path = require('path');
const os = require('os');

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
  console.log('[postbuild] Skipped — no standalone output.');
  process.exit(0);
}

console.log('[postbuild] Copying public/ → .next/standalone/public/');
copyDir(path.join(root, 'public'), path.join(standaloneDir, 'public'));

console.log('[postbuild] Copying .next/static/ → .next/standalone/.next/static/');
copyDir(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

const standaloneServer = path.join(standaloneDir, 'server.js');
let serverSrc = fs.readFileSync(standaloneServer, 'utf8');

if (serverSrc.includes('Hostinger LiteSpeed')) {
  console.log('[postbuild] standalone/server.js already patched');
} else {
  const prelude = `/**
 * Hostinger LiteSpeed — patch postbuild (ne pas modifier à la main).
 */
const fs = require('fs');
const os = require('os');

if (process.env.HOSTNAME && /lsws|extapp-sock|\\.sock/i.test(process.env.HOSTNAME)) {
  console.warn('[lookagraphy] HOSTNAME LiteSpeed ignoré:', process.env.HOSTNAME);
}
process.env.HOSTNAME = '0.0.0.0';

const __lookaPort = parseInt(process.env.PORT, 10) || 3000;
const __lookaLock = os.tmpdir() + '/lookagraphy-' + __lookaPort + '.lock';
try {
  fs.writeFileSync(__lookaLock, String(process.pid), { flag: 'wx' });
  process.on('exit', () => {
    try {
      fs.unlinkSync(__lookaLock);
    } catch (_) {}
  });
} catch (e) {
  if (e && e.code === 'EEXIST') {
    console.log('[lookagraphy] Une instance tourne déjà sur le port', __lookaPort);
    process.exit(0);
  }
  throw e;
}

console.log('[lookagraphy] Next standalone | Node', process.version, '| PORT', __lookaPort);

`;

  serverSrc = serverSrc.replace(
    "const hostname = process.env.HOSTNAME || '0.0.0.0'",
    "const hostname = '0.0.0.0'"
  );

  if (!serverSrc.includes('minimalMode:')) {
    serverSrc = serverSrc.replace(
      'startServer({',
      'startServer({\n  minimalMode: true,'
    );
  }

  fs.writeFileSync(standaloneServer, prelude + serverSrc);
  console.log('[postbuild] Patched standalone/server.js for LiteSpeed (HOSTNAME + minimalMode + lock)');
}

console.log('[postbuild] Done.');
