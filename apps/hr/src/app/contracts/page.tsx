'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { FileSignature, CheckCircle2, Clock, Award, ArrowUpRight } from 'lucide-react';

export default function HRContractsPage() {
  const { employees } = useHR();
  const { addToast } = useApp();

  const careerMovements = [
    { id: 'cm-1', date: '2026-10-01', empName: 'พว. ศิริพร วงศ์สวัสดิ์', type: 'เลื่อนตำแหน่ง (Promotion)', detail: 'แต่งตั้งเป็น หัวหน้าพยาบาลหอผู้ป่วยวิกฤต (Head Nurse ICU)', docRef: 'ORD-HR-2569/102' },
    { id: 'cm-2', date: '2026-08-01', empName: 'พว. กัญญาณัฐ สุขสวัสดิ์', type: 'บรรจุเริ่มงานใหม่ (Onboarding)', detail: 'เริ่มสัญญาจ้างทดลองงาน 119 วัน แผนกผู้ป่วยใน IPD Ward 4', docRef: 'CNT-2569-088' },
    { id: 'cm-3', date: '2026-04-01', empName: 'ภก. ธนากร เจริญสุข', type: 'ปรับอัตราเงินเดือนประจำปี', detail: 'ปรับฐานเงินเดือนประจำปี +6.5% ตามผลประเมิน KPI ระดับ A', docRef: 'SAL-2569-019' },
    { id: 'cm-4', date: '2026-01-15', empName: 'นพ. กิตติภพ รัตนโชติ', type: 'ต่อสัญญาแพทย์ผู้เชี่ยวชาญ', detail: 'ต่อสัญญาแพทย์ประจำเต็มเวลา (Full-time Cardiologist) วาระ 3 ปี', docRef: 'CNT-MD-2569-004' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">EMPLOYEE MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <FileSignature className="w-7 h-7 text-[#0D9488]" />
            <span>สัญญาจ้างและประวัติการทำงาน (Employment Contracts & Career History)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารสัญญาจ้างบุคลากร การติดตามระยะเวลาทดลองงาน 119 วัน ประวัติการเลื่อนตำแหน่ง และการปรับฐานเงินเดือน
          </p>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#14213D]">
            ทะเบียนสัญญาจ้างและการผ่านทดลองงาน (Active Employment Contracts)
          </h2>
          <span className="text-xs text-[#64748B]">ทั้งหมด {employees.length} สัญญา</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3 px-4">รหัสพนักงาน</th>
                <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                <th className="py-3 px-4">ประเภทสัญญาจ้าง</th>
                <th className="py-3 px-4">วันเริ่มสัญญา</th>
                <th className="py-3 px-4">วันครบกำหนดทดลองงาน</th>
                <th className="py-3 px-4 text-center">สถานะสัญญา</th>
                <th className="py-3 px-4 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{e.empCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{e.fullName}</div>
                    <div className="text-[10px] text-[#64748B]">{e.position}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">{e.employmentType}</td>
                  <td className="py-3 px-4 text-[#64748B]">{e.hireDate}</td>
                  <td className="py-3 px-4 text-[#64748B]">{e.probationEndDate}</td>
                  <td className="py-3 px-4 text-center">
                    {e.status === 'PROBATION' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>อยู่ระหว่างทดลองงาน</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>บรรจุประจำแล้ว</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => addToast('info', `เปิดเอกสารสัญญาจ้างอิเล็กทรอนิกส์ของ ${e.fullName}`)}
                      className="text-[#0D9488] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>ดูสัญญา PDF</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Career Movement Timeline */}
      <div className="bg-white p-5 rounded-3xl border border-[#E2EAF4] shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#14213D] flex items-center gap-2">
          <Award className="w-4 h-4 text-[#0D9488]" />
          <span>คำสั่งแต่งตั้ง โยกย้าย และเลื่อนตำแหน่งล่าสุด (Career Movement Log)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {careerMovements.map((cm) => (
            <div key={cm.id} className="p-4 rounded-2xl bg-[#F5F8FC] border border-[#E2EAF4] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#0D9488]">{cm.docRef}</span>
                <span className="text-[11px] text-[#64748B]">{cm.date}</span>
              </div>
              <div className="font-bold text-sm text-[#14213D]">{cm.empName} — {cm.type}</div>
              <p className="text-xs text-[#64748B]">{cm.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

