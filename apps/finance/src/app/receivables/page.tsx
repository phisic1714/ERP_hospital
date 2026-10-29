'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { TrendingUp } from 'lucide-react';

export default function FinanceReceivablesPage() {
  const receivables = [
    { claimNo: 'AR-NHSO-2569/10', payer: 'สำนักงานหลักประกันสุขภาพแห่งชาติ (สปสช. / บัตรทอง)', patientsCount: 1420, billedAmount: 2450000, status: 'รอโอนจัดสรร (Billed)' },
    { claimNo: 'AR-SSO-2569/10', payer: 'สำนักงานประกันสังคม (ผู้ประกันตน ม.33 / ม.39)', patientsCount: 980, billedAmount: 1850000, status: 'รับชำระแล้ว (Received)' },
    { claimNo: 'AR-CGD-2569/10', payer: 'กรมบัญชีกลาง (สิทธิเบิกตรงข้าราชการ)', patientsCount: 640, billedAmount: 1620000, status: 'รอโอนจัดสรร (Billed)' },
    { claimNo: 'AR-INS-2569/10', payer: 'บริษัทประกันชีวิตและประกันสุขภาพเอกชน (Private Insurance)', patientsCount: 215, billedAmount: 1050000, status: 'รับชำระแล้ว (Received)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0284C7] mb-1">
          <Link href="/finance" className="hover:underline">FINANCE & ACCOUNTING</Link>
          <span>/</span>
          <span className="text-[#64748B]">ACCOUNTS RECEIVABLE</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <TrendingUp className="w-7 h-7 text-[#0284C7]" />
          <span>บัญชีลูกหนี้และรายรับค่ารักษาพยาบาล (Accounts Receivable & Healthcare Claims)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          บริหารรายรับค่ารักษาพยาบาลผู้ป่วยนอก/ผู้ป่วยใน และการตั้งหนี้เรียกเก็บกองทุนสิทธิการรักษา (สปสช. / ประกันสังคม / กรมบัญชีกลาง / ประกันเอกชน)
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขที่งวดเรียกเก็บ</th>
                <th className="py-3.5 px-4">กองทุน / ลูกหนี้สิทธิการรักษา</th>
                <th className="py-3.5 px-4 text-center">จำนวนเคส (Visits)</th>
                <th className="py-3.5 px-4 text-right">ยอดตั้งหนี้เรียกเก็บ</th>
                <th className="py-3.5 px-4 text-center">สถานะการรับชำระ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {receivables.map((ar) => (
                <tr key={ar.claimNo} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">{ar.claimNo}</td>
                  <td className="py-3 px-4 font-bold text-[#14213D]">{ar.payer}</td>
                  <td className="py-3 px-4 text-center font-mono">{ar.patientsCount.toLocaleString()} ราย</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#14213D]">฿{ar.billedAmount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                      {ar.status}
                    </span>
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

