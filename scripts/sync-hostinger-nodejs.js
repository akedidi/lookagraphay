/**
 * Copie .next/standalone → nodejs/ (Passenger) + .next/static → public_html/ (LiteSpeed).
 * Appelé par scripts/postbuild.js après chaque build.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_NAME = 'lucagraphy';
const LEGACY_FILES = [
  'server-app.js',
  'load-env.js',
  '.lookagraphy-instance.lock',
  '.lookagraphy.pid.lock',
];
const STANDALONE_LOCK_DIRS = [
  '.lookagraphy.lock.d',
  '.lookagraphy-instance.lock',
  '.lookagraphy.pid.lock',
];
const STALE_NODEJS_DIRS = ['.next', 'node_modules', 'public'];

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

/**
 * Évite 503 après redeploy : anciens workers Next / lsnode encore actifs.
 * Appelé une seule fois avant restart.txt (pas dans la boucle nodejs/).
 */
function killZombieNextWorkers(projectRoot) {
  try {
    const { execSync } = require('child_process');
    const markers = ['next-server'];
    const domain = process.env.HOSTINGER_NODEJS_DIR || projectRoot;
    if (isHostingerPath(domain)) {
      const site = domain.split(`${path.sep}domains${path.sep}`)[1]?.split(path.sep)[0];
      if (site) markers.push(site);
    }
    for (const marker of markers) {
      execSync(`pkill -9 -u $(whoami) -f '${marker}' 2>/dev/null || true`, {
        shell: '/bin/sh',
        stdio: 'pipe',
      });
    }
    execSync('sleep 2', { shell: '/bin/sh', stdio: 'pipe' });
    console.log('[postbuild]   workers zombies arrêtés (next-server' + (markers.length > 1 ? ', ' + markers[1] : '') + ')');
  } catch (_) {}
}

function clearStaleStandaloneLocks(publicHtml) {
  const stand = path.join(publicHtml, '.next', 'standalone');
  if (!fs.existsSync(stand)) return;
  for (const name of STANDALONE_LOCK_DIRS) {
    try {
      fs.rmSync(path.join(stand, name), { recursive: true, force: true });
    } catch (_) {}
  }
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

/** Passenger lit nodejs/server.js — on installe un lanceur vers public_html/.next/standalone (pas de copie du build). */
function installPassengerLauncher(nodejsDir, projectRoot) {
  const launcherSrc = path.join(__dirname, 'hostinger-launcher.js');
  const launcherDest = path.join(nodejsDir, 'server.js');

  console.log('[postbuild] Install Passenger launcher →', nodejsDir);

  for (const legacy of LEGACY_FILES) {
    try {
      fs.unlinkSync(path.join(nodejsDir, legacy));
    } catch (_) {}
  }

  for (const stale of STALE_NODEJS_DIRS) {
    const p = path.join(nodejsDir, stale);
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log('[postbuild]   supprimé nodejs/' + stale + ' (copie obsolète)');
    }
  }

  fs.copyFileSync(launcherSrc, launcherDest);
  console.log('[postbuild]   → nodejs/server.js (pointe vers public_html/.next/standalone)');

  const publicHtml =
    projectRoot === path.dirname(nodejsDir) && path.basename(projectRoot) === 'public_html'
      ? projectRoot
      : path.join(path.dirname(nodejsDir), 'public_html');
  const standaloneServer = path.join(publicHtml, '.next', 'standalone', 'server.js');
  if (!fs.existsSync(standaloneServer)) {
    console.warn('[postbuild] Attention: standalone pas encore présent dans', publicHtml);
  } else {
    console.log('[postbuild]   cible runtime:', standaloneServer);
  }

  const restartDir = path.join(nodejsDir, 'tmp');
  fs.mkdirSync(restartDir, { recursive: true });
  fs.writeFileSync(path.join(restartDir, 'restart.txt'), String(Date.now()));
  console.log('[postbuild]   → nodejs/tmp/restart.txt (redémarrage Passenger)');
}

/** Fusionne les fichiers (ne supprime pas les anciens chunks/CSS) pour les visites encore servies par le CDN. */
function mergeCopyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      mergeCopyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** LiteSpeed sert souvent /_next/static depuis public_html — doit matcher le BUILD_ID du serveur. */
function syncStaticToPublicHtml(projectRoot, publicHtmlDir) {
  const staticSrc = path.join(projectRoot, '.next', 'static');
  const buildIdSrc = path.join(projectRoot, '.next', 'BUILD_ID');
  if (!fs.existsSync(staticSrc) || !fs.existsSync(buildIdSrc)) return;

  const nextDir = path.join(publicHtmlDir, '.next');
  const destStatic = path.join(nextDir, 'static');
  fs.mkdirSync(nextDir, { recursive: true });
  mergeCopyDir(staticSrc, destStatic);
  fs.copyFileSync(buildIdSrc, path.join(nextDir, 'BUILD_ID'));
  aliasStaleStaticAssets(projectRoot, destStatic);

  const standaloneStatic = path.join(publicHtmlDir, '.next', 'standalone', '.next', 'static');
  if (fs.existsSync(path.join(publicHtmlDir, '.next', 'standalone', 'server.js'))) {
    mergeCopyDir(destStatic, standaloneStatic);
    fs.copyFileSync(
      path.join(publicHtmlDir, '.next', 'BUILD_ID'),
      path.join(publicHtmlDir, '.next', 'standalone', '.next', 'BUILD_ID')
    );
    console.log('[postbuild] Merge static → standalone/.next/static (Passenger sert ce dossier)');
  }

  console.log('[postbuild] Merge .next/static →', publicHtmlDir, '(anciens fichiers conservés)');
}

/** Duplique le CSS courant sous d’anciens noms encore référencés par du HTML en cache CDN. */
function aliasStaleStaticAssets(projectRoot, destStaticDir) {
  const manifestPath = path.join(projectRoot, '.hostinger-stale-assets.json');
  if (!fs.existsSync(manifestPath)) return;

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    console.warn('[postbuild] .hostinger-stale-assets.json invalide — ignoré');
    return;
  }

  const cssDir = path.join(destStaticDir, 'css');
  if (!fs.existsSync(cssDir) || !Array.isArray(manifest.css) || manifest.css.length === 0) return;

  const currentCss = fs.readdirSync(cssDir).filter((f) => f.endsWith('.css'));
  if (currentCss.length === 0) return;
  const latest = path.join(cssDir, currentCss[currentCss.length - 1]);

  for (const staleName of manifest.css) {
    if (typeof staleName !== 'string' || !staleName.endsWith('.css')) continue;
    const dest = path.join(cssDir, staleName);
    if (fs.existsSync(dest)) continue;
    fs.copyFileSync(latest, dest);
    console.log('[postbuild]   alias CSS', staleName, '←', path.basename(latest));
  }
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

  if (onHostinger) {
    const publicHtmlTargets = findPublicHtmlTargets(projectRoot, nodejsTargets);
    for (const publicHtmlDir of publicHtmlTargets) {
      clearStaleStandaloneLocks(publicHtmlDir);
    }
    killZombieNextWorkers(projectRoot);
  }

  for (const nodejsDir of nodejsTargets) {
    try {
      installPassengerLauncher(nodejsDir, projectRoot);
    } catch (err) {
      console.error('[postbuild] Échec launcher vers', nodejsDir, err.message);
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

module.exports = {
  findNodejsTargets,
  runSync,
  installPassengerLauncher,
  syncStaticToPublicHtml,
  killZombieNextWorkers,
  clearStaleStandaloneLocks,
};
