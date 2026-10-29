'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { Coins, Stethoscope, ShieldCheck, Clock } from 'lucide-react';

export default function HRAllowancesPage() {
  const rateCards = [
    { group: 'แพทย์ผู้เชี่ยวชาญ (Medical Specialist)', licenseRate: '35,000 - 50,000 บ./ด.', shiftAfternoon: '3,500 บ./เวร', shiftNight: '4,500 บ./เวร', note: 'ไม่รวมค่าธรรมเนียมแพทย์ (DF) ตามหัตถการจริง' },
    { group: 'พยาบาลวิชาชีพ ICU / ER / OR (Critical Care RN)', licenseRate: '6,000 - 8,000 บ./ด.', shiftAfternoon: '450 บ./เวร', shiftNight: '650 บ./เวร', note: 'ค่าความเชี่ยวชาญเฉพาะทาง +3,000 บ./ด.' },
    { group: 'พยาบาลวิชาชีพหอผู้ป่วยใน / OPD (General RN)', licenseRate: '5,000 บ./ด.', shiftAfternoon: '350 บ./เวร', shiftNight: '550 บ./เวร', note: 'เบี้ยขยันไม่ขาด/ไม่สาย +1,500 บ./ด.' },
    { group: 'เภสัชกรคลินิกและบริหารคลังยา (Pharmacist)', licenseRate: '10,000 - 12,000 บ./ด.', shiftAfternoon: '600 บ./เวร', shiftNight: '800 บ./เวร', note: 'ค่าไม่ทำเวชปฏิบัติส่วนตัว (พ.ต.ส.)' },
    { group: 'นักเทคนิคการแพทย์ / กายภาพบำบัด (Allied Health)', licenseRate: '5,000 บ./ด.', shiftAfternoon: '350 บ./เวร', shiftNight: '500 บ./เวร', note: 'ค่าเสี่ยงภัยห้องปฏิบัติการเชื้อโรค +2,000 บ./ด.' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
          <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
          <span>/</span>
          <span className="text-[#64748B]">PAYROLL & BENEFITS</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <Coins className="w-7 h-7 text-[#0D9488]" />
          <span>โครงสร้างค่าตอบแทนวิชาชีพและค่าเวร (Shift & License Allowances)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          ตารางอัตราค่าใบประกอบวิชาชีพ ค่าประจำตำแหน่ง ค่าเวรบ่าย-ดึก และค่าตอบแทนความเชี่ยวชาญเฉพาะทางโรงพยาบาล
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">กลุ่มสายวิชาชีพ</th>
                <th className="py-3.5 px-4">ค่าใบประกอบวิชาชีพ</th>
                <th className="py-3.5 px-4">ค่าเวรบ่าย (A: 16-24 น.)</th>
                <th className="py-3.5 px-4">ค่าเวรดึก (N: 24-08 น.)</th>
                <th className="py-3.5 px-4">เงื่อนไขและเงินเพิ่มพิเศษ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {rateCards.map((r, i) => (
                <tr key={i} className="hover:bg-[#F5F8FC]">
                  <td className="py-3.5 px-4 font-bold text-[#14213D]">{r.group}</td>
                  <td className="py-3.5 px-4 font-bold text-[#0D9488]">{r.licenseRate}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-600">{r.shiftAfternoon}</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-700">{r.shiftNight}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

