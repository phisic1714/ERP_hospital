'use client';

import React, { useState } from 'react';
import { useBudget } from '@erp/app-context';
import {
  FileBarChart,
  Download,
  Printer,
  CheckCircle2,
  Building2,
  Layers,
  Wallet,
  Lock,
  Receipt,
  GitCompare,
} from 'lucide-react';

export default function BudgetReportsPage() {
  const { plans, transactions } = useBudget();
  const [selectedReport, setSelectedReport] = useState<
    | 'ANNUAL'
    | 'BY_DEPT'
    | 'BY_CATEGORY'
    | 'REMAINING'
    | 'COMMITMENT'
    | 'ACTUAL'
    | 'COMPARISON'
  >('ANNUAL');
  const [exportBanner, setExportBanner] = useState<string | null>(null);

  const handleExport = (format: 'Excel (.xlsx)' | 'PDF (.pdf)') => {
    setExportBanner(
      `สร้างและส่งออกไฟล์รายงาน "${selectedReport}" ในรูปแบบ ${format} สำเร็จ (ข้อมูล ณ ปีงบประมาณ 2569)`
    );
  };

  const reportTypes = [
    { id: 'ANNUAL', label: '1. รายงานงบประมาณประจำปี' },
    { id: 'BY_DEPT', label: '2. รายงานงบประมาณตามหน่วยงาน' },
    { id: 'BY_CATEGORY', label: '3. รายงานตามหมวดงบประมาณ' },
    { id: 'REMAINING', label: '4. รายงานงบประมาณคงเหลือ' },
    { id: 'COMMITMENT', label: '5. รายงานภาระผูกพัน (PO)' },
    { id: 'ACTUAL', label: '6. รายงานค่าใช้จ่ายจริง (Finance)' },
    { id: 'COMPARISON', label: '7. รายงานเปรียบเทียบงบประมาณ' },
  ] as const;

  const totalApproved = plans.reduce((s, p) => s + p.approvedAmount, 0);
  const totalAllocated = plans.reduce((s, p) => s + p.allocatedAmount, 0);
  const totalReserved = plans.reduce((s, p) => s + p.reservedAmount, 0);
  const totalCommitment = plans.reduce((s, p) => s + p.commitmentAmount, 0);
  const totalActual = plans.reduce((s, p) => s + p.actualAmount, 0);
  const totalAvailable = totalApproved - totalReserved - totalCommitment - totalActual;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <FileBarChart className="w-3.5 h-3.5" />
            MOD-006 • BUDGET REPORTS & EXPORT
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            06. รายงานงบประมาณ (Budget Reports)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ศูนย์รวมรายงานงบประมาณประจำปี รายงานตามหน่วยงาน หมวดงบ ภาระผูกพัน ค่าใช้จ่ายจริง เปรียบเทียบแผน-ผล และส่งออก Excel / PDF
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('Excel (.xlsx)')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            ส่งออก Excel (.xlsx)
          </button>
          <button
            onClick={() => handleExport('PDF (.pdf)')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ / ส่งออก PDF
          </button>
        </div>
      </div>

      {exportBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {exportBanner}
          </span>
          <button onClick={() => setExportBanner(null)} className="text-emerald-700 hover:underline">
            ปิด
          </button>
        </div>
      )}

      {/* Report Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
          {reportTypes.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedReport === r.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Report Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <th className="py-3.5 px-4">รหัสงบประมาณ</th>
                <th className="py-3.5 px-4">หน่วยงาน / แผนก</th>
                <th className="py-3.5 px-4">หมวดงบประมาณ / แหล่งเงิน</th>
                <th className="py-3.5 px-4 text-right">งบที่ขอตั้ง</th>
                <th className="py-3.5 px-4 text-right">งบที่อนุมัติ</th>
                <th className="py-3.5 px-4 text-right">จัดสรรแล้ว</th>
                <th className="py-3.5 px-4 text-right text-purple-700">กันงบ (PR)</th>
                <th className="py-3.5 px-4 text-right text-amber-700">ผูกพัน (PO)</th>
                <th className="py-3.5 px-4 text-right text-blue-700">จ่ายจริง (Actual)</th>
                <th className="py-3.5 px-4 text-right text-emerald-700">งบคงเหลือสุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {plans.map((p) => {
                const avail =
                  p.approvedAmount - p.reservedAmount - p.commitmentAmount - p.actualAmount;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.budgetCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{p.departmentName}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">{p.budgetCategory}</div>
                      <div className="text-[10px] text-slate-400">{p.fundSource}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      ฿{p.requestedAmount.toLocaleString()}
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
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                      ฿{avail.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50/70 font-extrabold text-xs border-t-2 border-emerald-200">
                <td colSpan={3} className="py-3.5 px-4 text-slate-900">
                  รวมทั้งสิ้น (ปีงบประมาณ 2569)
                </td>
                <td className="py-3.5 px-4 text-right text-slate-700">
                  ฿{plans.reduce((s, p) => s + p.requestedAmount, 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-900">
                  ฿{totalApproved.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-teal-700">
                  ฿{totalAllocated.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-purple-700">
                  ฿{totalReserved.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-amber-600">
                  ฿{totalCommitment.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-blue-600">
                  ฿{totalActual.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-700">
                  ฿{totalAvailable.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

