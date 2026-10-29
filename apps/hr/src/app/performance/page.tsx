'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { Target, CheckCircle2, Award } from 'lucide-react';

export default function HRPerformancePage() {
  const { performances } = useHR();
  const { addToast } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">DEVELOPMENT & EVALUATION</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <Target className="w-7 h-7 text-[#0D9488]" />
            <span>ประเมินผลการปฏิบัติงานและทดลองงาน (KPI & Probation Appraisal)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            ติดตามตัวชี้วัดผลงานหลัก (KPIs) สมรรถนะหลัก (Core Competency) สมรรถนะทางคลินิก และการประเมินผ่านทดลองงาน 119 วัน
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">บุคลากร / ตำแหน่ง</th>
                <th className="py-3.5 px-4">ประเภทการประเมิน</th>
                <th className="py-3.5 px-3 text-center">KPI (50%)</th>
                <th className="py-3.5 px-3 text-center">Core (25%)</th>
                <th className="py-3.5 px-3 text-center">Clinical (25%)</th>
                <th className="py-3.5 px-3 text-center">คะแนนรวม</th>
                <th className="py-3.5 px-4 text-center">เกรดผลประเมิน</th>
                <th className="py-3.5 px-4">ผู้ประเมิน</th>
                <th className="py-3.5 px-4 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {performances.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{p.empName}</div>
                    <div className="text-[10px] text-[#64748B]">{p.departmentName}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">
                    <div>{p.reviewType}</div>
                    <div className="text-[10px] text-[#64748B]">{p.period}</div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{p.kpiScore}</td>
                  <td className="py-3 px-3 text-center font-mono">{p.coreCompetencyScore}</td>
                  <td className="py-3 px-3 text-center font-mono">{p.clinicalCompetencyScore}</td>
                  <td className="py-3 px-3 text-center font-extrabold text-[#0D9488] text-sm">{p.totalScore}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0D9488] border border-teal-200">
                      {p.grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{p.evaluator}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => addToast('success', `อนุมัติผลประเมินของ ${p.empName} เรียบร้อยแล้ว`)}
                      className="px-3 py-1 bg-[#0D9488] text-white rounded-lg text-[11px] font-bold"
                    >
                      รับรองผล
                    </button>
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

