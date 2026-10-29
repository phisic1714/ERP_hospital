'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { Receipt } from 'lucide-react';

export default function HRDeductionsPage() {
  const items = [
    { code: 'INC-01', name: 'เงินเดือนพื้นฐาน (Base Salary)', type: 'รายรับ (Income)', taxMethod: 'คำนวณภาษี ภ.ง.ด.1 (40(1))', autoSync: 'ดึงจากสัญญาจ้าง' },
    { code: 'INC-02', name: 'ค่าใบประกอบวิชาชีพ (License Allowance)', type: 'รายรับ (Income)', taxMethod: 'คำนวณภาษี ภ.ง.ด.1', autoSync: 'ตรวจสอบสถานะใบอนุญาต Active' },
    { code: 'INC-03', name: 'ค่าขึ้นเวรบ่าย / เวรดึก (Shift Premium)', type: 'รายรับ (Income)', taxMethod: 'คำนวณภาษี ภ.ง.ด.1', autoSync: 'ดึงจากตารางเวร Roster อัตโนมัติ' },
    { code: 'INC-04', name: 'ค่าล่วงเวลา (Overtime 1.5x / 2x / 3x)', type: 'รายรับ (Income)', taxMethod: 'คำนวณภาษี ภ.ง.ด.1', autoSync: 'ดึงจากใบขอ OT ที่อนุมัติแล้ว' },
    { code: 'DED-01', name: 'ภาษีหัก ณ ที่จ่าย (Withholding Tax ภ.ง.ด.1)', type: 'รายการหัก (Deduction)', taxMethod: 'อัตราก้าวหน้า 5% - 35%', autoSync: 'คำนวณตามลดหย่อน ล.ย.01' },
    { code: 'DED-02', name: 'เงินสมทบกองทุนประกันสังคม (SSO ม.33)', type: 'รายการหัก (Deduction)', taxMethod: '5% ของฐาน (สูงสุด 750 บาท)', autoSync: 'ส่งออกไฟล์สปส. 1-10' },
    { code: 'DED-03', name: 'กองทุนสำรองเลี้ยงชีพ (Provident Fund)', type: 'รายการหัก (Deduction)', taxMethod: 'หักสะสม 5% - 15%', autoSync: 'นำส่ง บลจ. อัตโนมัติ' },
    { code: 'DED-04', name: 'เงินกู้ยืมเพื่อการศึกษา (กยศ.) / สหกรณ์ออมทรัพย์ รพ.', type: 'รายการหัก (Deduction)', taxMethod: 'หักตามยอดแจ้งรายเดือน', autoSync: 'ตัดบัญชีเงินเดือน' },
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
          <Receipt className="w-7 h-7 text-[#0D9488]" />
          <span>รหัสรายการหักและรายรับเงินเดือน (Income & Deduction Master Codes)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          ผังรหัสรายรับ-รายจ่ายสำหรับประมวลผลเงินเดือน การคำนวณภาษีหัก ณ ที่จ่าย ประกันสังคม และกองทุนสำรองเลี้ยงชีพ
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">รหัสรายการ</th>
                <th className="py-3.5 px-4">ชื่อรายการรายรับ / รายการหัก</th>
                <th className="py-3.5 px-4">ประเภท</th>
                <th className="py-3.5 px-4">วิธีคำนวณภาษี / กฎหมาย</th>
                <th className="py-3.5 px-4">การเชื่อมโยงข้อมูลอัตโนมัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {items.map((it) => (
                <tr key={it.code} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{it.code}</td>
                  <td className="py-3 px-4 font-bold text-[#14213D]">{it.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        it.type.includes('รายรับ')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {it.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{it.taxMethod}</td>
                  <td className="py-3 px-4 font-medium text-[#14213D]">{it.autoSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

