'use client';

import React from 'react';
import { useAppPathname } from '@erp/ui/navigation';

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = useAppPathname();
  const isHome = pathname === '/home';

  return (
    <main className={`flex-1 overflow-y-auto ${isHome ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
      {children}
    </main>
  );
}
