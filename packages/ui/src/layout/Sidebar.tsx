'use client';

import React, { useState, useEffect } from 'react';
import Link from '@erp/ui/navigation';
import { useAppPathname } from '@erp/ui/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Building,
  ArrowDownToLine,
  SlidersHorizontal,
  ClipboardCheck,
  CalendarClock,
  History,
  FileCheck2,
  BarChart3,
  ScrollText,
  ShoppingCart,
  Building2,
  Home,
  ChevronRight,
  ChevronDown,
  ArrowRightLeft,
  Users,
  Network,
  Briefcase,
  FileSignature,
  Clock,
  CalendarDays,
  Timer,
  Palmtree,
  Wallet,
  Coins,
  HeartHandshake,
  Receipt,
  UserPlus,
  GraduationCap,
  Target,
  Award,
  ShieldCheck,
  BadgeCheck,
  AlertTriangle,
  Settings,
  PieChart,
  Landmark,
  BookOpen,
  CreditCard,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';

export function Sidebar() {
  const pathname = useAppPathname();
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
        setPendingApprovalsCount(4);
      });
  }, [pathname]);

  // If on ERP Center Portal (home), don't render sidebar to allow clean full-width layout
  if (pathname === '/home') {
    return null;
  }

  const isProcurement = pathname.startsWith('/procurement');
  const isHR = pathname.startsWith('/hr');
  const isBudget = pathname.startsWith('/budget');
  const isFinance = pathname.startsWith('/finance');

  // Theme styling helpers based on module
  const activeBg = isProcurement
    ? 'bg-[#F28C28] text-white shadow-[0_6px_20px_rgba(242,140,40,0.35)]'
    : isHR
    ? 'bg-[#0D9488] text-white shadow-[0_6px_20px_rgba(13,148,136,0.30)]'
    : isBudget
    ? 'bg-[#059669] text-white shadow-[0_6px_20px_rgba(5,150,105,0.30)]'
    : isFinance
    ? 'bg-[#0284C7] text-white shadow-[0_6px_20px_rgba(2,132,199,0.30)]'
    : 'bg-[#2563EB] text-white shadow-[0_6px_20px_rgba(37,99,235,0.30)]';

  const iconActiveBg = 'bg-white/20 text-white';
  const iconColor = isProcurement
    ? 'text-[#F28C28]'
    : isHR
    ? 'text-[#0D9488]'
    : isBudget
    ? 'text-[#059669]'
    : isFinance
    ? 'text-[#0284C7]'
    : 'text-[#2563EB]';
  const hoverBg = isProcurement
    ? 'hover:bg-orange-50/60'
    : isHR
    ? 'hover:bg-teal-50/60'
    : isBudget
    ? 'hover:bg-emerald-50/60'
    : isFinance
    ? 'hover:bg-sky-50/60'
    : 'hover:bg-blue-50/60';

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
                  isProcurement
                    ? 'bg-[#F28C28]'
                    : isHR
                    ? 'bg-[#0D9488]'
                    : isBudget
                    ? 'bg-[#059669]'
                    : isFinance
                    ? 'bg-[#0284C7]'
                    : 'bg-[#2563EB]'
                }`}
              />
              {isProcurement
                ? 'Procurement Hub'
                : isHR
                ? 'HUMAN RESOURCE'
                : isBudget
                ? 'BUDGET CONTROL'
                : isFinance
                ? 'FINANCE & ACCOUNTING'
                : 'Inventory Hub'}
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
        {/* ================= HUMAN RESOURCE SIDEBAR ================= */}
        {isHR ? (
          <>
            {/* HUMAN RESOURCE - Dashboard HR */}
            <div>
              <div className="px-3 text-[11px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">
                HUMAN RESOURCE
              </div>
              {(() => {
                const isDashActive = pathname === '/hr';
                if (isDashActive) {
                  return (
                    <Link
                      href="/hr"
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${activeBg}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconActiveBg}`}>
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span className="tracking-wide">Dashboard HR</span>
                    </Link>
                  );
                }
                return (
                  <Link
                    href="/hr"
                    className={`flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-medium transition-all group ${hoverBg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-[#E2EAF4] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <LayoutDashboard className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <span className="text-[#334155] group-hover:text-[#14213D] font-medium text-xs">
                        Dashboard HR
                      </span>
                    </div>
                  </Link>
                );
              })()}
            </div>

            {/* EMPLOYEE MANAGEMENT */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                EMPLOYEE MANAGEMENT
              </div>
              {renderMenuItem({
                href: '/hr/employees',
                name: 'ทะเบียนบุคลากร',
                icon: Users,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/organization',
                name: 'โครงสร้างองค์กร',
                icon: Network,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/positions',
                name: 'ตำแหน่งและอัตรากำลัง',
                icon: Briefcase,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/contracts',
                name: 'สัญญาจ้างและประวัติการทำงาน',
                icon: FileSignature,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* TIME & ATTENDANCE */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                TIME & ATTENDANCE
              </div>
              {renderMenuItem({
                href: '/hr/attendance',
                name: 'บันทึกเวลาเข้า-ออก',
                icon: Clock,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/roster',
                name: 'ตารางเวร (Shift & Roster)',
                icon: CalendarDays,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/overtime',
                name: 'การทำงานล่วงเวลา (OT)',
                icon: Timer,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/leaves',
                name: 'การลาและวันหยุด',
                icon: Palmtree,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* PAYROLL & BENEFITS */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                PAYROLL & BENEFITS
              </div>
              {renderMenuItem({
                href: '/hr/payroll',
                name: 'ประมวลผลเงินเดือน',
                icon: Wallet,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/allowances',
                name: 'ค่าตอบแทนและค่าเวร',
                icon: Coins,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/benefits',
                name: 'สวัสดิการ',
                icon: HeartHandshake,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/deductions',
                name: 'รายการหักและรายรับ',
                icon: Receipt,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* DEVELOPMENT & EVALUATION */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                DEVELOPMENT & EVALUATION
              </div>
              {renderMenuItem({
                href: '/hr/recruitment',
                name: 'สรรหาบุคลากร',
                icon: UserPlus,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/training',
                name: 'ฝึกอบรม',
                icon: GraduationCap,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/performance',
                name: 'ประเมินผลการปฏิบัติงาน',
                icon: Target,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/competency',
                name: 'Competency',
                icon: Award,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* PROFESSIONAL CREDENTIAL */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                PROFESSIONAL CREDENTIAL
              </div>
              {renderMenuItem({
                href: '/hr/licenses',
                name: 'ใบประกอบวิชาชีพ',
                icon: ShieldCheck,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/certificates',
                name: 'ใบรับรองและคุณวุฒิ',
                icon: BadgeCheck,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/expiry-alerts',
                name: 'แจ้งเตือนวันหมดอายุ',
                icon: AlertTriangle,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
                badgeCount: 3,
              })}
            </div>

            {/* REPORTS & SETTINGS */}
            <div className="space-y-1 pt-1 pb-4">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                REPORTS & SETTINGS
              </div>
              {renderMenuItem({
                href: '/hr/reports',
                name: 'รายงาน HR',
                icon: BarChart3,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/approvals',
                name: 'ศูนย์อนุมัติ',
                icon: FileCheck2,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
                badgeCount: 3,
              })}
              {renderMenuItem({
                href: '/hr/settings',
                name: 'ตั้งค่าระบบ',
                icon: Settings,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/hr/audit',
                name: 'ประวัติธุรกรรม (Audit Log)',
                icon: ScrollText,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>
          </>
        ) : isBudget ? (
          /* ================= BUDGET MANAGEMENT SIDEBAR (7 MAIN GROUPS) ================= */
          <>
            {/* 01. Dashboard งบประมาณ */}
            <div>
              <div className="px-3 text-[11px] font-bold text-[#059669] uppercase tracking-wider mb-2">
                01. BUDGET MANAGEMENT
              </div>
              {renderMenuItem({
                href: '/budget',
                name: 'Dashboard งบประมาณ',
                icon: LayoutDashboard,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* 02. จัดทำงบประมาณ (Budget Planning) */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                02. BUDGET PLANNING
              </div>
              {renderMenuItem({
                href: '/budget/planning',
                name: 'จัดทำงบประมาณประจำปี',
                icon: FileSignature,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* 03. จัดสรรงบประมาณ (Budget Allocation) */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                03. BUDGET ALLOCATION
              </div>
              {renderMenuItem({
                href: '/budget/allocation',
                name: 'จัดสรรงบประมาณ',
                icon: PieChart,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* 04. โอนและปรับปรุงงบประมาณ (Budget Adjustment) */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                04. BUDGET ADJUSTMENT
              </div>
              {renderMenuItem({
                href: '/budget/adjustment',
                name: 'โอนและปรับปรุงงบประมาณ',
                icon: ArrowRightLeft,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
                badgeCount: 2,
              })}
            </div>

            {/* 05. ควบคุมงบประมาณ (Budget Control) */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                05. BUDGET CONTROL
              </div>
              {renderMenuItem({
                href: '/budget/control',
                name: 'ควบคุมงบประมาณ (Control)',
                icon: ShieldCheck,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* 06. รายงานงบประมาณ (Budget Reports) */}
            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                06. BUDGET REPORTS
              </div>
              {renderMenuItem({
                href: '/budget/reports',
                name: 'รายงานงบประมาณ',
                icon: BarChart3,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            {/* 07. ตั้งค่าระบบ (Settings & Audit) */}
            <div className="space-y-1 pt-1 pb-4">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                07. SETTINGS & AUDIT
              </div>
              {renderMenuItem({
                href: '/budget/settings',
                name: 'ตั้งค่าระบบงบประมาณ',
                icon: Settings,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/budget/audit',
                name: 'ประวัติธุรกรรม (Audit Log)',
                icon: ScrollText,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>
          </>
        ) : isFinance ? (
          /* ================= FINANCE & ACCOUNTING SIDEBAR ================= */
          <>
            <div>
              <div className="px-3 text-[11px] font-bold text-[#0284C7] uppercase tracking-wider mb-2">
                FINANCE & ACCOUNTING
              </div>
              {renderMenuItem({
                href: '/finance',
                name: 'Dashboard การเงินและบัญชี',
                icon: LayoutDashboard,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>

            <div className="space-y-1 pt-1">
              <div className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                TREASURY & LEDGER
              </div>
              {renderMenuItem({
                href: '/finance/payables',
                name: 'บัญชีเจ้าหนี้และการเบิกจ่าย (AP)',
                icon: CreditCard,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/finance/receivables',
                name: 'บัญชีลูกหนี้และรายรับ (AR)',
                icon: TrendingUp,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
              {renderMenuItem({
                href: '/finance/ledger',
                name: 'สมุดบัญชีแยกประเภท (GL)',
                icon: BookOpen,
                pathname,
                iconColor,
                activeBg,
                iconActiveBg,
                hoverBg,
              })}
            </div>
          </>
        ) : (
          /* ================= INVENTORY & PROCUREMENT SIDEBAR ================= */
          <>
            {/* Category: Dashboard */}
            <div>
              <div className="px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Dashboard
              </div>

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

                  {/* Expandable Workflows Section */}
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
          </>
        )}
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
  badgeCount,
}: {
  href: string;
  name: string;
  icon: any;
  pathname: string;
  iconColor: string;
  activeBg: string;
  iconActiveBg: string;
  hoverBg: string;
  badgeCount?: number;
}) {
  const isActive =
    pathname === href ||
    (href !== '/home' &&
      href !== '/hr' &&
      href !== '/budget' &&
      href !== '/finance' &&
      pathname.startsWith(href));

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
        {badgeCount && badgeCount > 0 && (
          <span className="bg-white text-rose-600 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
            {badgeCount}
          </span>
        )}
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
        <div className="w-8 h-8 rounded-xl bg-slate-50 shadow-2xs border border-[#E2EAF4] flex items-center justify-center group-hover:scale-105 group-hover:bg-white transition-all">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-[#334155] group-hover:text-[#14213D] font-medium text-xs">
          {name}
        </span>
      </div>
      {badgeCount && badgeCount > 0 && (
        <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
          {badgeCount}
        </span>
      )}
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
