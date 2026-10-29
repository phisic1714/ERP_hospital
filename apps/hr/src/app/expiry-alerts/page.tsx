'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { AlertTriangle, Bell, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function HRExpiryAlertsPage() {
  const { licenses, renewLicense } = useHR();
  const { addToast } = useApp();

  const alertLicenses = licenses.filter(
    (l) => l.status === 'EXPIRED' || l.status === 'NEAR_EXPIRY'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">PROFESSIONAL CREDENTIAL</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
            <span>ศูนย์แจ้งเตือนวันหมดอายุใบประกอบวิชาชีพ (License Expiry Alerts)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            ระบบเฝ้าระวังใบอนุญาตประกอบวิชาชีพที่หมดอายุหรือใกล้หมดอายุใน 90 วัน เพื่อป้องกันความเสี่ยงทางกฎหมายและมาตรฐาน HA
          </p>
        </div>

        <button
          onClick={() => addToast('info', 'ส่ง SMS และอีเมลแจ้งเตือนบุคลากรและหัวหน้าแผนกครบทุกรายการแล้ว')}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Bell className="w-4 h-4" />
          <span>ส่งแจ้งเตือนด่วนทั้งหมด ({alertLicenses.length})</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขใบอนุญาต</th>
                <th className="py-3.5 px-4">บุคลากร / แผนก</th>
                <th className="py-3.5 px-4">ประเภทใบอนุญาต</th>
                <th className="py-3.5 px-4">วันหมดอายุ</th>
                <th className="py-3.5 px-4 text-center">ระยะเวลาคงเหลือ</th>
                <th className="py-3.5 px-4 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {alertLicenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-rose-600">{lic.licenseNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{lic.empName}</div>
                    <div className="text-[10px] text-[#64748B]">{lic.departmentName}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">{lic.licenseType}</td>
                  <td className="py-3 px-4 font-bold text-rose-700">{lic.expiryDate}</td>
                  <td className="py-3 px-4 text-center">
                    {lic.status === 'EXPIRED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        หมดอายุแล้ว ({Math.abs(lic.daysRemaining)} วัน)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        เหลือ {lic.daysRemaining} วัน
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        renewLicense(lic.id, '2031-10-28');
                        addToast('success', `บันทึกการต่ออายุใบอนุญาต ${lic.licenseNo} เรียบร้อยแล้ว`);
                      }}
                      className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>ยืนยันต่ออายุแล้ว</span>
                    </button>
                  </td>
                </tr>
              ))}
              {alertLicenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#64748B]">
                    <div className="flex flex-col items-center gap-1.5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="font-bold text-[#14213D]">ใบประกอบวิชาชีพทุกรายการอยู่ในเกณฑ์ปกติ</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

