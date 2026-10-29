'use client';

import React, { useState } from 'react';
import { useBudget } from '@erp/app-context';
import {
  Layers,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Building2,
  FolderKanban,
  CalendarRange,
  History,
  X,
} from 'lucide-react';

export default function BudgetAllocationPage() {
  const { plans, allocations, addAllocation, audits } = useBudget();
  const [viewMode, setViewMode] = useState<'BY_DEPT' | 'BY_CATEGORY' | 'BY_PROJECT' | 'HISTORY'>(
    'BY_DEPT'
  );
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [selectedBudgetCode, setSelectedBudgetCode] = useState(plans[0]?.budgetCode || 'BG-69-PHARM-01');
  const [q1, setQ1] = useState('4500000');
  const [q2, setQ2] = useState('4500000');
  const [q3, setQ3] = useState('4000000');
  const [q4, setQ4] = useState('4000000');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedPlan = plans.find((p) => p.budgetCode === selectedBudgetCode) || plans[0];
  const sumQuarters =
    (Number(q1) || 0) + (Number(q2) || 0) + (Number(q3) || 0) + (Number(q4) || 0);

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedPlan) return;

    const result = addAllocation({
      allocNo: `ALC-2569-00${allocations.length + 1}`,
      budgetYear: selectedPlan.budgetYear,
      budgetCode: selectedPlan.budgetCode,
      departmentName: selectedPlan.departmentName,
      budgetCategory: selectedPlan.budgetCategory,
      projectName: selectedPlan.projectName,
      approvedBudget: selectedPlan.approvedAmount,
      allocatedAmount: sumQuarters,
      q1Amount: Number(q1) || 0,
      q2Amount: Number(q2) || 0,
      q3Amount: Number(q3) || 0,
      q4Amount: Number(q4) || 0,
      status: 'APPROVED',
      approvedBy: 'นพ.เกรียงไกร พิทักษ์เวช (ผอ.รพ.)',
      allocatedDate: new Date().toISOString().slice(0, 10),
    });

    if (!result.ok) {
      setErrorMsg(result.error || 'ยอดจัดสรรเกินวงเงินอนุมัติ');
      return;
    }

    setSuccessMsg(
      `จัดสรรงบประมาณรหัส ${selectedPlan.budgetCode} วงเงิน ฿${sumQuarters.toLocaleString()} สำเร็จ!`
    );
    setShowAllocModal(false);
  };

  const totalApproved = plans.reduce((s, p) => s + p.approvedAmount, 0);
  const totalAllocated = plans.reduce((s, p) => s + p.allocatedAmount, 0);
  const unallocatedReserve = totalApproved - totalAllocated;

  const allocAudits = audits.filter((a) => a.module === 'BUDGET_ALLOCATION');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <Layers className="w-3.5 h-3.5" />
            MOD-003 • BUDGET ALLOCATION
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            03. จัดสรรงบประมาณ (Budget Allocation)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            กระจายวงเงินที่ได้รับอนุมัติให้แต่ละหน่วยงาน หมวดงบประมาณ โครงการ และแบ่งงวดรายไตรมาส (Q1–Q4)
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setShowAllocModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          จัดสรรงบประมาณรายไตรมาส
        </button>
      </div>

      {/* Golden Rule Callout Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-900">
            กฎสำคัญของการจัดสรรงบประมาณ (MOD-003 Strict Rule):
          </span>{' '}
          <span className="text-amber-800">
            ยอดจัดสรรรวมต้องไม่เกินวงเงินที่ได้รับอนุมัติ (Approved Budget) ยกเว้นมีการปรับเพิ่มกรอบงบประมาณอย่างเป็นทางการที่เมนู 04. โอนและปรับปรุงงบประมาณ
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:underline">
            ปิด
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">วงเงินที่ได้รับอนุมัติรวม (Approved)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            ฿{totalApproved.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-emerald-600">
              ({(totalApproved / 1000000).toFixed(2)} ลบ.)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">เพดานสูงสุดที่สามารถจัดสรรได้ในปี 2569</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm">
          <span className="text-xs font-bold text-teal-700">จัดสรรให้หน่วยงานแล้ว (Allocated)</span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">
            ฿{totalAllocated.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-teal-600">
              ({(totalAllocated / 1000000).toFixed(2)} ลบ.)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            คิดเป็น {Math.round((totalAllocated / totalApproved) * 100)}% ของวงเงินอนุมัติ
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-500">
            งบกลางสำรองรอจัดสรร (Unallocated Reserve)
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            ฿{unallocatedReserve.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-amber-600">
              ({(unallocatedReserve / 1000000).toFixed(2)} ลบ.)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">วงเงินคงเหลือที่ยังไม่ได้กระจายลงไตรมาส</p>
        </div>
      </div>

      {/* Sub-navigation matching Sitemap 03 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('BY_DEPT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'BY_DEPT'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              จัดสรรตามหน่วยงาน & ไตรมาส (Q1-Q4)
            </button>
            <button
              onClick={() => setViewMode('BY_CATEGORY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'BY_CATEGORY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              จัดสรรตามหมวดงบประมาณ
            </button>
            <button
              onClick={() => setViewMode('BY_PROJECT')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'BY_PROJECT'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              จัดสรรตามโครงการ
            </button>
            <button
              onClick={() => setViewMode('HISTORY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'HISTORY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              ประวัติการจัดสรร ({allocAudits.length})
            </button>
          </div>
        </div>

        {viewMode === 'BY_DEPT' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4">เลขที่ใบจัดสรร / รหัสงบ</th>
                  <th className="py-3.5 px-4">หน่วยงาน (Department)</th>
                  <th className="py-3.5 px-4 text-right">งบที่อนุมัติ</th>
                  <th className="py-3.5 px-4 text-right text-teal-700">ยอดจัดสรรรวม</th>
                  <th className="py-3.5 px-4 text-right">Q1 (ต.ค.-ธ.ค.)</th>
                  <th className="py-3.5 px-4 text-right">Q2 (ม.ค.-มี.ค.)</th>
                  <th className="py-3.5 px-4 text-right">Q3 (เม.ย.-มิ.ย.)</th>
                  <th className="py-3.5 px-4 text-right">Q4 (ก.ค.-ก.ย.)</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{a.allocNo}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">{a.budgetCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{a.departmentName}</div>
                      <div className="text-[11px] text-slate-400">{a.allocatedDate} • {a.approvedBy}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ฿{a.approvedBudget.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-teal-700">
                      ฿{a.allocatedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      ฿{a.q1Amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      ฿{a.q2Amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      ฿{a.q3Amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      ฿{a.q4Amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'BY_CATEGORY' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set(plans.map((p) => p.budgetCategory))).map((cat) => {
              const catPlans = plans.filter((p) => p.budgetCategory === cat);
              const catApproved = catPlans.reduce((s, p) => s + p.approvedAmount, 0);
              const catAllocated = catPlans.reduce((s, p) => s + p.allocatedAmount, 0);
              return (
                <div key={cat} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                  <div className="text-xs font-bold text-slate-900">{cat}</div>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-500">อนุมัติ: ฿{catApproved.toLocaleString()}</span>
                    <span className="font-extrabold text-teal-700">
                      จัดสรรแล้ว: ฿{catAllocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-full"
                      style={{ width: `${Math.round((catAllocated / catApproved) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'BY_PROJECT' && (
          <div className="p-6 space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-emerald-700 mr-2">{p.budgetCode}</span>
                  <span className="font-bold text-slate-900">{p.projectName}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{p.departmentName}</p>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">อนุมัติ: ฿{p.approvedAmount.toLocaleString()}</div>
                  <div className="font-extrabold text-teal-700">
                    จัดสรรแล้ว: ฿{p.allocatedAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'HISTORY' && (
          <div className="p-6 space-y-3">
            {allocAudits.map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-emerald-700 mr-2">[{a.action}]</span>
                  <span className="font-semibold text-slate-900">{a.docNo}</span> —{' '}
                  <span className="text-slate-600">{a.detail}</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  {a.timestamp} • {a.actor}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: จัดสรรงบประมาณรายไตรมาส (พร้อมตรวจสอบห้ามเกินวงเงินอนุมัติ) */}
      {showAllocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600">
                  MOD-003 • QUARTERLY ALLOCATION
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  จัดสรรงบประมาณให้หน่วยงาน / โครงการ
                </h3>
              </div>
              <button
                onClick={() => setShowAllocModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  เลือกรหัสงบประมาณ / หน่วยงานที่ต้องการจัดสรร
                </label>
                <select
                  value={selectedBudgetCode}
                  onChange={(e) => {
                    setSelectedBudgetCode(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.budgetCode}>
                      {p.budgetCode} — {p.departmentName} (อนุมัติ: ฿{p.approvedAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlan && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500">เพดานวงเงินที่ได้รับอนุมัติ (Approved Cap)</div>
                    <div className="text-base font-extrabold text-slate-900">
                      ฿{selectedPlan.approvedAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">ยอดรวมจัดสรร Q1–Q4 ที่กรอก</div>
                    <div
                      className={`text-base font-extrabold ${
                        sumQuarters > selectedPlan.approvedAmount
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      ฿{sumQuarters.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    งวดไตรมาส 1 (ต.ค. - ธ.ค.)
                  </label>
                  <input
                    type="number"
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    งวดไตรมาส 2 (ม.ค. - มี.ค.)
                  </label>
                  <input
                    type="number"
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    งวดไตรมาส 3 (เม.ย. - มิ.ย.)
                  </label>
                  <input
                    type="number"
                    value={q3}
                    onChange={(e) => setQ3(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    งวดไตรมาส 4 (ก.ค. - ก.ย.)
                  </label>
                  <input
                    type="number"
                    value={q4}
                    onChange={(e) => setQ4(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  ยืนยันการจัดสรรงบประมาณ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
