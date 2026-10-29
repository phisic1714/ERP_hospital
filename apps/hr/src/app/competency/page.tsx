'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { Award, ShieldCheck } from 'lucide-react';

export default function HRCompetencyPage() {
  const matrix = [
    { role: 'พยาบาลวิชาชีพหอผู้ป่วยวิกฤต (ICU RN)', level: 'RN Level 3 - 4 (Expert)', patientSafety: '5/5', aclsSkill: '5/5', infectionControl: '5/5', status: 'ผ่านเกณฑ์ HA 100%' },
    { role: 'พยาบาลวิชาชีพฉุกเฉิน (ER Trauma RN)', level: 'RN Level 2 - 3 (Proficient)', patientSafety: '5/5', aclsSkill: '5/5', infectionControl: '4/5', status: 'ผ่านเกณฑ์ HA 100%' },
    { role: 'เภสัชกรคลินิกและการบริบาล (Clinical Pharmacist)', level: 'Senior Pharmacist', patientSafety: '5/5', aclsSkill: '4/5', infectionControl: '5/5', status: 'ผ่านเกณฑ์ High Alert Drug' },
    { role: 'นักเทคนิคการแพทย์ (Medical Technologist)', level: 'MT Level 2 - 3', patientSafety: '5/5', aclsSkill: '3/5', infectionControl: '5/5', status: 'ผ่านเกณฑ์ ISO 15189' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
          <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
          <span>/</span>
          <span className="text-[#64748B]">DEVELOPMENT & EVALUATION</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <Award className="w-7 h-7 text-[#0D9488]" />
          <span>สมรรถนะวิชาชีพและขีดความสามารถ (Hospital Competency Matrix)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          โครงสร้างสมรรถนะหลัก (Core Competency) และสมรรถนะทางคลินิกตามระดับ Nursing Ladder & Medical Privilege
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">กลุ่มตำแหน่งวิชาชีพ</th>
                <th className="py-3.5 px-4">ระดับขีดความสามารถ (Clinical Ladder)</th>
                <th className="py-3.5 px-4 text-center">Patient Safety</th>
                <th className="py-3.5 px-4 text-center">BLS / ACLS</th>
                <th className="py-3.5 px-4 text-center">Infection Control</th>
                <th className="py-3.5 px-4 text-center">ผลการรับรองสมรรถนะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {matrix.map((m, i) => (
                <tr key={i} className="hover:bg-[#F5F8FC]">
                  <td className="py-3.5 px-4 font-bold text-[#14213D]">{m.role}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#0D9488]">{m.level}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">{m.patientSafety}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">{m.aclsSkill}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">{m.infectionControl}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {m.status}
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

