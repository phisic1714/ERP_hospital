'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export default function FinancePayablesPage() {
  const { addToast } = useApp();
  const [payables, setPayables] = useState([
    { id: 'ap-1', invNo: 'INV-ZUE-88412', poNo: 'PO-202610-008', grNo: 'GR-202610-014', vendor: 'บริษัท ซิลลิค ฟาร์มา จำกัด', dueDate: '2026-11-15', amount: 485000, status: 'PENDING_PAYMENT' },
    { id: 'ap-2', invNo: 'INV-DKSH-44901', poNo: 'PO-202610-009', grNo: 'GR-202610-015', vendor: 'บริษัท ดีเคเอสเอช (ประเทศไทย) จำกัด', dueDate: '2026-11-20', amount: 320000, status: 'PENDING_PAYMENT' },
    { id: 'ap-3', invNo: 'INV-GPO-10294', poNo: 'PO-202610-004', grNo: 'GR-202610-009', vendor: 'องค์การเภสัชกรรม (GPO)', dueDate: '2026-10-28', amount: 640000, status: 'PAID' },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7] mb-1">
          <Link href="/finance" className="hover:underline">FINANCE & ACCOUNTING</Link>
          <span>/</span>
          <span className="text-[#64748B]">ACCOUNTS PAYABLE</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-[#0284C7]" />
          <span>บัญชีเจ้าหนี้และการเบิกจ่าย (Accounts Payable & Disbursement)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          ตรวจสอบความถูกต้อง 3 ทาง (3-Way Matching: PO / GR / Invoice) และอนุมัติโอนชำระเงินให้ผู้จัดจำหน่ายยาและเวชภัณฑ์
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขใบแจ้งหนี้ (Invoice)</th>
                <th className="py-3.5 px-4">อ้างอิง PO / ใบรับ GR</th>
                <th className="py-3.5 px-4">ผู้จัดจำหน่าย (Vendor)</th>
                <th className="py-3.5 px-4">วันครบกำหนดชำระ</th>
                <th className="py-3.5 px-4 text-right">ยอดชำระสุทธิ</th>
                <th className="py-3.5 px-4 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {payables.map((ap) => (
                <tr key={ap.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">{ap.invNo}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">{ap.poNo} / {ap.grNo}</td>
                  <td className="py-3 px-4 font-bold text-[#14213D]">{ap.vendor}</td>
                  <td className="py-3 px-4 text-[#64748B]">{ap.dueDate}</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#14213D]">฿{ap.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {ap.status === 'PENDING_PAYMENT' ? (
                      <button
                        onClick={() => {
                          setPayables((prev) => prev.map((x) => (x.id === ap.id ? { ...x, status: 'PAID' } : x)));
                          addToast('success', `อนุมัติใบสำคัญจ่ายและโอนเงินชำระ ${ap.invNo} เรียบร้อยแล้ว`);
                        }}
                        className="px-3 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-[11px] font-bold"
                      >
                        อนุมัติเบิกจ่าย
                      </button>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        จ่ายชำระแล้ว (Paid)
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

