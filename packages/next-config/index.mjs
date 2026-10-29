/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: false,
  ...(process.env.NODE_ENV === 'development' && process.env.ERP_DEV_DIST_DIR
    ? { distDir: process.env.ERP_DEV_DIST_DIR } : {}),
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: process.env.NODE_ENV === 'development',
  transpilePackages: ['@erp/ui', '@erp/app-context'],
};
