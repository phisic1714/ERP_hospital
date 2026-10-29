import sharedConfig from '@erp/next-config';
import nextConstants from 'next/constants.js';

export default function createShellConfig(phase) {
  if (phase !== nextConstants.PHASE_DEVELOPMENT_SERVER) return { ...sharedConfig };

  const modules = ['inventory', 'procurement', 'operations'];
  const defaults = { inventory: 3003, procurement: 3001, operations: 3002 };
  return {
    ...sharedConfig,
    output: undefined,
    skipTrailingSlashRedirect: true,
    async rewrites() {
      const routes = modules.flatMap((name) => {
        const origin = process.env[`ERP_DEV_${name.toUpperCase()}_ORIGIN`] || `http://127.0.0.1:${defaults[name]}`;
        return [
          { source: `/${name}`, destination: `${origin}/${name}/` },
          { source: `/${name}/:path*`, destination: `${origin}/${name}/:path*` },
        ];
      });
      const apiOrigin = process.env.ERP_DEV_API_ORIGIN || 'http://127.0.0.1:3004';
      routes.push({ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` });
      return { beforeFiles: routes };
    },
  };
}
