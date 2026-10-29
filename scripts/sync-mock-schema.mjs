import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const root = fileURLToPath(new URL('../', import.meta.url));
const fingerprint = () => createHash('sha256').update(readFileSync(resolve(root, 'prisma/schema.prisma'))).digest('hex');

export function recordMockSchema(database) {
  writeFileSync(`${database}.schema-hash`, fingerprint());
}

export async function syncMockSchema(database) {
  const marker = `${database}.schema-hash`;
  if (existsSync(marker) && readFileSync(marker, 'utf8') === fingerprint()) return;

  const backupDir = resolve(dirname(database), '.local-backups');
  mkdirSync(backupDir, { recursive: true });
  const backup = resolve(backupDir, `mock-before-schema-${Date.now()}-${randomUUID()}.db`);
  const url = `file:${database.replaceAll('\\', '/')}`;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    // SQLite makes a consistent backup even if another local reader is active.
    await prisma.$executeRawUnsafe(`VACUUM INTO '${backup.replaceAll('\\', '/').replaceAll("'", "''")}'`);
  } finally {
    await prisma.$disconnect();
  }
  console.log(`Mock schema backup: ${backup}`);
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--schema=prisma/schema.prisma', '--skip-generate'], {
    cwd: root, env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit', windowsHide: true,
  });
  // No --accept-data-loss flag: incompatible future changes must fail safely.
  recordMockSchema(database);
}
