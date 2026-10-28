import { existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const target = resolve(process.env.MOCK_DATABASE_PATH || resolve(root, 'prisma/mock.db'));

if (existsSync(target)) {
  console.log('Existing mock database retained. Seed skipped.');
} else {
  mkdirSync(dirname(target), { recursive: true });
  // Seed a new temporary DB, never the existing dev.db or a user's database.
  const staging = `${target}.${randomUUID()}.tmp`;
  writeFileSync(staging, '', { flag: 'wx' });
  const env = { ...process.env, DATABASE_URL: `file:${staging.replaceAll('\\', '/')}` };
  const run = (args) => execFileSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
  run(['node_modules/prisma/build/index.js', 'db', 'push', '--schema=prisma/schema.prisma', '--skip-generate']);
  for (const seed of ['seed.js', 'seed-procurement.js', 'seed-sourcing.js']) run([`prisma/${seed}`]);
  if (existsSync(target)) throw new Error('Database appeared during setup; existing file preserved.');
  renameSync(staging, target);
  console.log('New mock database ready. Existing database files were not changed.');
}
