'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { BookOpen } from 'lucide-react';

export default function FinanceLedgerPage() {
  const accounts = [
    { accCode: '1101-01', name: 'เงินสดและเงินฝากธนาคารโรงพยาบาล', category: 'สินทรัพย์หมุนเวียน (Asset)', debit: 45200000, credit: 0 },
    { accCode: '1104-02', name: 'สินค้าคงคลัง - ยาและเวชภัณฑ์ทางการแพทย์ (FEFO)', category: 'สินทรัพย์หมุนเวียน (Asset)', debit: 18450000, credit: 0 },
    { accCode: '2101-01', name: 'เจ้าหนี้การค้า - ยาและเวชภัณฑ์ (Accounts Payable)', category: 'หนี้สินหมุนเวียน (Liability)', debit: 0, credit: 3840000 },
    { accCode: '4101-01', name: 'รายได้ค่ารักษาพยาบาลผู้ป่วยนอกและผู้ป่วยใน', category: 'รายได้ (Revenue)', debit: 0, credit: 22450000 },
    { accCode: '5101-01', name: 'ต้นทุนค่ายาและเวชภัณฑ์ใช้ไป (Cost of Medical Goods)', category: 'ค่าใช้จ่าย (Expense)', debit: 8920000, credit: 0 },
    { accCode: '5201-01', name: 'ค่าใช้จ่ายเงินเดือน ค่าประจำตำแหน่ง และค่าเวรบุคลากร (HR Payroll)', category: 'ค่าใช้จ่าย (Expense)', debit: 7400000, credit: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7] mb-1">
          <Link href="/finance" className="hover:underline">FINANCE & ACCOUNTING</Link>
          <span>/</span>
          <span className="text-[#64748B]">GENERAL LEDGER</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-[#0284C7]" />
          <span>สมุดบัญชีแยกประเภทและผังบัญชีโรงพยาบาล (General Ledger & COA)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          บันทึกบัญชีแยกประเภทอัตโนมัติเชื่อมโยงจากระบบคลังเวชภัณฑ์ (Inventory), ระบบจัดซื้อ (PO/GR) และระบบเงินเดือนบุคลากร (HR Payroll)
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">รหัสบัญชี (Account Code)</th>
                <th className="py-3.5 px-4">ชื่อบัญชีแยกประเภท</th>
                <th className="py-3.5 px-4">หมวดบัญชี</th>
                <th className="py-3.5 px-4 text-right">ยอดเดบิต (Debit)</th>
                <th className="py-3.5 px-4 text-right">ยอดเครดิต (Credit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {accounts.map((a) => (
                <tr key={a.accCode} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">{a.accCode}</td>
                  <td className="py-3 px-4 font-bold text-[#14213D]">{a.name}</td>
                  <td className="py-3 px-4 text-[#64748B]">{a.category}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {a.debit > 0 ? `฿${a.debit.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                    {a.credit > 0 ? `฿${a.credit.toLocaleString()}` : '-'}
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

