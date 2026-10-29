import { createServer } from 'node:net';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const definitions = [
  ['shell', 3000], ['procurement', 3001], ['operations', 3002],
  ['inventory', 3003], ['mock-api', 3004],
];
const apps = definitions.map(([name, defaultPort]) => {
  const key = name === 'mock-api' ? 'API' : name.toUpperCase();
  const port = Number(process.env[`ERP_DEV_${key}_PORT`] || defaultPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid port for ${name}`);
  return { name, port, key };
});
if (new Set(apps.map((app) => app.port)).size !== apps.length) throw new Error('Dev ports must be different.');

// Check all ports before starting anything; never terminate another process.
for (const { name, port } of apps) {
  await new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(`Port ${port} (${name}) is in use. Stop the previous dev terminal and retry npm run dev.`)));
    server.listen(port, () => server.close(resolvePort));
  });
}

const env = { ...process.env, NODE_ENV: 'development' };
for (const { key, port } of apps) env[`ERP_DEV_${key}_ORIGIN`] = `http://127.0.0.1:${port}`;
const run = (args) => execFileSync(process.execPath, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
run(['node_modules/prisma/build/index.js', 'generate', '--schema=prisma/schema.prisma']);
run(['scripts/init-mock-db.mjs']);

const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    try {
      if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
      else child.kill('SIGTERM');
    } catch {}
  }
  process.exit(code);
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
for (const { name, port } of apps) {
  const child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), 'dev', '-p', String(port)], {
    cwd: resolve(root, 'apps', name), env, stdio: 'inherit', windowsHide: true,
  });
  children.push(child);
  child.once('error', (error) => { console.error(`${name}: ${error.message}`); stop(1); });
  child.once('exit', (code) => { if (!stopping) stop(code || 1); });
}
console.log(`\nERP dev entry: http://localhost:${apps[0].port}/home/\n`);
