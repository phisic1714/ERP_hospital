import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import os from 'os';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NOW_REGION
  );

  const databaseUrl = process.env.DATABASE_URL || '';

  // If running in Vercel/AWS Lambda serverless and using SQLite (file: or no explicit URL)
  if (isVercel && (!databaseUrl || databaseUrl.startsWith('file:'))) {
    try {
      const tmpDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      const tmpDbPath = path.join(tmpDir, 'dev.db');

      let ready = false;
      if (fs.existsSync(tmpDbPath)) {
        try {
          const stat = fs.statSync(tmpDbPath);
          if (stat.size > 0) ready = true;
        } catch (_) {}
      }

      if (!ready) {
        // Look for the bundled SQLite DB file
        const candidates = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'dev.db'),
          path.resolve('./prisma/dev.db'),
          path.resolve('./dev.db'),
        ];

        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            try {
              const stat = fs.statSync(candidate);
              if (stat.size > 0) {
                fs.copyFileSync(candidate, tmpDbPath);
                console.log(`[Vercel Demo DB] Successfully initialized /tmp/dev.db from ${candidate} (${stat.size} bytes)`);
                ready = true;
                break;
              }
            } catch (copyErr) {
              console.error('[Vercel Demo DB] Error copying candidate to /tmp:', copyErr);
            }
          }
        }
      }

      if (ready) {
        return new PrismaClient({
          datasources: {
            db: {
              url: `file:${tmpDbPath}`,
            },
          },
          log: ['error'],
        });
      }
    } catch (err) {
      console.error('[Vercel Demo DB] Fallback initialization error:', err);
    }
  }

  // Standard initialization for local dev or standard DB
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

