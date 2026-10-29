import { fileURLToPath } from 'node:url';

process.env.DATABASE_URL ||= `file:${fileURLToPath(new URL('../../prisma/mock.db', import.meta.url)).replaceAll('\\', '/')}`;

export default {
  reactStrictMode: false,
  ...(process.env.NODE_ENV === 'development' && process.env.ERP_DEV_DIST_DIR
    ? { distDir: process.env.ERP_DEV_DIST_DIR } : {}),
};
