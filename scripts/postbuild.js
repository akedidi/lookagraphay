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

const marker = 'lookagraphy-passenger-v5';
if (serverSrc.includes('Hostinger LiteSpeed') || serverSrc.includes('lookagraphy-')) {
  const end = serverSrc.indexOf('const path = require');
  if (end > 0) {
    serverSrc = serverSrc.slice(end);
  }
  serverSrc = serverSrc.replace(/\n\}\s*$/, '\n');
}

// Pas de verrou PID : Hostinger utilise Passenger (LSNODE_*). Un lock provoque exit(0) → 503.
const prelude = `/**
 * Hostinger Passenger — ${marker}
 */
if (process.env.HOSTNAME && /lsws|extapp-sock|\\.sock/i.test(process.env.HOSTNAME)) {
  console.warn('[lookagraphy] HOSTNAME LiteSpeed ignoré:', process.env.HOSTNAME);
}
process.env.HOSTNAME = '0.0.0.0';
const __lookaPort = parseInt(process.env.PORT, 10) || 3000;
console.log('[lookagraphy] ${marker} | Node', process.version, '| PORT', __lookaPort);

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
console.log('[postbuild] Patched standalone/server.js (' + marker + ')');

// Hostinger Passenger exécute ../nodejs/ — pas public_html/.next/standalone seul.
const hostingerNodejs = path.join(root, '..', 'nodejs');
if (fs.existsSync(hostingerNodejs)) {
  console.log('[postbuild] Sync standalone → ../nodejs/ (Passenger runtime)');
  for (const legacy of ['server-app.js', 'load-env.js', '.lookagraphy-instance.lock', '.lookagraphy.pid.lock']) {
    try {
      fs.unlinkSync(path.join(hostingerNodejs, legacy));
    } catch (_) {}
  }
  for (const item of ['server.js', 'package.json', 'public', 'node_modules', '.next']) {
    const src = path.join(standaloneDir, item);
    const dest = path.join(hostingerNodejs, item);
    if (!fs.existsSync(src)) continue;
    fs.rmSync(dest, { recursive: true, force: true });
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
    console.log('[postbuild]   → nodejs/' + item);
  }
  const restartDir = path.join(hostingerNodejs, 'tmp');
  fs.mkdirSync(restartDir, { recursive: true });
  fs.writeFileSync(path.join(restartDir, 'restart.txt'), String(Date.now()));
  console.log('[postbuild]   → nodejs/tmp/restart.txt');
}

console.log('[postbuild] Done.');
