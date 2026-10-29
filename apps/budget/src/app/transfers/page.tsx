'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import { ArrowRightLeft, Plus } from 'lucide-react';

export default function BudgetTransfersPage() {
  const { addToast } = useApp();
  const [transfers, setTransfers] = useState([
    { id: 'bt-1', docNo: 'BTR-2026-008', date: '2026-10-24', fromCode: 'BG-69-ADM (งบบริหารทั่วไป)', toCode: 'BG-69-PHARM (งบยาและเวชภัณฑ์)', amount: 1500000, reason: 'โอนเสริมงบจัดซื้อวัคซีนไข้หวัดใหญ่และยาต้านไวรัสช่วงฤดูฝน', status: 'APPROVED' },
    { id: 'bt-2', docNo: 'BTR-2026-009', date: '2026-10-28', fromCode: 'BG-69-MED (งบห้องผ่าตัด)', toCode: 'BG-69-LAB (งบน้ำยาชันสูตร)', amount: 450000, reason: 'เกลี่ยงบประมาณรองรับการตรวจวิเคราะห์เคสฉุกเฉินเพิ่มขึ้น', status: 'PENDING' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
            <Link href="/budget" className="hover:underline">BUDGET MANAGEMENT</Link>
            <span>/</span>
            <span className="text-[#64748B]">TRANSFERS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <ArrowRightLeft className="w-7 h-7 text-[#059669]" />
            <span>โอนย้ายและปรับเกลี่ยงบประมาณ (Budget Reallocation & Virement)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารการขออนุมัติโอนเกลี่ยงบประมาณข้ามหมวดหรือข้ามหน่วยงานตามระเบียบพัสดุและการคลังโรงพยาบาล
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขที่ใบโอนงบ</th>
                <th className="py-3.5 px-4">วันที่</th>
                <th className="py-3.5 px-4">โอนออกจากหมวด</th>
                <th className="py-3.5 px-4">โอนเข้าหมวด</th>
                <th className="py-3.5 px-4 text-right">จำนวนเงินโอน</th>
                <th className="py-3.5 px-4">เหตุผลความจำเป็น</th>
                <th className="py-3.5 px-4 text-right">การอนุมัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#059669]">{t.docNo}</td>
                  <td className="py-3 px-4 text-[#64748B]">{t.date}</td>
                  <td className="py-3 px-4 font-semibold text-rose-700">{t.fromCode}</td>
                  <td className="py-3 px-4 font-semibold text-[#059669]">{t.toCode}</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#14213D]">฿{t.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[#64748B]">{t.reason}</td>
                  <td className="py-3 px-4 text-right">
                    {t.status === 'PENDING' ? (
                      <button
                        onClick={() => {
                          setTransfers((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: 'APPROVED' } : x)));
                          addToast('success', `อนุมัติโอนเกลี่ยงบประมาณ ${t.docNo} เรียบร้อยแล้ว`);
                        }}
                        className="px-3 py-1 bg-[#059669] text-white rounded-lg text-[11px] font-bold"
                      >
                        อนุมัติโอนงบ
                      </button>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200">
                        อนุมัติแล้ว
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

