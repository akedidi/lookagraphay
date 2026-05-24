/**
 * Lance .next/standalone/server.js (patché au build pour LiteSpeed).
 */
const path = require('path');
const fs = require('fs');

const standaloneServer = path.resolve(__dirname, '..', '.next', 'standalone', 'server.js');

if (!fs.existsSync(standaloneServer)) {
  console.error('[lookagraphy] Build manquant — exécutez: npm run build');
  process.exit(1);
}

require(standaloneServer);
