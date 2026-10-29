'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { ScrollText } from 'lucide-react';

export default function HRAuditPage() {
  const { audits } = useHR();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
          <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
          <span>/</span>
          <span className="text-[#64748B]">REPORTS & SETTINGS</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <ScrollText className="w-7 h-7 text-[#0D9488]" />
          <span>ประวัติธุรกรรมงานทรัพยากรบุคคล (HR Audit Log & PDPA Trail)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          บันทึกการแก้ไขข้อมูลประวัติพนักงาน การอนุมัติเงินเดือน การเปลี่ยนตารางเวร และการต่ออายุใบประกอบวิชาชีพตามมาตรฐาน PDPA
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">วัน-เวลา</th>
                <th className="py-3.5 px-4">โมดูล</th>
                <th className="py-3.5 px-4">การกระทำ (Action)</th>
                <th className="py-3.5 px-4">อ้างอิงเอกสาร</th>
                <th className="py-3.5 px-4">ผู้ดำเนินการ</th>
                <th className="py-3.5 px-4">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap">{a.timestamp}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0D9488] font-bold text-[10px] border border-teal-200">
                      {a.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#14213D]">{a.action}</td>
                  <td className="py-3 px-4 font-mono text-[#0D9488] font-bold">{a.docNo}</td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">{a.actor}</td>
                  <td className="py-3 px-4 text-[#64748B]">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

