/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: false,
  output: 'export',
  trailingSlash: true,
  transpilePackages: ['@erp/ui', '@erp/app-context'],
};
