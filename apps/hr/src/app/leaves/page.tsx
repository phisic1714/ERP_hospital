'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { Palmtree, Plus, FileText } from 'lucide-react';

export default function HRLeavesPage() {
  const { leaves, employees, addLeaveRequest, updateLeaveStatus } = useHR();
  const { addToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [empCode, setEmpCode] = useState(employees[1]?.empCode || '');
  const [leaveType, setLeaveType] = useState<'ลาป่วย (Sick Leave)' | 'ลากิจ (Personal Leave)' | 'ลาพักร้อน (Annual Leave)' | 'ลาคลอด (Maternity Leave)' | 'ลาฝึกอบรม/ประชุมวิชาการ'>('ลาพักร้อน (Annual Leave)');
  const [startDate, setStartDate] = useState('2026-11-10');
  const [endDate, setEndDate] = useState('2026-11-11');
  const [days, setDays] = useState(2);
  const [substitutePerson, setSubstitutePerson] = useState('พว. กัญญาณัฐ สุขสวัสดิ์');
  const [reason, setReason] = useState('');

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.empCode === empCode) || employees[0];
    addLeaveRequest({
      leaveNo: `LV-2026-0${leaves.length + 42}`,
      empCode: emp.empCode,
      empName: emp.fullName,
      departmentName: emp.departmentName,
      position: emp.position,
      leaveType,
      startDate,
      endDate,
      days: Number(days),
      reason: reason || 'ลาตามสิทธิสวัสดิการโรงพยาบาล',
      substitutePerson,
      medicalCert: leaveType === 'ลาป่วย (Sick Leave)',
      status: 'PENDING_APPROVAL',
      createdAt: '2026-10-28',
    });
    addToast('success', `ส่งใบลาของ ${emp.fullName} เรียบร้อยแล้ว`);
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
            <Palmtree className="w-7 h-7 text-[#0D9488]" />
            <span>การลาและวันหยุดประจำปี (Leave & Holiday Management)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารจัดการโควตาลาป่วย ลากิจ ลาพักร้อน ลาคลอด และลาประชุมวิชาการ พร้อมระบบระบุผู้ขึ้นเวรปฏิบัติงานแทน
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ยื่นใบลาอิเล็กทรอนิกส์ (e-Leave)</span>
        </button>
      </div>

      {/* Leave Quotas Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-[#64748B] block">สิทธิลาป่วย</span>
          <span className="text-lg font-extrabold text-[#14213D]">30 วัน/ปี</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-[#64748B] block">สิทธิลากิจธุระอันจำเป็น</span>
          <span className="text-lg font-extrabold text-[#14213D]">7 วัน/ปี</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-[#64748B] block">สิทธิลาพักร้อนสะสม</span>
          <span className="text-lg font-extrabold text-[#0D9488]">10 - 15 วัน/ปี</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-[#64748B] block">สิทธิลาคลอดบุตร</span>
          <span className="text-lg font-extrabold text-purple-600">98 วัน</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-[#64748B] block">ลาประชุมวิชาการ (CME)</span>
          <span className="text-lg font-extrabold text-blue-600">5 วัน/ปี</span>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขที่ใบลา</th>
                <th className="py-3.5 px-4">ผู้ยื่นลา / แผนก</th>
                <th className="py-3.5 px-4">ประเภทการลา</th>
                <th className="py-3.5 px-4">ช่วงวันที่ลา</th>
                <th className="py-3.5 px-4 text-center">จำนวนวัน</th>
                <th className="py-3.5 px-4">ผู้ปฏิบัติงานแทนในเวร</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การอนุมัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {leaves.map((lv) => (
                <tr key={lv.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{lv.leaveNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{lv.empName}</div>
                    <div className="text-[10px] text-[#64748B]">{lv.departmentName}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">
                    {lv.leaveType}
                    {lv.medicalCert && (
                      <span className="ml-1.5 text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                        แนบใบรับรองแพทย์
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#64748B]">
                    {lv.startDate} ถึง {lv.endDate}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">{lv.days} วัน</td>
                  <td className="py-3 px-4 font-medium text-[#0D9488]">{lv.substitutePerson}</td>
                  <td className="py-3 px-4 text-center">
                    {lv.status === 'PENDING_APPROVAL' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        รออนุมัติ
                      </span>
                    ) : lv.status === 'APPROVED' ? (
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
                    {lv.status === 'PENDING_APPROVAL' && (
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            updateLeaveStatus(lv.id, 'APPROVED');
                            addToast('success', `อนุมัติใบลา ${lv.leaveNo} เรียบร้อยแล้ว`);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => {
                            updateLeaveStatus(lv.id, 'REJECTED');
                            addToast('warning', `ปฏิเสธใบลา ${lv.leaveNo}`);
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
            <h3 className="font-extrabold text-base text-[#14213D]">ยื่นใบลาอิเล็กทรอนิกส์ (e-Leave Request)</h3>
            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">บุคลากรผู้ลา</label>
                <select value={empCode} onChange={(e) => setEmpCode(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  {employees.map((e) => (
                    <option key={e.id} value={e.empCode}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">ประเภทการลา</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  <option value="ลาป่วย (Sick Leave)">ลาป่วย (Sick Leave)</option>
                  <option value="ลากิจ (Personal Leave)">ลากิจ (Personal Leave)</option>
                  <option value="ลาพักร้อน (Annual Leave)">ลาพักร้อน (Annual Leave)</option>
                  <option value="ลาคลอด (Maternity Leave)">ลาคลอด (Maternity Leave)</option>
                  <option value="ลาฝึกอบรม/ประชุมวิชาการ">ลาฝึกอบรม/ประชุมวิชาการ</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">ตั้งแต่วันที่</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-2 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">ถึงวันที่</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-2 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">จำนวนวัน</label>
                  <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full px-2 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">ผู้ปฏิบัติงานแทนในเวร (Substitute Staff)</label>
                <input type="text" value={substitutePerson} onChange={(e) => setSubstitutePerson(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
              </div>
              <div>
                <label className="block font-bold mb-1">เหตุผลการลา</label>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="ระบุเหตุผลการลา..." className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">ส่งใบลา</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

