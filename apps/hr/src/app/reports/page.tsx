'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { BarChart3, Printer, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function HRReportsPage() {
  const { payrolls, employees } = useHR();
  const { addToast } = useApp();

  const costTrend = [
    { month: 'พ.ค. 69', salary: 640000, shiftAndOT: 112000 },
    { month: 'มิ.ย. 69', salary: 643500, shiftAndOT: 118000 },
    { month: 'ก.ค. 69', salary: 643500, shiftAndOT: 125000 },
    { month: 'ส.ค. 69', salary: 673000, shiftAndOT: 121000 },
    { month: 'ก.ย. 69', salary: 673000, shiftAndOT: 128000 },
    { month: 'ต.ค. 69', salary: 673000, shiftAndOT: 134560 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">REPORTS & SETTINGS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#0D9488]" />
            <span>รายงานวิเคราะห์ทรัพยากรบุคคล (Executive HR Analytics & Reports)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            รายงานจำนวนบุคลากร ค่าใช้จ่ายเงินเดือนและค่าเวร อัตรากำลัง (FTE) และอัตราการเข้า-ออกงาน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-[#E2EAF4] rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>
          <button
            onClick={() => addToast('success', 'ส่งออกรายงาน HR Analytics (Excel / CSV) เรียบร้อยแล้ว')}
            className="px-4 py-2 bg-[#0D9488] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#E2EAF4] shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-[#14213D]">
          แนวโน้มค่าใช้จ่ายบุคลากร เงินเดือน และค่าขึ้นเวร/OT ย้อนหลัง 6 เดือน (Personnel Cost Trend)
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="salary" fill="#0D9488" radius={[6, 6, 0, 0]} name="เงินเดือนและค่าประจำตำแหน่ง (บาท)" />
              <Bar dataKey="shiftAndOT" fill="#F28C28" radius={[6, 6, 0, 0]} name="ค่าเวรบ่าย-ดึก และ OT (บาท)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

