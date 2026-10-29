'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { Timer, Plus } from 'lucide-react';

export default function HROvertimePage() {
  const { otRequests, employees, addOTRequest, updateOTStatus } = useHR();
  const { addToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [empCode, setEmpCode] = useState(employees[1]?.empCode || '');
  const [otType, setOtType] = useState<'OT วันทำงานปกติ (1.5x)' | 'OT วันหยุดประจำสัปดาห์ (2.0x)' | 'OT วันหยุดนักขัตฤกษ์ (3.0x)' | 'เวรเสริมวิชาชีพ (On-Call)'>('เวรเสริมวิชาชีพ (On-Call)');
  const [hours, setHours] = useState(4);
  const [ratePerHour, setRatePerHour] = useState(350);
  const [reason, setReason] = useState('');

  const handleCreateOT = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.empCode === empCode) || employees[0];
    addOTRequest({
      otNo: `OT-2026-0${otRequests.length + 90}`,
      date: '2026-10-28',
      empCode: emp.empCode,
      empName: emp.fullName,
      departmentName: emp.departmentName,
      position: emp.position,
      otType,
      startTime: '16:00',
      endTime: '20:00',
      hours: Number(hours),
      ratePerHour: Number(ratePerHour),
      totalAmount: Number(hours) * Number(ratePerHour),
      reason: reason || 'ขึ้นเวรเสริมดูแลผู้ป่วยนอกเวลาทำการ',
      status: 'PENDING_APPROVAL',
    });
    addToast('success', `ส่งคำขออนุมัติ OT ของ ${emp.fullName} เรียบร้อยแล้ว`);
    setShowModal(false);
    setReason('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">TIME & ATTENDANCE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <Timer className="w-7 h-7 text-[#0D9488]" />
            <span>การทำงานล่วงเวลาและเวรเสริม (Overtime & On-Call Allowance)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารจัดการชั่วโมง OT (1.5x / 2.0x / 3.0x) และค่าตอบแทนเวรเสริมวิชาชีพ (On-Call) เพื่อส่งคำนวณเงินเดือนอัตโนมัติ
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ขออนุมัติทำงานล่วงเวลา (OT)</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขที่เอกสาร</th>
                <th className="py-3.5 px-4">วันที่</th>
                <th className="py-3.5 px-4">บุคลากร / แผนก</th>
                <th className="py-3.5 px-4">ประเภท OT / เวรเสริม</th>
                <th className="py-3.5 px-4 text-center">ชั่วโมง</th>
                <th className="py-3.5 px-4 text-right">ยอดเบิก (บาท)</th>
                <th className="py-3.5 px-4">เหตุผลภาระงาน</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {otRequests.map((ot) => (
                <tr key={ot.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{ot.otNo}</td>
                  <td className="py-3 px-4 text-[#64748B]">{ot.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{ot.empName}</div>
                    <div className="text-[10px] text-[#64748B]">{ot.departmentName}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">{ot.otType}</td>
                  <td className="py-3 px-4 text-center font-bold">{ot.hours} ชม.</td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                    ฿{ot.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[#64748B] max-w-[200px] truncate">{ot.reason}</td>
                  <td className="py-3 px-4 text-center">
                    {ot.status === 'PENDING_APPROVAL' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        รออนุมัติ
                      </span>
                    ) : ot.status === 'APPROVED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        อนุมัติแล้ว
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        ปฏิเสธ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {ot.status === 'PENDING_APPROVAL' && (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            updateOTStatus(ot.id, 'APPROVED');
                            addToast('success', `อนุมัติรายการ OT ${ot.otNo} เรียบร้อยแล้ว`);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => {
                            updateOTStatus(ot.id, 'REJECTED');
                            addToast('warning', `ปฏิเสธรายการ OT ${ot.otNo}`);
                          }}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#14213D]">ขออนุมัติทำงานล่วงเวลา (OT Request)</h3>
            <form onSubmit={handleCreateOT} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">บุคลากร</label>
                <select value={empCode} onChange={(e) => setEmpCode(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  {employees.map((e) => (
                    <option key={e.id} value={e.empCode}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">ประเภทอัตรา OT</label>
                <select value={otType} onChange={(e) => setOtType(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  <option value="เวรเสริมวิชาชีพ (On-Call)">เวรเสริมวิชาชีพ (On-Call)</option>
                  <option value="OT วันทำงานปกติ (1.5x)">OT วันทำงานปกติ (1.5x)</option>
                  <option value="OT วันหยุดประจำสัปดาห์ (2.0x)">OT วันหยุดประจำสัปดาห์ (2.0x)</option>
                  <option value="OT วันหยุดนักขัตฤกษ์ (3.0x)">OT วันหยุดนักขัตฤกษ์ (3.0x)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">จำนวนชั่วโมง</label>
                  <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">อัตราต่อชั่วโมง (บาท)</label>
                  <input type="number" value={ratePerHour} onChange={(e) => setRatePerHour(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">รายละเอียดภาระงาน</label>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="เช่น อยู่เวรเสริมห้องผ่าตัดฉุกเฉิน" className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">ส่งคำขอ OT</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

