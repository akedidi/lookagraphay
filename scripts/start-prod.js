#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || '3000';
const env = { ...process.env, HOSTNAME: '0.0.0.0', PORT: port };

const standaloneServer = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
const fallbackServer = path.join(__dirname, '..', 'server.js');

const entry = fs.existsSync(standaloneServer) ? standaloneServer : fallbackServer;

console.log(`[start] Launching ${path.basename(path.dirname(entry))}/${path.basename(entry)} on 0.0.0.0:${port}`);

require('child_process')
  .spawn(process.execPath, [entry], { stdio: 'inherit', env })
  .on('exit', (code) => process.exit(code ?? 1));
