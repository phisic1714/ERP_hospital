import '@erp/ui/globals.css';
import type { ReactNode } from 'react';
import { ApplicationLayout, applicationMetadata } from '@erp/ui/layout/ApplicationLayout';

export const metadata = applicationMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return <ApplicationLayout basePath="/hr">{children}</ApplicationLayout>;
}
