/**
 * Copie .next/standalone → dossier nodejs/ (runtime Passenger Hostinger).
 * Appelé automatiquement par scripts/postbuild.js après chaque build.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_NAME = 'lucagraphy';
const LEGACY_FILES = ['server-app.js', 'load-env.js', '.lookagraphy-instance.lock', '.lookagraphy.pid.lock'];
const SYNC_ITEMS = ['server.js', 'package.json', 'public', 'node_modules', '.next'];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function readPackageName(dir) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    return pkg.name;
  } catch {
    return null;
  }
}

/** Dossiers nodejs/ candidats (ordre = priorité). */
function findNodejsTargets(projectRoot) {
  const seen = new Set();
  const targets = [];

  function add(p) {
    const resolved = path.resolve(p);
    if (seen.has(resolved) || !fs.existsSync(resolved)) return;
    seen.add(resolved);
    targets.push(resolved);
  }

  if (process.env.HOSTINGER_NODEJS_DIR) {
    add(process.env.HOSTINGER_NODEJS_DIR);
  }

  add(path.join(projectRoot, '..', 'nodejs'));

  const home = process.env.HOME;
  if (home) {
    const domainsDir = path.join(home, 'domains');
    if (fs.existsSync(domainsDir)) {
      for (const site of fs.readdirSync(domainsDir)) {
        const publicHtml = path.join(domainsDir, site, 'public_html');
        const nodejs = path.join(domainsDir, site, 'nodejs');
        if (!fs.existsSync(publicHtml) || !fs.existsSync(nodejs)) continue;
        if (readPackageName(publicHtml) === PROJECT_NAME) {
          add(nodejs);
        }
      }
    }
  }

  return targets;
}

function isHostingerBuildEnvironment(projectRoot) {
  if (process.env.HOSTINGER === '1' || process.env.HOSTINGER_NODEJS_DIR) return true;
  const home = process.env.HOME;
  if (!home) return false;
  const domainsDir = path.join(home, 'domains');
  if (!fs.existsSync(domainsDir)) return false;
  return findNodejsTargets(projectRoot).length > 0;
}

function syncStandaloneToNodejs(standaloneDir, nodejsDir) {
  console.log('[postbuild] Sync standalone →', nodejsDir);

  for (const legacy of LEGACY_FILES) {
    try {
      fs.unlinkSync(path.join(nodejsDir, legacy));
    } catch (_) {}
  }

  for (const item of SYNC_ITEMS) {
    const src = path.join(standaloneDir, item);
    const dest = path.join(nodejsDir, item);
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

  const restartDir = path.join(nodejsDir, 'tmp');
  fs.mkdirSync(restartDir, { recursive: true });
  fs.writeFileSync(path.join(restartDir, 'restart.txt'), String(Date.now()));
  console.log('[postbuild]   → nodejs/tmp/restart.txt (redémarrage Passenger)');
}

function runSync(projectRoot) {
  const standaloneDir = path.join(projectRoot, '.next', 'standalone');
  if (!fs.existsSync(standaloneDir)) {
    console.log('[postbuild] Sync nodejs/ ignoré — pas de build standalone.');
    return { synced: 0, skipped: true };
  }

  const targets = findNodejsTargets(projectRoot);
  if (targets.length === 0) {
    const onHostinger = isHostingerBuildEnvironment(projectRoot);
    if (onHostinger) {
      console.error(
        '[postbuild] ERREUR Hostinger : dossier nodejs/ introuvable.\n' +
          '  Définissez HOSTINGER_NODEJS_DIR dans hPanel (ex. ~/domains/VOTRE-SITE.hostingersite.com/nodejs)'
      );
      process.exit(1);
    }
    console.log(
      '[postbuild] Sync nodejs/ ignoré (pas de ../nodejs — normal en local).\n' +
        '  Sur Hostinger, le build depuis public_html/ synchronise automatiquement.'
    );
    return { synced: 0, skipped: true };
  }

  for (const nodejsDir of targets) {
    try {
      syncStandaloneToNodejs(standaloneDir, nodejsDir);
    } catch (err) {
      console.error('[postbuild] Échec sync vers', nodejsDir, err.message);
      process.exit(1);
    }
  }

  return { synced: targets.length, skipped: false };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const result = runSync(root);
  if (!result.skipped) {
    console.log('[postbuild] Sync terminé (' + result.synced + ' cible(s)).');
  }
}

module.exports = { findNodejsTargets, runSync, syncStandaloneToNodejs };
