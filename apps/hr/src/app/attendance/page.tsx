'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { Clock, Plus, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

export default function HRAttendancePage() {
  const { attendance, employees, addAttendance } = useHR();
  const { addToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [empCode, setEmpCode] = useState(employees[0]?.empCode || '');
  const [shiftType, setShiftType] = useState<'เวรเช้า (M)' | 'เวรบ่าย (A)' | 'เวรดึก (N)' | 'Office (08:00-17:00)'>('เวรเช้า (M)');
  const [checkIn, setCheckIn] = useState('07:50');
  const [checkOut, setCheckOut] = useState('16:05');

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.empCode === empCode) || employees[0];
    addAttendance({
      date: '2026-10-28',
      empCode: emp.empCode,
      empName: emp.fullName,
      departmentName: emp.departmentName,
      position: emp.position,
      shiftType,
      checkIn,
      checkOut,
      status: 'NORMAL',
      lateMinutes: 0,
      otHours: 0,
      device: 'Manual-HR-Terminal',
    });
    addToast('success', `บันทึกเวลาปฏิบัติงานของ ${emp.fullName} เรียบร้อยแล้ว`);
    setShowModal(false);
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
            <Clock className="w-7 h-7 text-[#0D9488]" />
            <span>บันทึกเวลาเข้า-ออก (Time & Attendance Tracking)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            ตรวจสอบเวลาสแกนใบหน้าเข้า-ออกงาน แยกตามผลัดเวรเช้า/บ่าย/ดึก การมาสาย ขาดงาน และชั่วโมงควบเวร OT
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ลงเวลาปฏิบัติงานย้อนหลัง / พิเศษ</span>
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">ลงเวลาวันนี้ทั้งหมด</span>
          <div className="text-2xl font-extrabold text-[#14213D] mt-1">{attendance.length} คน</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">ตรงเวลา (On-Time)</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {attendance.filter((a) => a.status === 'NORMAL' || a.status === 'OT').length} คน
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">มาสาย (Late)</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {attendance.filter((a) => a.status === 'LATE').length} คน
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">ควบเวร OT วันนี้</span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">
            {attendance.filter((a) => a.otHours > 0).length} คน
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">วันที่</th>
                <th className="py-3.5 px-4">รหัส / บุคลากร</th>
                <th className="py-3.5 px-4">แผนก</th>
                <th className="py-3.5 px-4">ผลัดเวร</th>
                <th className="py-3.5 px-4 text-center">เวลาเข้า</th>
                <th className="py-3.5 px-4 text-center">เวลาออก</th>
                <th className="py-3.5 px-4">จุดสแกน (Biometric)</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {attendance.map((att) => (
                <tr key={att.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono text-[#64748B]">{att.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{att.empName}</div>
                    <div className="font-mono text-[10px] text-[#0D9488]">{att.empCode}</div>
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">{att.departmentName}</td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">{att.shiftType}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">{att.checkIn}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-[#14213D]">{att.checkOut}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">{att.device}</td>
                  <td className="py-3 px-4 text-center">
                    {att.status === 'LATE' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        มาสาย ({att.lateMinutes} นาที)
                      </span>
                    ) : att.status === 'OT' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        ปกติ + OT {att.otHours} ชม.
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ปกติ (On-Time)
                      </span>
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
            <h3 className="font-extrabold text-base text-[#14213D]">ลงเวลาปฏิบัติงาน (Manual Attendance)</h3>
            <form onSubmit={handleManualCheckIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">เลือกบุคลากร</label>
                <select
                  value={empCode}
                  onChange={(e) => setEmpCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.empCode}>
                      {e.empCode} - {e.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">ผลัดเวรปฏิบัติงาน</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                >
                  <option value="เวรเช้า (M)">เวรเช้า (M) 08:00 - 16:00</option>
                  <option value="เวรบ่าย (A)">เวรบ่าย (A) 16:00 - 24:00</option>
                  <option value="เวรดึก (N)">เวรดึก (N) 24:00 - 08:00</option>
                  <option value="Office (08:00-17:00)">Office (08:00 - 17:00)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">เวลาเข้า (Check-In)</label>
                  <input
                    type="text"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">เวลาออก (Check-Out)</label>
                  <input
                    type="text"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl">
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">
                  บันทึกเวลา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

