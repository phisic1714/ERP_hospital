'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { BadgeCheck, GraduationCap } from 'lucide-react';

export default function HRCertificatesPage() {
  const { employees } = useHR();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
          <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
          <span>/</span>
          <span className="text-[#64748B]">PROFESSIONAL CREDENTIAL</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <BadgeCheck className="w-7 h-7 text-[#0D9488]" />
          <span>ใบรับรองเฉพาะทางและคุณวุฒิการศึกษา (Board Certifications & Degrees)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          ฐานข้อมูลคุณวุฒิการศึกษา วุฒิบัตรแพทย์เฉพาะทาง ประกาศนียบัตรการพยาบาลเฉพาะทาง (APN) และใบรับรอง ACLS / BLS
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">รหัสบุคลากร</th>
                <th className="py-3.5 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3.5 px-4">สายวิชาชีพ</th>
                <th className="py-3.5 px-4">คุณวุฒิการศึกษาและวุฒิบัตรเฉพาะทาง</th>
                <th className="py-3.5 px-4 text-center">การตรวจสอบคุณวุฒิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{e.empCode}</td>
                  <td className="py-3 px-4 font-bold text-[#14213D]">{e.fullName}</td>
                  <td className="py-3 px-4 text-[#64748B]">{e.staffCategory}</td>
                  <td className="py-3 px-4 font-medium text-[#14213D] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#0D9488] shrink-0" />
                    <span>{e.education}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ตรวจสอบคุณวุฒิแล้ว (Verified)
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

