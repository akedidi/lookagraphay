/**
 * Copie .next/standalone → nodejs/ (Passenger) + .next/static → public_html/ (LiteSpeed).
 * Appelé par scripts/postbuild.js après chaque build.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_NAME = 'lucagraphy';
const LEGACY_FILES = ['server-app.js', 'load-env.js', '.lookagraphy-instance.lock', '.lookagraphy.pid.lock'];

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

function isOurProject(dir) {
  return fs.existsSync(path.join(dir, 'package.json')) && readPackageName(dir) === PROJECT_NAME;
}

function isHostingerPath(p) {
  const lower = p.toLowerCase();
  return lower.includes('hostingersite.com') || lower.includes(`${path.sep}domains${path.sep}`);
}

/** Dossiers nodejs/ (runtime Passenger). */
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
        if (fs.existsSync(publicHtml) && fs.existsSync(nodejs) && isOurProject(publicHtml)) {
          add(nodejs);
        }
      }
    }
  }

  return targets;
}

/** Dossiers public_html/ (fichiers statiques /_next/static servis par LiteSpeed). */
function findPublicHtmlTargets(projectRoot, nodejsTargets) {
  const seen = new Set();
  const targets = [];

  function add(p) {
    const resolved = path.resolve(p);
    if (seen.has(resolved) || !fs.existsSync(resolved) || !isOurProject(resolved)) return;
    seen.add(resolved);
    targets.push(resolved);
  }

  if (isOurProject(projectRoot)) {
    add(projectRoot);
  }

  add(path.join(projectRoot, '..', 'public_html'));

  for (const nodejsDir of nodejsTargets) {
    add(path.join(path.dirname(nodejsDir), 'public_html'));
  }

  const home = process.env.HOME;
  if (home) {
    const domainsDir = path.join(home, 'domains');
    if (fs.existsSync(domainsDir)) {
      for (const site of fs.readdirSync(domainsDir)) {
        add(path.join(domainsDir, site, 'public_html'));
      }
    }
  }

  return targets;
}

function isHostingerBuildEnvironment(projectRoot) {
  if (process.env.HOSTINGER === '1' || process.env.HOSTINGER_NODEJS_DIR) return true;
  if (isHostingerPath(projectRoot) || isHostingerPath(process.cwd())) return true;
  return findNodejsTargets(projectRoot).length > 0;
}

function logBuildAssets(projectRoot, label) {
  const buildIdPath = path.join(projectRoot, '.next', 'BUILD_ID');
  const staticCssDir = path.join(projectRoot, '.next', 'static', 'css');
  if (!fs.existsSync(buildIdPath)) return;
  const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
  const css =
    fs.existsSync(staticCssDir) ? fs.readdirSync(staticCssDir).filter((f) => f.endsWith('.css')) : [];
  console.log(`[postbuild] ${label} BUILD_ID=${buildId} CSS=${css.join(', ') || '(aucun)'}`);
}

function syncStandaloneToNodejs(standaloneDir, nodejsDir) {
  console.log('[postbuild] Sync standalone →', nodejsDir);

  for (const legacy of LEGACY_FILES) {
    try {
      fs.unlinkSync(path.join(nodejsDir, legacy));
    } catch (_) {}
  }

  for (const name of fs.readdirSync(standaloneDir)) {
    if (LEGACY_FILES.includes(name)) continue;
    const src = path.join(standaloneDir, name);
    const dest = path.join(nodejsDir, name);
    fs.rmSync(dest, { recursive: true, force: true });
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
    console.log('[postbuild]   → nodejs/' + name);
  }

  const restartDir = path.join(nodejsDir, 'tmp');
  fs.mkdirSync(restartDir, { recursive: true });
  fs.writeFileSync(path.join(restartDir, 'restart.txt'), String(Date.now()));
  console.log('[postbuild]   → nodejs/tmp/restart.txt (redémarrage Passenger)');
}

/** LiteSpeed sert souvent /_next/static depuis public_html — doit matcher le BUILD_ID du serveur. */
function syncStaticToPublicHtml(projectRoot, publicHtmlDir) {
  const staticSrc = path.join(projectRoot, '.next', 'static');
  const buildIdSrc = path.join(projectRoot, '.next', 'BUILD_ID');
  if (!fs.existsSync(staticSrc) || !fs.existsSync(buildIdSrc)) return;

  const nextDir = path.join(publicHtmlDir, '.next');
  const destStatic = path.join(nextDir, 'static');
  fs.mkdirSync(nextDir, { recursive: true });
  fs.rmSync(destStatic, { recursive: true, force: true });
  copyDir(staticSrc, destStatic);
  fs.copyFileSync(buildIdSrc, path.join(nextDir, 'BUILD_ID'));
  console.log('[postbuild] Sync .next/static →', publicHtmlDir);
}

function runSync(projectRoot) {
  const standaloneDir = path.join(projectRoot, '.next', 'standalone');
  if (!fs.existsSync(standaloneDir)) {
    console.log('[postbuild] Sync nodejs/ ignoré — pas de build standalone.');
    return { synced: 0, skipped: true };
  }

  logBuildAssets(projectRoot, 'Build');

  const nodejsTargets = findNodejsTargets(projectRoot);
  const onHostinger = isHostingerBuildEnvironment(projectRoot);

  if (nodejsTargets.length === 0) {
    if (onHostinger) {
      console.error(
        '[postbuild] ERREUR Hostinger : nodejs/ introuvable pendant le build.\n' +
          '  Ajoutez dans hPanel la variable HOSTINGER_NODEJS_DIR avec le chemin absolu vers nodejs/\n' +
          '  (ex. /home/u376353647/domains/blue-squirrel-716769.hostingersite.com/nodejs)'
      );
      process.exit(1);
    }
    console.log(
      '[postbuild] Sync nodejs/ ignoré (pas de ../nodejs — normal en local).\n' +
        '  Sur Hostinger : définir HOSTINGER_NODEJS_DIR dans hPanel.'
    );
    return { synced: 0, skipped: true };
  }

  for (const nodejsDir of nodejsTargets) {
    try {
      syncStandaloneToNodejs(standaloneDir, nodejsDir);
    } catch (err) {
      console.error('[postbuild] Échec sync vers', nodejsDir, err.message);
      process.exit(1);
    }
  }

  const publicHtmlTargets = findPublicHtmlTargets(projectRoot, nodejsTargets);
  for (const publicHtmlDir of publicHtmlTargets) {
    try {
      syncStaticToPublicHtml(projectRoot, publicHtmlDir);
    } catch (err) {
      console.error('[postbuild] Échec sync static vers', publicHtmlDir, err.message);
      process.exit(1);
    }
  }

  return { synced: nodejsTargets.length, skipped: false };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const result = runSync(root);
  if (!result.skipped) {
    console.log('[postbuild] Sync terminé (' + result.synced + ' cible(s) nodejs).');
  }
}

module.exports = { findNodejsTargets, runSync, syncStandaloneToNodejs, syncStaticToPublicHtml };
