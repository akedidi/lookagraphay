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
const marker = 'lookagraphy-lock-v4';
if (serverSrc.includes('Hostinger LiteSpeed') || serverSrc.includes('lookagraphy-lock-v')) {
  const end = serverSrc.indexOf('const path = require');
  if (end > 0) {
    serverSrc = serverSrc.slice(end);
  }
  serverSrc = serverSrc.replace(/\n\}\s*$/, '\n');
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
const __lookaLockFile = require('path').join(__dirname, '.lookagraphy.pid.lock');

function __lookaPidAlive(pid) {
  if (!pid || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (_) {
    return false;
  }
}

function __lookaSpinWait(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

function __lookaTryLock() {
  for (let attempt = 0; attempt < 200; attempt++) {
    try {
      fs.writeFileSync(__lookaLockFile, String(process.pid), { flag: 'wx' });
      process.on('exit', () => {
        try {
          fs.unlinkSync(__lookaLockFile);
        } catch (_) {}
      });
      return true;
    } catch (e) {
      if (!e || e.code !== 'EEXIST') throw e;
    }
    let old;
    try {
      old = parseInt(fs.readFileSync(__lookaLockFile, 'utf8'), 10);
    } catch (_) {
      __lookaSpinWait(25);
      continue;
    }
    if (__lookaPidAlive(old)) return false;
    try {
      fs.unlinkSync(__lookaLockFile);
    } catch (_) {
      __lookaSpinWait(25);
    }
  }
  return false;
}

if (!__lookaTryLock()) {
  console.log(
    '[lookagraphy] Worker LiteSpeed secondaire — exit (instance principale active)'
  );
  process.exit(0);
} else {
  console.log('[lookagraphy] ${marker} | instance principale | Node', process.version, '| PORT', __lookaPort);

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
