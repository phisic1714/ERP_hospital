'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { FileCheck2, CheckCircle2, ArrowLeftRight, Timer, Palmtree } from 'lucide-react';

export default function HRApprovalsPage() {
  const { swaps, updateSwapStatus, otRequests, updateOTStatus, leaves, updateLeaveStatus } = useHR();
  const { addToast } = useApp();

  const pendingSwaps = swaps.filter((s) => s.status === 'PENDING_APPROVAL');
  const pendingOTs = otRequests.filter((o) => o.status === 'PENDING_APPROVAL');
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
          <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
          <span>/</span>
          <span className="text-[#64748B]">REPORTS & SETTINGS</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <FileCheck2 className="w-7 h-7 text-[#0D9488]" />
          <span>ศูนย์อนุมัติงานทรัพยากรบุคคล (HR Approval Center)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          รวมรายการคำขอสลับเวร ขออนุมัติทำงานล่วงเวลา (OT) และใบลาที่รอหัวหน้าหอผู้ป่วย/ฝ่ายบุคคลอนุมัติ
        </p>
      </div>

      {/* 1. Pending Leaves */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] font-extrabold text-xs text-[#14213D] flex items-center gap-2">
          <Palmtree className="w-4 h-4 text-[#0D9488]" />
          <span>1. ใบลารออนุมัติ ({pendingLeaves.length} รายการ)</span>
        </div>
        <div className="p-4 space-y-2.5 text-xs">
          {pendingLeaves.map((lv) => (
            <div key={lv.id} className="p-3.5 rounded-2xl border border-[#E2EAF4] flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-[#14213D]">{lv.leaveNo} • {lv.empName} ({lv.leaveType})</div>
                <div className="text-[#64748B]">วันที่ลา: {lv.startDate} ถึง {lv.endDate} ({lv.days} วัน) • ผู้แทนเวร: {lv.substitutePerson}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    updateLeaveStatus(lv.id, 'APPROVED');
                    addToast('success', `อนุมัติใบลา ${lv.leaveNo} แล้ว`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  อนุมัติใบลา
                </button>
                <button
                  onClick={() => {
                    updateLeaveStatus(lv.id, 'REJECTED');
                    addToast('warning', `ปฏิเสธใบลา ${lv.leaveNo}`);
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))}
          {pendingLeaves.length === 0 && <div className="text-center py-4 text-[#94A3B8]">ไม่มีใบลารออนุมัติ</div>}
        </div>
      </div>

      {/* 2. Pending OTs */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] font-extrabold text-xs text-[#14213D] flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#0D9488]" />
          <span>2. คำขอทำงานล่วงเวลา OT รออนุมัติ ({pendingOTs.length} รายการ)</span>
        </div>
        <div className="p-4 space-y-2.5 text-xs">
          {pendingOTs.map((ot) => (
            <div key={ot.id} className="p-3.5 rounded-2xl border border-[#E2EAF4] flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-[#14213D]">{ot.otNo} • {ot.empName} ({ot.otType})</div>
                <div className="text-[#64748B]">วันที่ {ot.date} จำนวน {ot.hours} ชม. (฿{ot.totalAmount.toLocaleString()}) • {ot.reason}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    updateOTStatus(ot.id, 'APPROVED');
                    addToast('success', `อนุมัติ OT ${ot.otNo} แล้ว`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  อนุมัติ OT
                </button>
                <button
                  onClick={() => {
                    updateOTStatus(ot.id, 'REJECTED');
                    addToast('warning', `ปฏิเสธ OT ${ot.otNo}`);
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))}
          {pendingOTs.length === 0 && <div className="text-center py-4 text-[#94A3B8]">ไม่มีคำขอ OT รออนุมัติ</div>}
        </div>
      </div>

      {/* 3. Pending Shift Swaps */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] font-extrabold text-xs text-[#14213D] flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-[#0D9488]" />
          <span>3. คำขอสลับเวรและแลกเวรรออนุมัติ ({pendingSwaps.length} รายการ)</span>
        </div>
        <div className="p-4 space-y-2.5 text-xs">
          {pendingSwaps.map((sw) => (
            <div key={sw.id} className="p-3.5 rounded-2xl border border-[#E2EAF4] flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-[#14213D]">{sw.swapNo} • {sw.requesterName} ขอสลับเวรกับ {sw.targetName}</div>
                <div className="text-[#64748B]">จาก {sw.fromDate} ({sw.fromShift}) ↔ {sw.toDate} ({sw.toShift}) • {sw.reason}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    updateSwapStatus(sw.id, 'APPROVED');
                    addToast('success', `อนุมัติสลับเวร ${sw.swapNo} แล้ว`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  อนุมัติสลับเวร
                </button>
                <button
                  onClick={() => {
                    updateSwapStatus(sw.id, 'REJECTED');
                    addToast('warning', `ปฏิเสธสลับเวร ${sw.swapNo}`);
                  }}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold"
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          ))}
          {pendingSwaps.length === 0 && <div className="text-center py-4 text-[#94A3B8]">ไม่มีคำขอสลับเวรรออนุมัติ</div>}
        </div>
      </div>
    </div>
  );
}

