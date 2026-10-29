'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { Network, Building2, Users, Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react';

export default function HROrganizationPage() {
  const divisions = [
    {
      name: 'กลุ่มภารกิจด้านการแพทย์ (Medical Affairs Division)',
      head: 'นพ. กิตติภพ รัตนโชติ (รองผู้อำนวยการฝ่ายการแพทย์)',
      color: 'border-teal-300 bg-teal-50/40',
      badge: 'Medical Core',
      units: [
        { code: 'MED', name: 'แผนกอายุรกรรม (Internal Medicine)', staff: 18, lead: 'นพ. กิตติภพ รัตนโชติ' },
        { code: 'OR', name: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (Surgery & OR)', staff: 19, lead: 'พญ. พิมพ์ชนก อัศวเดช' },
        { code: 'ER', name: 'แผนกฉุกเฉินและอุบัติเหตุ (Emergency Room)', staff: 22, lead: 'นพ. ภาคภูมิ วัฒนชัย' },
      ],
    },
    {
      name: 'กลุ่มภารกิจด้านการพยาบาล (Nursing Division)',
      head: 'พว. ศิริพร วงศ์สวัสดิ์ (หัวหน้าพยาบาล / CNO)',
      color: 'border-blue-300 bg-blue-50/40',
      badge: 'Nursing Care',
      units: [
        { code: 'ICU', name: 'หอผู้ป่วยวิกฤต (Intensive Care Unit)', staff: 24, lead: 'พว. ศิริพร วงศ์สวัสดิ์' },
        { code: 'IPD', name: 'หอผู้ป่วยในสามัญและพิเศษ (IPD Wards)', staff: 32, lead: 'พว. กัญญาณัฐ สุขสวัสดิ์' },
        { code: 'OPD', name: 'แผนกผู้ป่วยนอก (Outpatient Department)', staff: 16, lead: 'พว. มนัสนันท์ ศรีสุวรรณ' },
      ],
    },
    {
      name: 'กลุ่มภารกิจสหวิชาชีพและเทคนิคบริการ (Allied Health & Pharmacy)',
      head: 'ภก. ธนากร เจริญสุข (ประธานสหวิชาชีพ)',
      color: 'border-purple-300 bg-purple-50/40',
      badge: 'Clinical Support',
      units: [
        { code: 'PHARM', name: 'กลุ่มงานเภสัชกรรมและคลังเวชภัณฑ์ (Pharmacy)', staff: 14, lead: 'ภก. ธนากร เจริญสุข' },
        { code: 'LAB', name: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)', staff: 11, lead: 'ทนพ. ณัฐวุฒิ สายชล' },
        { code: 'REHAB', name: 'แผนกเวชกรรมฟื้นฟูและกายภาพบำบัด', staff: 8, lead: 'กภ. ปิยะพงษ์ ใจงาม' },
      ],
    },
    {
      name: 'กลุ่มภารกิจบริหารและสนับสนุนโรงพยาบาล (Hospital Administration)',
      head: 'นาย ปรเมศวร์ อินทร์จันทร์ (รองผู้อำนวยการฝ่ายบริหาร)',
      color: 'border-amber-300 bg-amber-50/40',
      badge: 'Back Office',
      units: [
        { code: 'HR', name: 'ฝ่ายทรัพยากรบุคคลและพัฒนาองค์กร (HRM & HRD)', staff: 6, lead: 'นาย ปรเมศวร์ อินทร์จันทร์' },
        { code: 'INV', name: 'ฝ่ายคลังพัสดุและจัดซื้อจัดจ้าง (Supply Chain)', staff: 9, lead: 'นาย วิชัย เกียรติบูรพา' },
        { code: 'FIN', name: 'ฝ่ายการเงินการคลังและเวชระเบียน', staff: 12, lead: 'น.ส. วรนุช การบัญชี' },
      ],
    },
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
            <Network className="w-7 h-7 text-[#0D9488]" />
            <span>โครงสร้างองค์กรโรงพยาบาล (Hospital Organization Chart)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            ผังสายการบังคับบัญชา 4 กลุ่มภารกิจหลัก ตามมาตรฐานการบริหารโรงพยาบาล (HA / JCI)
          </p>
        </div>
      </div>

      {/* Top Executive Box */}
      <div className="bg-gradient-to-r from-[#14213D] to-[#1E3A8A] text-white p-6 rounded-3xl shadow-md text-center max-w-2xl mx-auto border border-blue-400/30">
        <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-200 border border-teal-400/30">
          Hospital Executive Director
        </span>
        <h2 className="text-xl font-extrabold mt-2">นพ. เกียรติศักดิ์ วงศ์เวชช์</h2>
        <p className="text-xs text-slate-300 mt-0.5">ผู้อำนวยการโรงพยาบาล (Hospital Director) • ประธานคณะกรรมการบริหาร</p>
      </div>

      {/* 4 Main Divisions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {divisions.map((div, idx) => (
          <div key={idx} className={`rounded-3xl border-2 p-5 space-y-4 bg-white ${div.color}`}>
            <div className="flex items-start justify-between gap-2 border-b border-[#E2EAF4] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#0D9488] border border-teal-200">
                  {div.badge}
                </span>
                <h3 className="text-base font-extrabold text-[#14213D] mt-1.5">{div.name}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">ผู้บริหารสูงสุด: {div.head}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {div.units.map((u) => (
                <div
                  key={u.code}
                  className="bg-white p-3.5 rounded-2xl border border-[#E2EAF4] shadow-2xs flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#14213D]">
                        {u.code}
                      </span>
                      <span className="font-bold text-xs text-[#14213D]">{u.name}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">หัวหน้าหน่วยงาน: {u.lead}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-[#0D9488]">{u.staff} คน</span>
                    <span className="block text-[10px] text-[#94A3B8]">ปฏิบัติงาน</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

