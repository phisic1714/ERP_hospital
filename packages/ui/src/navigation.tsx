'use client';

import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';

const AppBasePath = createContext('');
const modulePaths = ['/inventory', '/procurement', '/operations', '/budget', '/hr', '/finance'];

export function AppRoutingProvider({ basePath, children }: { basePath: string; children: ReactNode }) {
  return <AppBasePath.Provider value={basePath}>{children}</AppBasePath.Provider>;
}

function routeInApp(href: string, basePath: string) {
  const pathname = href.split(/[?#]/)[0];
  const targetApp = modulePaths.find((prefix) => pathname === prefix || pathname.startsWith(prefix + '/')) || '';
  const absolutePath = href.startsWith('/') && !href.startsWith('//');
  const local = !absolutePath || targetApp === basePath;
  const stripped = local && basePath && absolutePath ? href.slice(basePath.length) : href;
  const target = stripped === '' ? '/' : /^[?#]/.test(stripped) ? '/' + stripped : stripped;
  return { local, target };
}

export function useAppPathname() {
  const pathname = usePathname().replace(/\/+$/, '') || '/';
  const basePath = useContext(AppBasePath);
  return basePath + (basePath && pathname === '/' ? '' : pathname);
}

type AppLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & { href: string };

export default function AppLink({ href, prefetch, replace, scroll, shallow, locale, ...props }: AppLinkProps) {
  const basePath = useContext(AppBasePath);
  const { local, target } = routeInApp(href, basePath);
  if (!local) return <a {...props} href={href} />;
  return <NextLink {...props} href={target} prefetch={prefetch} replace={replace} scroll={scroll} shallow={shallow} locale={locale} />;
}

export function useAppRouter() {
  const router = useRouter();
  const basePath = useContext(AppBasePath);
  return {
    ...router,
    push(href: string, options?: Parameters<typeof router.push>[1]) {
      const { local, target } = routeInApp(href, basePath);
      if (local) router.push(target, options);
      else window.location.assign(href);
    },
    replace(href: string, options?: Parameters<typeof router.replace>[1]) {
      const { local, target } = routeInApp(href, basePath);
      if (local) router.replace(target, options);
      else window.location.replace(href);
    },
  };
}
