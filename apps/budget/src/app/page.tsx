'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useBudget } from '@erp/app-context';
import {
  PieChart,
  Wallet,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ArrowRightLeft,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Building2,
  ArrowUpRight,
  Layers,
  Receipt,
  Lock,
} from 'lucide-react';

export default function BudgetDashboardPage() {
  const { plans, adjustments, approveAdjustment } = useBudget();

  // Compute totals from live BudgetContext
  const totalApproved = plans.reduce((acc, p) => acc + p.approvedAmount, 0);
  const totalAllocated = plans.reduce((acc, p) => acc + p.allocatedAmount, 0);
  const totalReserved = plans.reduce((acc, p) => acc + p.reservedAmount, 0);
  const totalCommitment = plans.reduce((acc, p) => acc + p.commitmentAmount, 0);
  const totalActual = plans.reduce((acc, p) => acc + p.actualAmount, 0);

  // Formula: งบประมาณคงเหลือ = งบที่อนุมัติ - กันงบประมาณ - ภาระผูกพัน - ค่าใช้จ่ายจริง
  const totalAvailable = totalApproved - totalReserved - totalCommitment - totalActual;

  const actualPct = totalApproved > 0 ? Math.round((totalActual / totalApproved) * 100) : 0;
  const commitmentPct = totalApproved > 0 ? Math.round((totalCommitment / totalApproved) * 100) : 0;
  const reservedPct = totalApproved > 0 ? Math.round((totalReserved / totalApproved) * 100) : 0;
  const availablePct = Math.max(0, 100 - actualPct - commitmentPct - reservedPct);

  const pendingPlansCount = plans.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const pendingAdjustments = adjustments.filter((a) => a.status === 'PENDING_APPROVAL');
  const totalPendingCount = pendingPlansCount + pendingAdjustments.length;

  const formatMillion = (val: number) => `${(val / 1000000).toFixed(2)} ลบ.`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
              <PieChart className="w-3.5 h-3.5" />
              MOD-001 • BUDGET MANAGEMENT SYSTEM (ปีงบประมาณ 2569)
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              01. Dashboard งบประมาณ (ภาพรวมงบประมาณ ปี 2569)
            </h1>
            <p className="text-emerald-100/85 text-sm mt-1 max-w-3xl">
              วางแผน จัดทำ จัดสรร ควบคุมวงเงิน และติดตามภาระผูกพัน (Commitment) แยกสถานะไม่ให้ซ้ำกับค่าใช้จ่ายจริง (Actual Expense) จากระบบ Finance แบบเรียลไทม์
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/budget/planning"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              สร้างแผนคำของบ (Planning)
            </Link>
            <Link
              href="/budget/control"
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-bold transition flex items-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              ตรวจสอบและควบคุมวงเงิน
            </Link>
          </div>
        </div>
      </div>

      {/* Primary 4 Hero KPI Cards (Matching User Example: 50.00 ลบ., 45.00 ลบ., 12.00 ลบ., 18.00 ลบ.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              งบประมาณทั้งหมด (Approved)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatMillion(totalApproved)}
            </span>
            <span className="text-xs font-semibold text-emerald-600">100%</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ฿{totalApproved.toLocaleString()} • วงเงินที่ได้รับอนุมัติปี 2569
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              จัดสรรแล้ว (Allocated)
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-teal-700">
              {formatMillion(totalAllocated)}
            </span>
            <span className="text-xs font-semibold text-teal-600">
              {Math.round((totalAllocated / totalApproved) * 100)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ฿{totalAllocated.toLocaleString()} • กระจายให้หน่วยงานแล้ว
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              ภาระผูกพัน (Commitment)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">
              {formatMillion(totalCommitment)}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {commitmentPct}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ฿{totalCommitment.toLocaleString()} • ยอดจาก PO ที่อนุมัติแล้ว (ไม่ซ้ำกับจ่ายจริง)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              ใช้จ่ายจริง (Actual Expense)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-700">
              {formatMillion(totalActual)}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {actualPct}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ฿{totalActual.toLocaleString()} • ยอดที่ Finance บันทึกเบิกจ่ายจริงแล้ว
          </p>
        </div>
      </div>

      {/* Secondary 3 Widgets from MOD-001 Table: กันงบประมาณ, งบคงเหลือ, รายการรออนุมัติ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              กันงบประมาณ (Reserved Budget - PR)
            </span>
            <div className="text-xl font-bold text-purple-700 mt-1">
              {formatMillion(totalReserved)}{' '}
              <span className="text-xs font-medium text-slate-400">
                (฿{totalReserved.toLocaleString()})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              วงเงินที่กันไว้รอดำเนินการออกใบสั่งซื้อ (PR รออนุมัติ)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold">
            {reservedPct}%
          </span>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800">
              งบคงเหลือใช้ได้จริง (Available Budget)
            </span>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">
              {formatMillion(totalAvailable)}{' '}
              <span className="text-xs font-medium text-emerald-600">
                (฿{totalAvailable.toLocaleString()})
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">
              สูตร: อนุมัติ ({formatMillion(totalApproved)}) - กันงบ ({formatMillion(totalReserved)}) - ผูกพัน ({formatMillion(totalCommitment)}) - จ่ายจริง ({formatMillion(totalActual)})
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
            {availablePct}%
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              รายการรออนุมัติ (Pending Approvals)
            </span>
            <div className="text-xl font-bold text-rose-600 mt-1">
              {totalPendingCount} รายการ
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              คำของบประมาณ ({pendingPlansCount}) • คำขอโอนงบ ({pendingAdjustments.length})
            </p>
          </div>
          <Link
            href="/budget/adjustment"
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1"
          >
            พิจารณา <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Proportion & Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* สัดส่วนการใช้งบประมาณ (36% ใช้จ่ายจริง, 24% ภาระผูกพัน) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  สัดส่วนการใช้งบประมาณ ปี 2569 (Deduplicated Status)
                </h2>
                <p className="text-xs text-slate-500">
                  ยอดภาระผูกพัน (PO) และค่าใช้จ่ายจริง (Finance AP) แยกสถานะไม่ให้นับซ้ำกัน
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                กรอบวงเงิน 50.00 ลบ.
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden flex my-4 shadow-inner">
              <div
                style={{ width: `${actualPct}%` }}
                className="bg-blue-600 h-full transition-all duration-500"
                title={`ใช้จ่ายจริง ${actualPct}%`}
              />
              <div
                style={{ width: `${commitmentPct}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`ภาระผูกพัน ${commitmentPct}%`}
              />
              <div
                style={{ width: `${reservedPct}%` }}
                className="bg-purple-500 h-full transition-all duration-500"
                title={`กันงบประมาณ ${reservedPct}%`}
              />
              <div
                style={{ width: `${availablePct}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`งบคงเหลือ ${availablePct}%`}
              />
            </div>

            {/* Detailed Bars matching User Prompt */}
            <div className="space-y-4 mt-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-2 text-blue-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    ใช้จ่ายจริง (Actual Expense จากระบบ Finance)
                  </span>
                  <span className="text-slate-900">
                    {formatMillion(totalActual)} ({actualPct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${actualPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-2 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    ภาระผูกพัน (Commitment จากใบสั่งซื้อ PO ที่อนุมัติแล้ว)
                  </span>
                  <span className="text-slate-900">
                    {formatMillion(totalCommitment)} ({commitmentPct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${commitmentPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-2 text-purple-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    กันงบประมาณ (Reserved จากใบขอซื้อ PR รอดำเนินการ)
                  </span>
                  <span className="text-slate-900">
                    {formatMillion(totalReserved)} ({reservedPct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${reservedPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-2 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    งบประมาณคงเหลือใช้ได้สุทธิ (Available Budget)
                  </span>
                  <span className="text-emerald-700">
                    {formatMillion(totalAvailable)} ({availablePct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${availablePct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>เชื่อมโยงข้อมูลอัตโนมัติระหว่างคลังพัสดุ (PR/PO) และการเงิน (AP/GL)</span>
            <Link href="/budget/control" className="text-emerald-600 font-bold hover:underline">
              ดูตารางควบคุมวงเงินรายแผนก →
            </Link>
          </div>
        </div>

        {/* 6-Step Budget Management Workflow */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Workflow การบริหารงบประมาณ 6 ขั้นตอน
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            มาตรฐานการควบคุมวงเงินโรงพยาบาลตั้งแต่ตั้งคำขอจนถึงตัดจ่ายจริง
          </p>
          <div className="space-y-2.5">
            {[
              {
                step: '1',
                title: 'หน่วยงานเสนอคำของบประมาณ',
                desc: 'บันทึกคำของบประจำปี แยกตามหมวด แหล่งเงิน และโครงการ',
                href: '/budget/planning',
                badge: 'Planning',
              },
              {
                step: '2',
                title: 'ผู้บริหารพิจารณาและอนุมัติงบประมาณ',
                desc: 'กลั่นกรองกรอบวงเงินรวม (50.00 ลบ.) และอนุมัติแผนประจำปี',
                href: '/budget/planning',
                badge: 'Approval',
              },
              {
                step: '3',
                title: 'จัดสรรงบให้แต่ละหน่วยงาน',
                desc: 'กระจายงบรายไตรมาส Q1-Q4 (ห้ามเกินวงเงินที่ได้รับอนุมัติ)',
                href: '/budget/allocation',
                badge: '45.00 ลบ.',
              },
              {
                step: '4',
                title: 'เมื่อมีใบขอซื้อ (PR) ระบบจะกันงบประมาณ',
                desc: 'ล็อกวงเงิน Reserved Budget (3.00 ลบ.) เพื่อป้องกันงบซ้ำซ้อน',
                href: '/budget/control',
                badge: 'Reserved',
              },
              {
                step: '5',
                title: 'เมื่ออนุมัติใบสั่งซื้อ (PO) ระบบบันทึกภาระผูกพัน',
                desc: 'เปลี่ยนจากกันงบเป็น Commitment (12.00 ลบ.) รอส่งมอบพัสดุ',
                href: '/budget/control',
                badge: '24%',
              },
              {
                step: '6',
                title: 'เมื่อการเงินจ่ายเงินจริง ระบบตัดเป็นค่าใช้จ่ายจริง',
                desc: 'ตัดยอดออกจาก Commitment และบันทึกเป็น Actual (18.00 ลบ.)',
                href: '/budget/control',
                badge: '36%',
              },
            ].map((item) => (
              <Link
                key={item.step}
                href={item.href}
                className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      {item.title}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Department Budget Summary & Pending Approvals */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              สถานะวงเงินงบประมาณรายหน่วยงาน (ปีงบประมาณ 2569)
            </h2>
            <p className="text-xs text-slate-500">
              แสดงวงเงินอนุมัติ จัดสรรแล้ว กันงบ (PR) ภาระผูกพัน (PO) ใช้จ่ายจริง (Actual) และงบคงเหลือสุทธิ
            </p>
          </div>
          <Link
            href="/budget/reports"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            ดูรายงานฉบับเต็ม (Excel / PDF) <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-4">รหัสงบประมาณ / หน่วยงาน</th>
                <th className="py-3.5 px-4">หมวดงบประมาณ</th>
                <th className="py-3.5 px-4 text-right">งบที่อนุมัติ</th>
                <th className="py-3.5 px-4 text-right">จัดสรรแล้ว</th>
                <th className="py-3.5 px-4 text-right text-purple-700">กันงบ (PR)</th>
                <th className="py-3.5 px-4 text-right text-amber-700">ผูกพัน (PO)</th>
                <th className="py-3.5 px-4 text-right text-blue-700">จ่ายจริง (Actual)</th>
                <th className="py-3.5 px-4 text-right text-emerald-700">งบคงเหลือใช้ได้</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {plans.map((p) => {
                const avail = p.approvedAmount - p.reservedAmount - p.commitmentAmount - p.actualAmount;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.budgetCode}</div>
                      <div className="text-slate-500 text-[11px]">{p.departmentName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{p.budgetCategory}</span>
                      <div className="text-[11px] text-slate-400">{p.fundSource}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ฿{p.approvedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-teal-700">
                      ฿{p.allocatedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-purple-700">
                      ฿{p.reservedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-amber-600">
                      ฿{p.commitmentAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-blue-600">
                      ฿{p.actualAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold">
                        ฿{avail.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
