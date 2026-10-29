'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import { Settings, Save } from 'lucide-react';

export default function HRSettingsPage() {
  const { addToast } = useApp();
  const [lateGraceMinutes, setLateGraceMinutes] = useState(15);
  const [licenseAlertDays, setLicenseAlertDays] = useState(90);
  const [probationDays, setProbationDays] = useState(119);
  const [ssoRate, setSsoRate] = useState(5);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'บันทึกการตั้งค่าระบบบริหารทรัพยากรบุคคล (HR Policy Settings) เรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
          <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
          <span>/</span>
          <span className="text-[#64748B]">REPORTS & SETTINGS</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-[#0D9488]" />
          <span>ตั้งค่าระบบและระเบียบงานบุคคล (HR System Configuration)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          กำหนดพารามิเตอร์เวลาผลัดเวร เกณฑ์สาย การแจ้งเตือนใบประกอบวิชาชีพ และอัตราประกันสังคม
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-[#E2EAF4] shadow-xs space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-[#14213D] mb-1">
              ระยะเวลาผ่อนผันการสแกนเข้าเวรสาย (Grace Period - นาที)
            </label>
            <input
              type="number"
              value={lateGraceMinutes}
              onChange={(e) => setLateGraceMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2EAF4] rounded-xl bg-[#F5F8FC]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#14213D] mb-1">
              แจ้งเตือนใบประกอบวิชาชีพหมดอายุล่วงหน้า (วัน)
            </label>
            <input
              type="number"
              value={licenseAlertDays}
              onChange={(e) => setLicenseAlertDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2EAF4] rounded-xl bg-[#F5F8FC]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#14213D] mb-1">
              ระยะเวลาทดลองงานมาตรฐาน (Probation Period - วัน)
            </label>
            <input
              type="number"
              value={probationDays}
              onChange={(e) => setProbationDays(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2EAF4] rounded-xl bg-[#F5F8FC]"
            />
          </div>
          <div>
            <label className="block font-bold text-[#14213D] mb-1">
              อัตราเงินสมทบประกันสังคม ม.33 (%)
            </label>
            <input
              type="number"
              value={ssoRate}
              onChange={(e) => setSsoRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#E2EAF4] rounded-xl bg-[#F5F8FC]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#E2EAF4]">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าระบบ HR</span>
          </button>
        </div>
      </form>
    </div>
  );
}

