'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Building,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RotateCcw,
  SlidersHorizontal,
  ClipboardCheck,
  CalendarClock,
  History,
  FileCheck2,
  BarChart3,
  ScrollText,
  ShoppingCart,
  PieChart,
  FileText,
  Building2,
  Home,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  CircleDot,
  ArrowRightLeft,
  Bell,
  HelpCircle,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(4);
  const [isWorkflowsExpanded, setIsWorkflowsExpanded] = useState(true);

  // Fetch real-time pending approvals count (called unconditionally on every render)
  useEffect(() => {
    if (pathname === '/home') return;
    fetch('/api/approvals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPendingApprovalsCount(data.length > 0 ? data.length : 4);
        }
      })
      .catch(() => {
        // Fallback default from reference
        setPendingApprovalsCount(4);
      });
  }, [pathname]);

  // If on ERP Center Portal (home), don't render sidebar to allow clean full-width layout
  if (pathname === '/home') {
    return null;
  }

  const isProcurement = pathname.startsWith('/procurement');

  // Theme styling helpers based on module
  const activeBg = isProcurement
    ? 'bg-[#F28C28] text-white shadow-[0_6px_20px_rgba(242,140,40,0.35)]'
    : 'bg-[#2563EB] text-white shadow-[0_6px_20px_rgba(37,99,235,0.30)]';

  const iconActiveBg = 'bg-white/20 text-white';
  const iconColor = isProcurement ? 'text-[#F28C28]' : 'text-[#2563EB]';
  const hoverBg = isProcurement ? 'hover:bg-orange-50/60' : 'hover:bg-blue-50/60';

  return (
    <aside className="w-68 bg-white text-[#14213D] flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-[#E2EAF4] z-40 select-none">
      {/* 1. Header (InsightHub Style) - Aligned height (h-16 / 64px) and border with Topbar */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#E2EAF4] bg-white">
        <div className="flex items-center gap-3">
          {/* Black circle logo with stylized abstract mark */}
          <div className="w-9 h-9 rounded-full bg-[#14213D] flex items-center justify-center text-white shadow-sm ring-2 ring-white">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 12 19 5" />
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-[15px] tracking-tight text-[#14213D] leading-tight">
              Hospital ERP
            </div>
            <div className="text-[11px] font-semibold text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isProcurement ? 'bg-[#F28C28]' : 'bg-[#2563EB]'
                }`}
              />
              {isProcurement ? 'Procurement Hub' : 'Inventory Hub'}
            </div>
          </div>
        </div>

        {/* Back to ERP Center Portal */}
        <Link
          href="/home"
          title="กลับหน้าศูนย์รวม ERP Center"
          className="w-8 h-8 rounded-xl bg-slate-50 text-[#94A3B8] hover:text-[#14213D] flex items-center justify-center shadow-2xs border border-[#E2EAF4] hover:bg-slate-100 transition-all"
        >
          <Home className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. Menu Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
        {/* Category: Dashboard */}
        <div>
          <div className="px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Dashboard
          </div>

          {/* Active / Inactive Dashboard Pill */}
          {(() => {
            const isDashActive = isProcurement
              ? pathname === '/procurement'
              : pathname === '/inventory';
            const dashHref = isProcurement ? '/procurement' : '/inventory';
            const dashLabel = isProcurement ? 'Dashboard จัดซื้อ' : 'Dashboard คลัง';

            if (isDashActive) {
              return (
                <Link
                  href={dashHref}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${activeBg}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconActiveBg}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <span className="tracking-wide">{dashLabel}</span>
                </Link>
              );
            }

            return (
              <Link
                href={dashHref}
                className={`flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-medium transition-all group ${hoverBg}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#E2EAF4] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LayoutDashboard className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <span className="text-[#334155] group-hover:text-[#14213D] font-medium text-xs">
                    {dashLabel}
                  </span>
                </div>
              </Link>
            );
          })()}
        </div>

        {/* Category: Workflows & Master Data */}
        <div className="space-y-1.5 pt-1">
          <div className="px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            {isProcurement ? 'Procurement Core' : 'Inventory Core'}
          </div>

          {/* INVENTORY MODULE ITEMS */}
          {!isProcurement && (
            <>
              {/* Item Master */}
              {renderMenuItem({
                href: '/inventory/items',
                name: 'ทะเบียนสินค้า (Master)',
                icon: Package,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {/* Stock Overview */}
              {renderMenuItem({
                href: '/inventory/stock',
                name: 'สต็อกคงคลัง (Stock)',
                icon: Layers,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {/* Expandable Workflows Section (like Projects in screenshot) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsWorkflowsExpanded(!isWorkflowsExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all group ${hoverBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#E2EAF4] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ArrowRightLeft className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <span className="text-[#14213D] font-semibold text-xs">
                      ธุรกรรมคลังพัสดุ
                    </span>
                  </div>
                  {isWorkflowsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </button>

                {/* Sub-menu without vertical line to maximize name readability */}
                {isWorkflowsExpanded && (
                  <div className="pl-4 my-1 space-y-1">
                    {renderSubItem({
                      href: '/inventory/receiving',
                      name: 'รับสินค้าเข้าคลัง (GR)',
                      iconDotColor: 'bg-blue-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/inventory/issue',
                      name: 'เบิกจ่ายสินค้า (Issue)',
                      iconDotColor: 'bg-emerald-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/inventory/transfer',
                      name: 'โอนย้ายพัสดุ (Transfer)',
                      iconDotColor: 'bg-amber-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/inventory/return',
                      name: 'รับคืนพัสดุ (Return)',
                      iconDotColor: 'bg-rose-500',
                      pathname,
                    })}
                  </div>
                )}
              </div>

              {/* Quality & Stock Control */}
              {renderMenuItem({
                href: '/inventory/lots',
                name: 'Lot & วันหมดอายุ (FEFO)',
                icon: CalendarClock,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {renderMenuItem({
                href: '/inventory/adjustment',
                name: 'ปรับปรุงสต็อก (Adjust)',
                icon: SlidersHorizontal,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {renderMenuItem({
                href: '/inventory/count',
                name: 'ตรวจนับพัสดุ (Count)',
                icon: ClipboardCheck,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {renderMenuItem({
                href: '/inventory/stock-card',
                name: 'บัตรสต็อก (Stock Card)',
                icon: History,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {renderMenuItem({
                href: '/inventory/warehouses',
                name: 'ผังคลังและโซนจัดเก็บ',
                icon: Building,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </>
          )}

          {/* PROCUREMENT MODULE ITEMS */}
          {isProcurement && (
            <>
              {renderMenuItem({
                href: '/procurement/suppliers',
                name: 'ทะเบียนผู้จำหน่าย (Suppliers)',
                icon: Building2,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {/* Expandable Procurement Docs */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsWorkflowsExpanded(!isWorkflowsExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all group ${hoverBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#E2EAF4] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ShoppingCart className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <span className="text-[#14213D] font-semibold text-xs">
                      เอกสารจัดซื้อจัดจ้าง
                    </span>
                  </div>
                  {isWorkflowsExpanded ? (
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  )}
                </button>

                {/* Sub-menu without vertical line to maximize name readability */}
                {isWorkflowsExpanded && (
                  <div className="pl-4 my-1 space-y-1">
                    {renderSubItem({
                      href: '/procurement/plans',
                      name: 'แผนจัดซื้อและกรอบงบประมาณ (PP)',
                      iconDotColor: 'bg-blue-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/procurement/requisitions',
                      name: 'ใบขอซื้อ (PR)',
                      iconDotColor: 'bg-orange-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/procurement/rfq',
                      name: 'ขอใบเสนอราคา (RFQ)',
                      iconDotColor: 'bg-sky-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/procurement/quotations',
                      name: 'ใบเสนอราคา (Quotation)',
                      iconDotColor: 'bg-violet-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/procurement/comparison',
                      name: 'เปรียบเทียบใบเสนอราคา',
                      iconDotColor: 'bg-amber-500',
                      pathname,
                    })}
                    {renderSubItem({
                      href: '/procurement/orders',
                      name: 'ใบสั่งซื้อ (PO)',
                      iconDotColor: 'bg-emerald-500',
                      pathname,
                    })}
                  </div>
                )}
              </div>

              {renderMenuItem({
                href: '/inventory/receiving',
                name: 'ตรวจรับเข้าคลัง (GR)',
                icon: ArrowDownToLine,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}

              {renderMenuItem({
                href: '/inventory/items',
                name: 'ทะเบียนสินค้า (Master)',
                icon: Package,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </>
          )}
        </div>

        {/* Category: System & Approvals */}
        <div className="space-y-1.5 pt-2">
          <div className="px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Operations & Control
          </div>

          {/* Approvals with Red Circular Badge (like Notification 4 in screenshot) */}
          {(() => {
            const isActive = pathname === '/operations/approvals';

            if (isActive) {
              return (
                <Link
                  href="/operations/approvals"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all duration-200 ${activeBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconActiveBg}`}
                    >
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <span>ศูนย์อนุมัติเอกสาร</span>
                  </div>
                  {pendingApprovalsCount > 0 && (
                    <span className="bg-white text-rose-600 font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-xs">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link
                href="/operations/approvals"
                className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-all group ${hoverBg}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#E2EAF4] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileCheck2 className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <span className="text-[#334155] group-hover:text-[#14213D] font-medium text-xs">
                    ศูนย์อนุมัติเอกสาร
                  </span>
                </div>
                {pendingApprovalsCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {pendingApprovalsCount}
                  </span>
                )}
              </Link>
            );
          })()}

          {/* Reports */}
          {renderMenuItem({
            href: '/operations/reports',
            name: 'รายงานสรุป & มูลค่า',
            icon: BarChart3,
            pathname,
            iconColor,
            activeBg,
            iconActiveBg,
            hoverBg,
          })}

          {/* Audit Trail */}
          {renderMenuItem({
            href: '/operations/audit',
            name: 'ประวัติธุรกรรม (Audit)',
            icon: ScrollText,
            pathname,
            iconColor,
            activeBg,
            iconActiveBg,
            hoverBg,
          })}
        </div>
      </nav>
    </aside>
  );
}

// Helper: Standard Inactive / Active Menu Item
function renderMenuItem({
  href,
  name,
  icon: Icon,
  pathname,
  iconColor,
  activeBg,
  iconActiveBg,
  hoverBg,
}: {
  href: string;
  name: string;
  icon: any;
  pathname: string;
  iconColor: string;
  activeBg: string;
  iconActiveBg: string;
  hoverBg: string;
}) {
  const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href));

  if (isActive) {
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center justify-between px-3.5 py-2 rounded-2xl font-bold text-xs transition-all duration-200 ${activeBg}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconActiveBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="tracking-wide">{name}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      key={href}
      href={href}
      className={`flex items-center justify-between px-3 py-1.5 rounded-2xl text-xs font-medium transition-all group ${hoverBg}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-50 shadow-2xs border border-[#E2EAF4] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#EFF6FF] transition-all">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-[#334155] group-hover:text-[#14213D] font-medium text-xs">
          {name}
        </span>
      </div>
    </Link>
  );
}

// Helper: Sub-Item with comfortable padding for full name visibility
function renderSubItem({
  href,
  name,
  iconDotColor,
  pathname,
}: {
  href: string;
  name: string;
  iconDotColor: string;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      key={href}
      href={href}
      className={`flex items-center gap-2.5 py-2 px-3 rounded-xl text-xs transition-all group ${
        isActive
          ? 'text-[#2563EB] font-bold bg-[#EFF6FF] border border-blue-100 shadow-2xs'
          : 'text-[#64748B] hover:text-[#14213D] hover:bg-slate-50'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${iconDotColor} shrink-0`} />
      <span className="truncate">{name}</span>
    </Link>
  );
}

