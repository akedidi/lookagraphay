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
  console.error('[postbuild] .next/standalone not found — did the build succeed with output: "standalone"?');
  process.exit(1);
}

console.log('[postbuild] Copying public/ → .next/standalone/public/');
copyDir(path.join(root, 'public'), path.join(standaloneDir, 'public'));

console.log('[postbuild] Copying .next/static/ → .next/standalone/.next/static/');
copyDir(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

console.log('[postbuild] Done. Static assets are ready for standalone server.');
