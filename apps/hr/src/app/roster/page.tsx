'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { CalendarDays, ArrowLeftRight, Plus, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

const DAYS = [
  { day: 1, label: 'จ. 26 ต.ค.' },
  { day: 2, label: 'อ. 27 ต.ค.' },
  { day: 3, label: 'พ. 28 ต.ค.' },
  { day: 4, label: 'พฤ. 29 ต.ค.' },
  { day: 5, label: 'ศ. 30 ต.ค.' },
  { day: 6, label: 'ส. 31 ต.ค.' },
  { day: 7, label: 'อา. 1 พ.ย.' },
];

export default function HRRosterPage() {
  const { shifts, swaps, employees, addSwapRequest, updateSwapStatus } = useHR();
  const { addToast } = useApp();

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [requesterCode, setRequesterCode] = useState(employees[1]?.empCode || '');
  const [targetCode, setTargetCode] = useState(employees[3]?.empCode || '');
  const [fromDate, setFromDate] = useState('2026-10-30');
  const [fromShift, setFromShift] = useState<'เวรเช้า (M)' | 'เวรบ่าย (A)' | 'เวรดึก (N)'>('เวรบ่าย (A)');
  const [toDate, setToDate] = useState('2026-10-31');
  const [toShift, setToShift] = useState<'เวรเช้า (M)' | 'เวรบ่าย (A)' | 'เวรดึก (N)'>('เวรเช้า (M)');
  const [reason, setReason] = useState('');

  const getShiftPill = (code: string) => {
    switch (code) {
      case 'M':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-teal-50 text-[#0D9488] border border-teal-200">เช้า (M)</span>;
      case 'A':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">บ่าย (A)</span>;
      case 'N':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-950 text-indigo-100 border border-indigo-800">ดึก (N)</span>;
      case 'OT':
        return <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-300">เวรเสริม OT</span>;
      default:
        return <span className="px-2 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-400">หยุด (OFF)</span>;
    }
  };

  const handleCreateSwap = (e: React.FormEvent) => {
    e.preventDefault();
    const reqEmp = employees.find((x) => x.empCode === requesterCode) || employees[0];
    const tarEmp = employees.find((x) => x.empCode === targetCode) || employees[1];
    addSwapRequest({
      swapNo: `SWP-2026-0${swaps.length + 15}`,
      requestDate: '2026-10-28',
      requesterCode: reqEmp.empCode,
      requesterName: reqEmp.fullName,
      departmentName: reqEmp.departmentName,
      fromDate,
      fromShift,
      targetCode: tarEmp.empCode,
      targetName: tarEmp.fullName,
      toDate,
      toShift,
      reason: reason || 'ขอแลกเวรปฏิบัติงานตามความเหมาะสมของอัตรากำลัง',
      status: 'PENDING_APPROVAL',
    });
    addToast('success', 'ส่งคำขอสลับเวร/แลกเวรไปยังหัวหน้าหอผู้ป่วยแล้ว');
    setShowSwapModal(false);
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
            <CalendarDays className="w-7 h-7 text-[#0D9488]" />
            <span>ตารางเวรปฏิบัติงาน 24 ชม. (Shift & Roster Management)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            จัดตารางเวรแพทย์ พยาบาล สหวิชาชีพ (เช้า M / บ่าย A / ดึก N) ระบบขอสลับเวร-แลกเวร และตรวจสอบกำลังคนขึ้นเวร
          </p>
        </div>

        <button
          onClick={() => setShowSwapModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>ยื่นคำขอสลับเวร / แลกเวร</span>
        </button>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-[#14213D]">สัญลักษณ์ผลัดเวร:</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-500 inline-block" /> เช้า (M: 08:00-16:00)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> บ่าย (A: 16:00-24:00)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-950 inline-block" /> ดึก (N: 24:00-08:00)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> เวรเสริม/On-Call (OT)</span>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>อัตรากำลังคนขึ้นเวรผ่านเกณฑ์ปลอดภัยทุกผลัด</span>
        </span>
      </div>

      {/* Weekly Roster Matrix */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#14213D]">
            ตารางเวรประจำสัปดาห์ (Weekly Clinical Shift Roster)
          </h2>
          <span className="text-xs text-[#64748B]">สัปดาห์ที่ 44 • 26 ต.ค. - 1 พ.ย. 2569</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">บุคลากร / ตำแหน่ง</th>
                <th className="py-3.5 px-3">บทบาทในเวร</th>
                {DAYS.map((d) => (
                  <th key={d.day} className="py-3.5 px-3 text-center">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {shifts.map((sh) => (
                <tr key={sh.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{sh.empName}</div>
                    <div className="text-[10px] text-[#64748B]">{sh.departmentName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-[#14213D] font-semibold text-[11px]">
                      {sh.roleBadge}
                    </span>
                  </td>
                  {DAYS.map((d) => (
                    <td key={d.day} className="py-3 px-3 text-center">
                      {getShiftPill(sh.schedule[d.day])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Swap Requests Section */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#14213D] flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[#0D9488]" />
            <span>รายการคำขอสลับเวรและแลกเวร (Shift Swap & Exchange Requests)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3 px-4">เลขที่คำขอ</th>
                <th className="py-3 px-4">ผู้ขอสลับเวร (เวรเดิม)</th>
                <th className="py-3 px-4">ผู้รับแลกเวร (เวรที่สลับ)</th>
                <th className="py-3 px-4">เหตุผล</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การอนุมัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {swaps.map((sw) => (
                <tr key={sw.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{sw.swapNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{sw.requesterName}</div>
                    <div className="text-[11px] text-[#0D9488] font-semibold">{sw.fromDate} • {sw.fromShift}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{sw.targetName}</div>
                    <div className="text-[11px] text-blue-600 font-semibold">{sw.toDate} • {sw.toShift}</div>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{sw.reason}</td>
                  <td className="py-3 px-4 text-center">
                    {sw.status === 'PENDING_APPROVAL' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        รออนุมัติสลับเวร
                      </span>
                    ) : sw.status === 'APPROVED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        อนุมัติแล้ว
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        ไม่อนุมัติ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {sw.status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            updateSwapStatus(sw.id, 'APPROVED');
                            addToast('success', `อนุมัติคำขอสลับเวร ${sw.swapNo} เรียบร้อยแล้ว`);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => {
                            updateSwapStatus(sw.id, 'REJECTED');
                            addToast('warning', `ปฏิเสธคำขอสลับเวร ${sw.swapNo}`);
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold border border-rose-200"
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

      {/* Modal: Create Shift Swap */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#14213D]">ยื่นคำขอสลับเวร / แลกเวร</h3>
            <form onSubmit={handleCreateSwap} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">ผู้ขอสลับเวร</label>
                <select
                  value={requesterCode}
                  onChange={(e) => setRequesterCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.empCode}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">วันที่เวรเดิม</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">ผลัดเวรเดิม</label>
                  <select value={fromShift} onChange={(e) => setFromShift(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                    <option value="เวรเช้า (M)">เวรเช้า (M)</option>
                    <option value="เวรบ่าย (A)">เวรบ่าย (A)</option>
                    <option value="เวรดึก (N)">เวรดึก (N)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">ผู้รับแลกเวรแทน</label>
                <select
                  value={targetCode}
                  onChange={(e) => setTargetCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.empCode}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">วันที่เวรสลับ</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">ผลัดเวรที่สลับ</label>
                  <select value={toShift} onChange={(e) => setToShift(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                    <option value="เวรเช้า (M)">เวรเช้า (M)</option>
                    <option value="เวรบ่าย (A)">เวรบ่าย (A)</option>
                    <option value="เวรดึก (N)">เวรดึก (N)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">เหตุผลการขอสลับเวร</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ระบุเหตุผล..."
                  className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowSwapModal(false)} className="px-4 py-2 border rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">ส่งคำขอสลับเวร</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

