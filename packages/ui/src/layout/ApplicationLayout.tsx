import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProvider } from '@erp/app-context';
import { AppRoutingProvider } from '../navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MainContent } from './MainContent';
import { ToastContainer } from '../ui/ToastContainer';

export const applicationMetadata: Metadata = {
  title: 'Hospital ERP & Inventory Management System',
  description: 'Enterprise ERP ระบบบริหารจัดการโรงพยาบาล คลังสินค้า และจัดซื้อจัดจ้าง',
};

export function ApplicationLayout({ children, basePath = '' }: { children: ReactNode; basePath?: string }) {
  return (
    <html lang="th">
      <body className="bg-[#F5F8FC] text-[#14213D] antialiased selection:bg-blue-100 selection:text-blue-900">
        <AppRoutingProvider basePath={basePath}>
          <AppProvider>
            <div className="flex min-h-screen bg-[#F5F8FC]">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <MainContent>{children}</MainContent>
              </div>
            </div>
            <ToastContainer />
          </AppProvider>
        </AppRoutingProvider>
      </body>
    </html>
  );
}
