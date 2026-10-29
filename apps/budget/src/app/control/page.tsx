'use client';

import React, { useState } from 'react';
import { useBudget } from '@erp/app-context';
import {
  ShieldCheck,
  Calculator,
  Lock,
  Receipt,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Search,
} from 'lucide-react';

export default function BudgetControlPage() {
  const { plans, transactions, convertCommitmentToActual } = useBudget();
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'RESERVATION' | 'COMMITMENT' | 'ACTUAL' | 'OVER_BUDGET' | 'TX_HISTORY'
  >('OVERVIEW');
  const [checkAmount, setCheckAmount] = useState('1500000');
  const [checkCode, setCheckCode] = useState(plans[0]?.budgetCode || 'BG-69-PHARM-01');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const totalApproved = plans.reduce((s, p) => s + p.approvedAmount, 0);
  const totalAllocated = plans.reduce((s, p) => s + p.allocatedAmount, 0);
  const totalReserved = plans.reduce((s, p) => s + p.reservedAmount, 0);
  const totalCommitment = plans.reduce((s, p) => s + p.commitmentAmount, 0);
  const totalActual = plans.reduce((s, p) => s + p.actualAmount, 0);
  const totalAvailable = totalApproved - totalReserved - totalCommitment - totalActual;

  const targetPlan = plans.find((p) => p.budgetCode === checkCode) || plans[0];
  const targetAvailable = targetPlan
    ? targetPlan.approvedAmount -
      targetPlan.reservedAmount -
      targetPlan.commitmentAmount -
      targetPlan.actualAmount
    : 0;
  const isSufficient = (Number(checkAmount) || 0) <= targetAvailable;

  const handleConvertPOToActual = (budgetCode: string, amount: number, poRef: string) => {
    convertCommitmentToActual(budgetCode, amount, poRef);
    setToastMsg(
      `แปลงภาระผูกพัน (${poRef}) จำนวน ฿${amount.toLocaleString()} เป็นค่าใช้จ่ายจริง (Actual) สำเร็จ — ระบบตัดยอดออกจาก Commitment ทันทีเพื่อไม่ให้นับซ้ำ!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            MOD-005 • REAL-TIME BUDGET CONTROL
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            05. ควบคุมงบประมาณ (Budget Control & Deduplication Engine)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            แยกสถานะงบอนุมัติ จัดสรร กันงบ (PR) ภาระผูกพัน (PO) และค่าใช้จ่ายจริง (Finance AP) ชัดเจน พร้อมตัดยอด Commitment อัตโนมัติเมื่อจ่ายจริง
          </p>
        </div>

        {/* Formula Badge */}
        <div className="p-3.5 rounded-xl bg-emerald-950 text-white text-xs border border-emerald-800 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> สูตรการคำนวณงบคงเหลือมาตรฐาน (MOD-005)
          </div>
          <div className="font-mono font-bold text-emerald-100 mt-1">
            งบคงเหลือ = งบที่อนุมัติ - กันงบประมาณ - ภาระผูกพัน - ค่าใช้จ่ายจริง
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg(null)} className="text-blue-700 hover:underline ml-4">
            รับทราบ
          </button>
        </div>
      )}

      {/* 6 Distinct Budget States (MOD-005 Specification) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">1. Approved Budget</span>
          <span className="text-[10px] text-slate-400">งบที่อนุมัติ</span>
          <div className="text-lg font-extrabold text-slate-900 mt-1">
            ฿{(totalApproved / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs">
          <span className="text-[11px] font-bold text-teal-700 block">2. Allocated Budget</span>
          <span className="text-[10px] text-slate-400">งบที่จัดสรร</span>
          <div className="text-lg font-extrabold text-teal-700 mt-1">
            ฿{(totalAllocated / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 block">3. Reserved Budget</span>
          <span className="text-[10px] text-slate-400">รายการกันงบ (PR)</span>
          <div className="text-lg font-extrabold text-purple-700 mt-1">
            ฿{(totalReserved / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 block">4. Commitment</span>
          <span className="text-[10px] text-slate-400">ภาระผูกพัน (PO)</span>
          <div className="text-lg font-extrabold text-amber-600 mt-1">
            ฿{(totalCommitment / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 block">5. Actual Expense</span>
          <span className="text-[10px] text-slate-400">ค่าใช้จ่ายจริง (AP)</span>
          <div className="text-lg font-extrabold text-blue-700 mt-1">
            ฿{(totalActual / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 block">6. Available Budget</span>
          <span className="text-[10px] text-emerald-700">งบคงเหลือใช้ได้</span>
          <div className="text-lg font-extrabold text-emerald-700 mt-1">
            ฿{(totalAvailable / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* Interactive Real-time Budget Sufficiency Checker (ตรวจสอบวงเงินก่อนออก PR/PO) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              เครื่องมือจำลองตรวจสอบวงเงินคงเหลือก่อนตั้งเบิก / ออกใบขอซื้อ (Budget Check Simulator)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ตรวจสอบทันทีว่าวงเงินคงเหลือสุทธิเพียงพอหรือไม่ก่อนอนุมัติเอกสารจัดซื้อ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <select
              value={checkCode}
              onChange={(e) => setCheckCode(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 font-semibold"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.budgetCode}>
                  {p.budgetCode} ({p.departmentName})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={checkAmount}
              onChange={(e) => setCheckAmount(e.target.value)}
              placeholder="ระบุยอดเงินที่ต้องการใช้..."
              className="w-40 px-3 py-2 rounded-xl border border-slate-200 font-bold"
            />
            <span
              className={`px-3.5 py-2 rounded-xl font-bold ${
                isSufficient
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {isSufficient
                ? `✓ วงเงินเพียงพอ (คงเหลือ ฿${targetAvailable.toLocaleString()})`
                : `✗ เกินวงเงินคงเหลือ! (ขาดอีก ฿${(
                    Number(checkAmount) - targetAvailable
                  ).toLocaleString()})`}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs matching Sitemap 05 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
          {[
            { id: 'OVERVIEW', label: 'ภาพรวมงบประมาณคงเหลือ' },
            { id: 'RESERVATION', label: 'รายการกันงบประมาณ (Reservation)' },
            { id: 'COMMITMENT', label: 'ภาระผูกพัน (Commitment) → ตัดจ่ายจริง' },
            { id: 'ACTUAL', label: 'ค่าใช้จ่ายจริง (Actual)' },
            { id: 'OVER_BUDGET', label: 'รายการเฝ้าระวัง / เกินงบประมาณ' },
            { id: 'TX_HISTORY', label: 'ประวัติการใช้วงเงินทั้งหมด' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'OVERVIEW' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4">รหัสงบประมาณ / หน่วยงาน</th>
                  <th className="py-3.5 px-4 text-right">Approved (อนุมัติ)</th>
                  <th className="py-3.5 px-4 text-right text-teal-700">Allocated (จัดสรร)</th>
                  <th className="py-3.5 px-4 text-right text-purple-700">- Reserved (กันงบ)</th>
                  <th className="py-3.5 px-4 text-right text-amber-700">- Commitment (ผูกพัน)</th>
                  <th className="py-3.5 px-4 text-right text-blue-700">- Actual (จ่ายจริง)</th>
                  <th className="py-3.5 px-4 text-right text-emerald-700">= Available (คงเหลือ)</th>
                  <th className="py-3.5 px-4 text-right">จำลองตัด Commitment → Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {plans.map((p) => {
                  const avail =
                    p.approvedAmount - p.reservedAmount - p.commitmentAmount - p.actualAmount;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.budgetCode}</div>
                        <div className="text-[11px] text-slate-500">{p.departmentName}</div>
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
                      <td className="py-3.5 px-4 text-right">
                        {p.commitmentAmount >= 500000 ? (
                          <button
                            onClick={() =>
                              handleConvertPOToActual(
                                p.budgetCode,
                                500000,
                                `PV-69-${p.departmentCode}-99`
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition"
                          >
                            ตัดจ่ายจริง ฿500,000
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">ไม่มีภาระผูกพันคงค้าง</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(activeTab === 'RESERVATION' ||
          activeTab === 'COMMITMENT' ||
          activeTab === 'ACTUAL' ||
          activeTab === 'TX_HISTORY') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4">เลขที่รายการ / วันที่</th>
                  <th className="py-3.5 px-4">เอกสารอ้างอิง (PR/PO/PV)</th>
                  <th className="py-3.5 px-4">รหัสงบ / หน่วยงาน</th>
                  <th className="py-3.5 px-4">รายละเอียดธุรกรรม</th>
                  <th className="py-3.5 px-4 text-center">ประเภทวงเงิน</th>
                  <th className="py-3.5 px-4 text-right">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions
                  .filter((tx) => {
                    if (activeTab === 'RESERVATION') return tx.txType === 'RESERVATION';
                    if (activeTab === 'COMMITMENT') return tx.txType === 'COMMITMENT';
                    if (activeTab === 'ACTUAL') return tx.txType === 'ACTUAL';
                    return true;
                  })
                  .map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tx.txNo}</div>
                        <div className="text-[10px] text-slate-400">{tx.date}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{tx.refDocNo}</span>
                        <div className="text-[10px] text-slate-500">{tx.sourceSystem}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-emerald-700">{tx.budgetCode}</div>
                        <div className="text-[11px] text-slate-500">{tx.departmentName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-md">{tx.description}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.txType === 'RESERVATION'
                              ? 'bg-purple-100 text-purple-800'
                              : tx.txType === 'COMMITMENT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tx.txType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ฿{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'OVER_BUDGET' && (
          <div className="p-6 space-y-3">
            {plans.map((p) => {
              const used = p.reservedAmount + p.commitmentAmount + p.actualAmount;
              const pct = Math.round((used / p.approvedAmount) * 100);
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{p.budgetCode}</span> —{' '}
                    <span className="text-slate-600">{p.departmentName}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ใช้ไปแล้วรวม (กันงบ + ผูกพัน + จ่ายจริง): ฿{used.toLocaleString()} จากงบอนุมัติ ฿
                      {p.approvedAmount.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-bold ${
                      pct >= 80
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    ใช้วงเงินไป {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

