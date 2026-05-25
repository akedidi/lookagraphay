/**
 * Point d'entrée Passenger (nodejs/server.js).
 * Ne duplique pas le build : exécute toujours public_html/.next/standalone (dernier deploy Git).
 */
const fs = require('fs');
const path = require('path');

const publicHtml =
  process.env.HOSTINGER_PUBLIC_HTML_DIR ||
  path.join(__dirname, '..', 'public_html');

const standaloneDir = path.join(publicHtml, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

if (!fs.existsSync(standaloneServer)) {
  console.error('[lookagraphy] Build introuvable:', standaloneServer);
  console.error('[lookagraphy] Lancez npm run build dans public_html/ ou vérifiez HOSTINGER_PUBLIC_HTML_DIR');
  process.exit(1);
}

process.chdir(standaloneDir);
console.log('[lookagraphy] Passenger →', standaloneServer);
require(standaloneServer);
