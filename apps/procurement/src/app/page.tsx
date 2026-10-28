'use client';

import React, { useState, useEffect } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import {
  ShoppingCart,
  PieChart,
  FileText,
  Building2,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  RefreshCw,
  Layers,
  ArrowDownToLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';

export default function ProcurementDashboardPage() {
  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();
  const [plans, setPlans] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/procurement/plans').then((r) => r.json()),
      fetch('/api/procurement/requisitions').then((r) => r.json()),
      fetch('/api/pos').then((r) => r.json()),
      fetch('/api/suppliers').then((r) => r.json()),
    ])
      .then(([plansData, prData, poData, supData]) => {
        if (Array.isArray(plansData)) setPlans(plansData);
        if (Array.isArray(prData)) setRequisitions(prData);
        if (Array.isArray(poData)) setPos(poData);
        if (Array.isArray(supData)) setSuppliers(supData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshKey]);

  // Metrics
  const totalAllocated = plans.reduce((s, p) => s + (p.allocatedBudget || 0), 0);
  const totalCommitted = plans.reduce((s, p) => s + (p.committedBudget || 0), 0);
  const totalRemaining = plans.reduce((s, p) => s + (p.remainingBudget || 0), 0);
  const pendingPRs = requisitions.filter((pr) => pr.status === 'PENDING_APPROVAL');
  const approvedPRs = requisitions.filter((pr) => pr.status === 'APPROVED');
  const activePOs = pos.filter((p) => p.status === 'APPROVED' || p.status === 'PARTIALLY_RECEIVED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans pb-12">
      {/* 1. Header Banner (Orange CI: #F28C28) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF7ED] via-[#F8FAFC] to-white border border-[#E2EAF4] p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F28C28]/10 text-[#F28C28] border border-[#F28C28]/20 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>Procurement & Sourcing System</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                PP & PR Ready
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight flex items-center gap-2.5">
              <span>แดชบอร์ดระบบจัดซื้อจัดจ้าง</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              บริหารกระบวนการจัดซื้อตั้งแต่แผนจัดซื้อ (PP), ขอซื้อ (PR), สั่งซื้อ (PO) จนถึงตรวจรับเข้าคลังตามระเบียบ
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => triggerRefresh()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#14213D] rounded-xl text-xs font-semibold border border-[#E2EAF4] shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>รีเฟรช</span>
            </button>
            <Link
              href="/procurement/requisitions"
              className="flex items-center gap-2 px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>เปิดใบขอซื้อ (New PR)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold">แผนจัดซื้อที่ใช้งาน (Active PP)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28]">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#14213D] mt-2 tabular-nums">{plans.length} แผน</div>
          <div className="text-[11px] text-[#94A3B8] mt-1">
            งบประมาณจัดสรร {totalAllocated.toLocaleString()} บ.
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold">ใบขอซื้อรออนุมัติ (Pending PR)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#D97706]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#D97706] mt-2 tabular-nums">
            {pendingPRs.length} <span className="text-xs font-normal text-[#64748B]">ใบ</span>
          </div>
          <div className="text-[11px] text-[#D97706] font-semibold mt-1">
            {approvedPRs.length} ใบอนุมัติแล้ว พร้อมออก PO
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold">ใบสั่งซื้อรอส่งมอบ (Active PO)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669]">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#14213D] mt-2 tabular-nums">
            {activePOs.length} <span className="text-xs font-normal text-[#64748B]">ใบ</span>
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-1">จากผู้จัดจำหน่าย {suppliers.length} ราย</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span className="font-semibold">งบประมาณคงเหลือในกรอบ</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#8B5CF6]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#8B5CF6] mt-2 tabular-nums">
            {totalRemaining.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">บ.</span>
          </div>
          <div className="text-[11px] text-[#8B5CF6] font-semibold mt-1">
            ใช้ไป {totalAllocated > 0 ? Math.round((totalCommitted / totalAllocated) * 100) : 0}% ของกรอบ
          </div>
        </div>
      </div>

      {/* 3. Four Navigation Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PP */}
        <Link
          href="/procurement/plans"
          className="group bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs hover:border-[#F28C28] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 text-[#F28C28] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#14213D] group-hover:text-[#F28C28] transition-colors">
              แผนจัดซื้อ & กรอบงบประมาณ (PP)
            </h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              กำหนดกรอบงบประมาณจัดซื้อประจำปี ควบคุมวงเงิน และติดตามยอดเงินผูกพัน
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E2EAF4] flex items-center justify-between text-xs font-bold text-[#F28C28]">
            <span>จัดการแผนจัดซื้อ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: PR */}
        <Link
          href="/procurement/requisitions"
          className="group bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs hover:border-[#F28C28] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-[#D97706] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#14213D] group-hover:text-[#F28C28] transition-colors">
              ใบขอซื้อพัสดุและยา (PR)
            </h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              สร้างคำขอซื้อจากคลัง/แผนก รองรับการดึงรายการจากสต็อกต่ำ (ROP) อัตโนมัติ
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E2EAF4] flex items-center justify-between text-xs font-bold text-[#F28C28]">
            <span>จัดการใบขอซื้อ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: PO */}
        <Link
          href="/procurement/orders"
          className="group bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs hover:border-[#F28C28] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-[#059669] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#14213D] group-hover:text-[#F28C28] transition-colors">
              ใบสั่งซื้อผู้จัดจำหน่าย (PO)
            </h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              สร้างใบสั่งซื้อ ส่ง Supplier และเชื่อมโยงกับการตรวจรับสินค้าเข้าคลัง (GR)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E2EAF4] flex items-center justify-between text-xs font-bold text-[#059669]">
            <span>จัดการใบสั่งซื้อ</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 4: Suppliers */}
        <Link
          href="/procurement/suppliers"
          className="group bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs hover:border-[#F28C28] hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#8B5CF6] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#14213D] group-hover:text-[#F28C28] transition-colors">
              ทะเบียนผู้จัดจำหน่าย (Suppliers)
            </h3>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              จัดการข้อมูลคู่ค้า เงื่อนไขเครดิต เลขผู้เสียภาษี และประวัติการจัดซื้อ
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E2EAF4] flex items-center justify-between text-xs font-bold text-[#8B5CF6]">
            <span>ดูข้อมูลคู่ค้า</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 4. Two Column Section: Recent PRs & Recent POs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requisitions (PR) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
            <h3 className="font-bold text-sm text-[#14213D] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F28C28]" />
              <span>ใบขอซื้อล่าสุด (Recent PRs)</span>
            </h3>
            <Link
              href="/procurement/requisitions"
              className="text-xs text-[#F28C28] hover:underline font-bold"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="space-y-3">
            {requisitions.slice(0, 4).map((pr) => (
              <div
                key={pr.id}
                className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] flex items-center justify-between gap-3 hover:border-[#CBD5E1] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#F28C28]">{pr.prNumber}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        pr.urgency === 'URGENT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {pr.urgency === 'URGENT' ? 'ด่วน' : 'ปกติ'}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B] mt-1 line-clamp-1">{pr.justification}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">โดย {pr.requesterName}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#14213D] tabular-nums">
                    {pr.totalAmount.toLocaleString()} บ.
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={pr.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders (PO) */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
            <h3 className="font-bold text-sm text-[#14213D] flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#059669]" />
              <span>ใบสั่งซื้อล่าสุด (Recent POs)</span>
            </h3>
            <Link
              href="/procurement/orders"
              className="text-xs text-[#059669] hover:underline font-bold"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="space-y-3">
            {pos.slice(0, 4).map((po) => (
              <div
                key={po.id}
                className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] flex items-center justify-between gap-3 hover:border-[#CBD5E1] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#059669]">{po.poNumber}</span>
                    {po.prNumber && (
                      <span className="text-[10px] bg-blue-50 text-[#2563EB] border border-blue-100 px-1.5 rounded-full font-mono font-semibold">
                        PR: {po.prNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-[#14213D] mt-1">{po.supplier?.name}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-0.5">
                    สั่งเมื่อ {new Date(po.orderDate).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#14213D] tabular-nums">
                    {po.totalAmount.toLocaleString()} บ.
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={po.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
