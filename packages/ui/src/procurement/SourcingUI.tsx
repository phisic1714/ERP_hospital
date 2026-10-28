'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { X, RefreshCw } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Shared UI building blocks for sourcing pages (RFQ / QT / Compare)  */
/* ------------------------------------------------------------------ */

export function SourcingHeader({
  crumb,
  title,
  subtitle,
  icon: Icon,
  onRefresh,
  actions,
}: {
  crumb: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#F28C28] mb-1">
          <Link href="/procurement" className="hover:underline">
            ระบบจัดซื้อจัดจ้าง
          </Link>
          <span>/</span>
          <span className="text-slate-500">{crumb}</span>
        </div>
        <h1 className="text-2xl font-bold text-[#14213D] flex items-center gap-2">
          <Icon className="w-7 h-7 text-[#F28C28]" />
          <span>{title}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E2EAF4] rounded-xl text-xs font-semibold text-slate-600 shadow-2xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเฟรช</span>
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'orange',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ElementType;
  tone?: 'orange' | 'sky' | 'emerald' | 'violet' | 'amber' | 'slate';
}) {
  const tones: Record<string, string> = {
    orange: 'bg-orange-50 text-[#F28C28] border-orange-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs flex items-center gap-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-slate-500">{label}</div>
        <div className="text-xl font-bold text-[#14213D] tabular-nums leading-tight">{value}</div>
        {hint && <div className="text-[10px] text-slate-400 truncate">{hint}</div>}
      </div>
    </div>
  );
}

export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            value === tab.id
              ? 'bg-[#F28C28] text-white font-semibold shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <span>{tab.label}</span>
          {typeof tab.count === 'number' && (
            <span
              className={`px-1.5 rounded-md text-[10px] font-bold ${
                value === tab.id ? 'bg-white/25 text-white' : 'bg-white text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  size = 'lg',
  headerRight,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  icon: React.ElementType;
  size?: 'md' | 'lg' | 'xl';
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!open) return null;
  const width = size === 'md' ? 'max-w-2xl' : size === 'lg' ? 'max-w-4xl' : 'max-w-6xl';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 animate-fade-in">
      <div
        className={`bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full ${width} max-h-[94vh] flex flex-col overflow-hidden animate-scale-up`}
      >
        <div className="p-5 flex items-center justify-between border-b border-[#E2EAF4] shrink-0 gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28] shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base text-[#0F172A] leading-snug truncate">{title}</h3>
              {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F5F8FC]/60 space-y-5">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-white border-t border-[#E2EAF4] flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  right,
  children,
  className = '',
}: {
  title: string;
  icon?: React.ElementType;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b border-[#E2EAF4] flex items-center justify-between gap-2 bg-[#F8FAFC]">
        <div className="flex items-center gap-2 font-bold text-xs text-[#14213D]">
          {Icon && <Icon className="w-4 h-4 text-[#F28C28]" />}
          <span>{title}</span>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export const inputCls =
  'w-full px-3 py-2 border border-[#E2EAF4] rounded-lg bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F28C28] text-xs';

export const btnPrimary =
  'px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

export const btnSecondary =
  'px-4 py-2 bg-white hover:bg-slate-50 border border-[#E2EAF4] text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all';

export const btnSuccess =
  'px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

export const fmtDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';

export const fmtMoney = (n?: number | null) =>
  (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
