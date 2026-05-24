/**
 * Hostinger / LiteSpeed (lsnode.js) : le serveur Next standalone appelle listen()
 * plusieurs fois → crash en boucle. Un seul createServer().listen() ici.
 */
const path = require('path');
const fs = require('fs');
const http = require('http');
const { parse } = require('url');

const root = path.resolve(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');

function fatal(message, err) {
  console.error('[lookagraphy]', message);
  if (err) console.error(err);
  process.exit(1);
}

if (process.env.HOSTNAME && /lsws|extapp-sock|\.sock/i.test(process.env.HOSTNAME)) {
  console.warn('[lookagraphy] HOSTNAME LiteSpeed ignoré:', process.env.HOSTNAME);
}
process.env.HOSTNAME = '0.0.0.0';
process.env.NODE_ENV = 'production';

const port = parseInt(process.env.PORT || '3000', 10);
if (!Number.isFinite(port) || port <= 0) {
  fatal(`PORT invalide: ${process.env.PORT}`);
}

if (!fs.existsSync(path.join(standaloneDir, '.next'))) {
  fatal(`Build manquant: ${standaloneDir} — lancez npm run build`);
}

const staticDir = path.join(standaloneDir, '.next', 'static');
const publicDir = path.join(standaloneDir, 'public');
if (!fs.existsSync(staticDir) || !fs.existsSync(publicDir)) {
  fatal('Assets standalone incomplets — relancez npm run build (postbuild)');
}

process.chdir(standaloneDir);

console.log('[lookagraphy] Mode LiteSpeed — serveur HTTP unique');
console.log('[lookagraphy] Node', process.version, '| PORT=', port, '| cwd=', process.cwd());

const next = require('next');
const app = next({ dev: false, dir: standaloneDir });
const handle = app.getRequestHandler();

let listenDone = false;

app
  .prepare()
  .then(() => {
    const server = http.createServer(async (req, res) => {
      try {
        await handle(req, res, parse(req.url, true));
      } catch (err) {
        console.error('[lookagraphy] request error', req.url, err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    });

    if (listenDone) {
      fatal('listen() déjà appelé — incompatible LiteSpeed');
    }
    listenDone = true;

    server.listen(port, '0.0.0.0', () => {
      console.log('[lookagraphy] ✓ Ready on http://0.0.0.0:' + port);
    });

    server.on('error', (err) => {
      console.error('[lookagraphy] server error', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    fatal('next.prepare() a échoué', err);
  });
