'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { Briefcase, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HRPositionsPage() {
  const manpowerPlans = [
    { code: 'POS-MD-01', title: 'อายุรแพทย์ (Internal Medicine Physician)', dept: 'แผนกอายุรกรรม', category: 'แพทย์', approved: 10, actual: 10, ratioNote: 'OPD 40 เคส/วัน/แพทย์' },
    { code: 'POS-MD-02', title: 'แพทย์เวชศาสตร์ฉุกเฉิน (Emergency Physician)', dept: 'แผนกฉุกเฉิน (ER)', category: 'แพทย์', approved: 6, actual: 5, ratioNote: 'ประจำเวร 24 ชม.' },
    { code: 'POS-RN-01', title: 'พยาบาลวิชาชีพหอผู้ป่วยวิกฤต (ICU RN)', dept: 'หอผู้ป่วยวิกฤต (ICU)', category: 'พยาบาล', approved: 28, actual: 24, ratioNote: 'มาตรฐาน Nursing Ratio 1:1.5 เตียง' },
    { code: 'POS-RN-02', title: 'พยาบาลวิชาชีพฉุกเฉิน (ER Trauma RN)', dept: 'แผนกฉุกเฉิน (ER)', category: 'พยาบาล', approved: 25, actual: 22, ratioNote: 'ผลัดละ 7-8 คน (เช้า/บ่าย/ดึก)' },
    { code: 'POS-RN-03', title: 'พยาบาลวิชาชีพหอผู้ป่วยใน (IPD RN)', dept: 'หอผู้ป่วยใน (IPD)', category: 'พยาบาล', approved: 35, actual: 32, ratioNote: 'มาตรฐาน Nursing Ratio 1:4 เตียง' },
    { code: 'POS-RX-01', title: 'เภสัชกรคลินิกและบริหารคลังเวชภัณฑ์', dept: 'กลุ่มงานเภสัชกรรม', category: 'เภสัชกร', approved: 15, actual: 14, ratioNote: 'DIS / IPD / OPD / คลังยา FEFO' },
    { code: 'POS-MT-01', title: 'นักเทคนิคการแพทย์ (Medical Technologist)', dept: 'แผนกพยาธิวิทยา (Lab)', category: 'สหวิชาชีพ', approved: 12, actual: 11, ratioNote: 'ผลัดเวร 24 ชม. & ธนาคารเลือด' },
    { code: 'POS-SP-01', title: 'เจ้าหน้าที่บริหารงานบุคคลและพัสดุโรงพยาบาล', dept: 'ฝ่ายบริหารโรงพยาบาล', category: 'สายสนับสนุน', approved: 15, actual: 15, ratioNote: 'ครบตามกรอบอัตรากำลัง' },
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
            <Briefcase className="w-7 h-7 text-[#0D9488]" />
            <span>ตำแหน่งและกรอบอัตรากำลัง (Positions & FTE Manpower Planning)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            ควบคุมกรอบอัตรากำลังประจำปี (FTE) สัดส่วนพยาบาลต่อผู้ป่วย และตรวจสอบอัตราว่างเพื่อส่งต่อระบบสรรหา
          </p>
        </div>
        <Link
          href="/hr/recruitment"
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>เปิดใบขออัตรากำลัง (MRF)</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">รหัสตำแหน่ง</th>
                <th className="py-3.5 px-4">ชื่อตำแหน่งงานวิชาชีพ</th>
                <th className="py-3.5 px-4">แผนก / หน่วยงาน</th>
                <th className="py-3.5 px-4 text-center">กรอบอนุมัติ</th>
                <th className="py-3.5 px-4 text-center">ปฏิบัติงานจริง</th>
                <th className="py-3.5 px-4 text-center">อัตราว่าง</th>
                <th className="py-3.5 px-4">เกณฑ์ภาระงาน (Workload Standard)</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {manpowerPlans.map((p) => {
                const diff = p.approved - p.actual;
                return (
                  <tr key={p.code} className="hover:bg-[#F5F8FC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{p.code}</td>
                    <td className="py-3 px-4 font-bold text-[#14213D]">{p.title}</td>
                    <td className="py-3 px-4 text-[#64748B]">{p.dept}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#14213D]">{p.approved}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#0D9488]">{p.actual}</td>
                    <td className="py-3 px-4 text-center">
                      {diff > 0 ? (
                        <span className="font-extrabold text-amber-600">-{diff} อัตรา</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">ครบกรอบ</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{p.ratioNote}</td>
                    <td className="py-3 px-4 text-center">
                      {diff > 0 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>เปิดสรรหา {diff} อัตรา</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>เต็มกรอบ 100%</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

