'use client';

import React, { useState } from 'react';
import { useBudget, BudgetAdjustmentRecord } from '@erp/app-context';
import {
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  History,
  X,
} from 'lucide-react';

export default function BudgetAdjustmentPage() {
  const { plans, adjustments, addAdjustment, approveAdjustment, audits } = useBudget();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'HISTORY'>('ALL');
  const [showModal, setShowModal] = useState(false);

  const [adjustmentType, setAdjustmentType] = useState<BudgetAdjustmentRecord['adjustmentType']>(
    'โอนงบระหว่างหน่วยงาน'
  );
  const [fromCode, setFromCode] = useState(plans[3]?.budgetCode || 'BG-69-FAC-01');
  const [toCode, setToCode] = useState(plans[0]?.budgetCode || 'BG-69-PHARM-01');
  const [transferAmount, setTransferAmount] = useState('500000');
  const [reason, setReason] = useState('');

  const fromPlan = plans.find((p) => p.budgetCode === fromCode) || plans[0];
  const toPlan = plans.find((p) => p.budgetCode === toCode) || plans[1];
  const amt = Number(transferAmount) || 0;

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPlan || !toPlan) return;

    addAdjustment({
      adjNo: `BADJ-69-0${adjustments.length + 12}`,
      date: new Date().toISOString().slice(0, 10),
      adjustmentType,
      fromBudgetCode: fromPlan.budgetCode,
      fromDepartment: fromPlan.departmentName,
      fromBeforeAmount: fromPlan.approvedAmount,
      toBudgetCode: toPlan.budgetCode,
      toDepartment: toPlan.departmentName,
      toBeforeAmount: toPlan.approvedAmount,
      transferAmount: amt,
      reason:
        reason ||
        'โอนเกลี่ยวงเงินงบประมาณระหว่างปีเพื่อรองรับความต้องการเร่งด่วนของหน่วยงานบริการผู้ป่วย',
      requestedBy: 'วิชัย เกียรติบูรพา (Budget Controller)',
      status: 'PENDING_APPROVAL',
    });

    setShowModal(false);
    setReason('');
  };

  const displayedAdjustments =
    activeTab === 'PENDING'
      ? adjustments.filter((a) => a.status === 'PENDING_APPROVAL')
      : adjustments;

  const adjAudits = audits.filter((a) => a.module === 'BUDGET_ADJUSTMENT');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            MOD-004 • BUDGET ADJUSTMENT
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            04. โอนและปรับปรุงงบประมาณ (Budget Adjustment)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            โอนงบระหว่างหน่วยงาน โอนระหว่างหมวดงบประมาณ ขอเพิ่ม/ลดกรอบงบประมาณ แสดงยอดก่อน-หลังโอนชัดเจน
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          สร้างคำขอโอน / ปรับปรุงงบประมาณ
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">คำขอโอน/ปรับปรุงทั้งหมด</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {adjustments.length} รายการ
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm">
          <span className="text-xs text-amber-700 font-bold">รออนุมัติ (Pending Approval)</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">
            {adjustments.filter((a) => a.status === 'PENDING_APPROVAL').length} รายการ
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-bold">อนุมัติแล้ว (Approved)</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {adjustments.filter((a) => a.status === 'APPROVED').length} รายการ
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">มูลค่าการโอน/ปรับปรุงรวม</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            ฿{adjustments.reduce((s, a) => s + a.transferAmount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              คำขอโอนและปรับปรุงทั้งหมด ({adjustments.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'PENDING'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              รายการรออนุมัติ ({adjustments.filter((a) => a.status === 'PENDING_APPROVAL').length})
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              ประวัติการเปลี่ยนแปลง ({adjAudits.length})
            </button>
          </div>
        </div>

        {activeTab !== 'HISTORY' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4">เลขที่คำขอ / ประเภท</th>
                  <th className="py-3.5 px-4">ต้นทางโอนออก (ก่อน → หลังโอน)</th>
                  <th className="py-3.5 px-4">ปลายทางรับโอน (ก่อน → หลังโอน)</th>
                  <th className="py-3.5 px-4 text-right">วงเงินที่โอน/ปรับ</th>
                  <th className="py-3.5 px-4">เหตุผลความจำเป็น</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-right">การอนุมัติ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedAdjustments.map((adj) => {
                  const fromAfter = Math.max(0, adj.fromBeforeAmount - adj.transferAmount);
                  const toAfter = adj.toBeforeAmount + adj.transferAmount;
                  return (
                    <tr key={adj.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{adj.adjNo}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          {adj.adjustmentType}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{adj.date}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{adj.fromBudgetCode}</div>
                        <div className="text-[11px] text-slate-500">{adj.fromDepartment}</div>
                        {adj.fromBeforeAmount > 0 && (
                          <div className="text-[11px] mt-1 font-medium text-rose-600">
                            ฿{adj.fromBeforeAmount.toLocaleString()} → ฿{fromAfter.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{adj.toBudgetCode}</div>
                        <div className="text-[11px] text-slate-500">{adj.toDepartment}</div>
                        <div className="text-[11px] mt-1 font-medium text-emerald-600">
                          ฿{adj.toBeforeAmount.toLocaleString()} → ฿{toAfter.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ฿{adj.transferAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-700">{adj.reason}</p>
                        <span className="text-[10px] text-slate-400">ผู้ขอ: {adj.requestedBy}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            adj.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : adj.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {adj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {adj.status === 'PENDING_APPROVAL' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => approveAdjustment(adj.id, true)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              อนุมัติโอน
                            </button>
                            <button
                              onClick={() => approveAdjustment(adj.id, false)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px]"
                            >
                              ไม่อนุมัติ
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">ดำเนินการแล้ว</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {adjAudits.map((a) => (
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

      {/* Modal: สร้างคำขอโอน / ปรับปรุงงบประมาณ พร้อมแสดงยอดก่อนโอนและหลังโอน */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600">
                  MOD-004 • BUDGET TRANSFER & CAP ADJUSTMENT
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  สร้างคำขอโอน / ปรับปรุงงบประมาณ
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ประเภทการปรับปรุงงบประมาณ
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(e) =>
                      setAdjustmentType(
                        e.target.value as BudgetAdjustmentRecord['adjustmentType']
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="โอนงบระหว่างหน่วยงาน">โอนงบระหว่างหน่วยงาน</option>
                    <option value="โอนงบระหว่างหมวด">โอนงบระหว่างหมวด</option>
                    <option value="ขอเพิ่มกรอบงบประมาณ">ขอเพิ่มกรอบงบประมาณ</option>
                    <option value="ขอลดกรอบงบประมาณ">ขอลดกรอบงบประมาณ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    จำนวนเงินที่ต้องการโอน / ปรับปรุง (บาท)
                  </label>
                  <input
                    type="number"
                    required
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200">
                  <label className="font-bold text-rose-800 block mb-1">
                    รหัสงบต้นทาง (ผู้โอนออก)
                  </label>
                  <select
                    value={fromCode}
                    onChange={(e) => setFromCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white mb-2"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.budgetCode}>
                        {p.budgetCode} ({p.departmentName})
                      </option>
                    ))}
                  </select>
                  {fromPlan && (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">ยอดก่อนโอน:</span>
                        <span className="font-bold text-slate-800">
                          ฿{fromPlan.approvedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-rose-700 font-semibold">ยอดหลังโอนออก:</span>
                        <span className="font-extrabold text-rose-700">
                          ฿{Math.max(0, fromPlan.approvedAmount - amt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <label className="font-bold text-emerald-800 block mb-1">
                    รหัสงบปลายทาง (ผู้รับโอน)
                  </label>
                  <select
                    value={toCode}
                    onChange={(e) => setToCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white mb-2"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.budgetCode}>
                        {p.budgetCode} ({p.departmentName})
                      </option>
                    ))}
                  </select>
                  {toPlan && (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">ยอดก่อนรับโอน:</span>
                        <span className="font-bold text-slate-800">
                          ฿{toPlan.approvedAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700 font-semibold">ยอดหลังรับโอน:</span>
                        <span className="font-extrabold text-emerald-700">
                          ฿{(toPlan.approvedAmount + amt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  บันทึกเหตุผลและความจำเป็นในการโอน
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="ระบุเหตุผลการโอนงบประมาณเพื่อเสนอผู้บริหารพิจารณา..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                >
                  ส่งคำขออนุมัติโอนงบประมาณ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

