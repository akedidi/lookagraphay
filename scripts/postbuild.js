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
  console.log('[postbuild] Skipped — no standalone output.');
  process.exit(0);
}

console.log('[postbuild] Copying public/ → .next/standalone/public/');
copyDir(path.join(root, 'public'), path.join(standaloneDir, 'public'));

console.log('[postbuild] Copying .next/static/ → .next/standalone/.next/static/');
copyDir(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

const standaloneServer = path.join(standaloneDir, 'server.js');
let serverSrc = fs.readFileSync(standaloneServer, 'utf8');

// Retirer un ancien patch si présent (re-build incrémental sans next build)
const marker = 'lookagraphy-lock-v2';
if (serverSrc.includes('Hostinger LiteSpeed')) {
  const start = serverSrc.indexOf('/**');
  const end = serverSrc.indexOf('const path = require');
  if (start >= 0 && end > start) {
    serverSrc = serverSrc.slice(end);
  }
}

const prelude = `/**
 * Hostinger LiteSpeed — ${marker}
 */
const fs = require('fs');

if (process.env.HOSTNAME && /lsws|extapp-sock|\\.sock/i.test(process.env.HOSTNAME)) {
  console.warn('[lookagraphy] HOSTNAME LiteSpeed ignoré:', process.env.HOSTNAME);
}
process.env.HOSTNAME = '0.0.0.0';

const __lookaPort = parseInt(process.env.PORT, 10) || 3000;
const __lookaLock = require('path').join(__dirname, '.lookagraphy.lock');

function __lookaPidAlive(pid) {
  if (!pid || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (_) {
    return false;
  }
}

function __lookaTryLock() {
  try {
    fs.writeFileSync(__lookaLock, String(process.pid), { flag: 'wx' });
    process.on('exit', () => {
      try {
        fs.unlinkSync(__lookaLock);
      } catch (_) {}
    });
    return true;
  } catch (e) {
    if (!e || e.code !== 'EEXIST') throw e;
    const old = parseInt(fs.readFileSync(__lookaLock, 'utf8'), 10);
    if (__lookaPidAlive(old)) return false;
    fs.unlinkSync(__lookaLock);
    return __lookaTryLock();
  }
}

if (!__lookaTryLock()) {
  console.log(
    '[lookagraphy] Worker LiteSpeed secondaire — le serveur principal est déjà actif (voir .lookagraphy.lock)'
  );
  setInterval(() => {}, 1 << 30);
} else {
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

fs.writeFileSync(standaloneServer, prelude + serverSrc + '\n}\n');
console.log('[postbuild] Patched standalone/server.js (' + marker + ')');

console.log('[postbuild] Done.');
