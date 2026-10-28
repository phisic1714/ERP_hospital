import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  let bg = 'bg-slate-50 text-[#64748B] border-[#E2EAF4]';
  let dotColor = 'bg-[#94A3B8]';
  let label = status;

  switch (status) {
    case 'POSTED':
    case 'FULLY_RECEIVED':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'NORMAL':
    case 'GOOD':
      bg = 'bg-emerald-50 text-[#059669] border-emerald-200';
      dotColor = 'bg-[#10B981]';
      label =
        status === 'POSTED'
          ? 'บันทึกเข้าสต็อกแล้ว'
          : status === 'FULLY_RECEIVED'
          ? 'รับของครบแล้ว'
          : status === 'COMPLETED'
          ? 'เสร็จสิ้น'
          : status === 'NORMAL'
          ? 'ปกติ'
          : status === 'ACTIVE'
          ? 'ใช้งานปกติ'
          : 'สมบูรณ์';
      break;
    case 'APPROVED':
      bg = 'bg-blue-50 text-[#2563EB] border-blue-200';
      dotColor = 'bg-[#2563EB]';
      label = 'อนุมัติแล้ว';
      break;
    case 'ORDERED':
      bg = 'bg-indigo-50 text-[#4F46E5] border-indigo-200';
      dotColor = 'bg-[#6366F1]';
      label = 'สั่งซื้อแล้ว (ส่งผู้ขาย)';
      break;
    case 'CONVERTED_TO_PO':
    case 'PO_CREATED':
      bg = 'bg-purple-50 text-[#7C3AED] border-purple-200';
      dotColor = 'bg-[#8B5CF6]';
      label = 'เปิด PO แล้ว';
      break;
    case 'RETURNED':
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      dotColor = 'bg-amber-600';
      label = 'ส่งกลับแก้ไข (Revision)';
      break;
    case 'SENT':
      bg = 'bg-sky-50 text-[#0284C7] border-sky-200';
      dotColor = 'bg-[#0EA5E9]';
      label = 'ส่งขอราคาแล้ว';
      break;
    case 'QUOTING':
      bg = 'bg-amber-50 text-[#D97706] border-amber-200';
      dotColor = 'bg-[#F59E0B]';
      label = 'กำลังรับใบเสนอราคา';
      break;
    case 'AWARDED':
    case 'SELECTED':
      bg = 'bg-emerald-50 text-[#059669] border-emerald-200';
      dotColor = 'bg-[#10B981]';
      label = status === 'AWARDED' ? 'คัดเลือกผู้ชนะแล้ว' : 'ได้รับคัดเลือก';
      break;
    case 'NOT_SELECTED':
      bg = 'bg-slate-100 text-slate-500 border-slate-200';
      dotColor = 'bg-slate-400';
      label = 'ไม่ได้รับคัดเลือก';
      break;
    case 'PENDING_APPROVAL':
    case 'PENDING_DEPT_APPROVAL':
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'COUNTED':
      bg = 'bg-amber-50 text-[#D97706] border-amber-200';
      dotColor = 'bg-[#F59E0B]';
      label =
        status === 'COUNTED'
          ? 'นับเสร็จรอปิด'
          : status === 'IN_PROGRESS'
          ? 'กำลังตรวจนับ'
          : 'รออนุมัติ';
      break;
    case 'IN_TRANSIT':
      bg = 'bg-indigo-50 text-[#6366F1] border-indigo-200';
      dotColor = 'bg-[#6366F1]';
      label = 'กำลังขนส่ง (In Transit)';
      break;
    case 'PENDING_INSPECT':
    case 'PENDING_INSPECTION':
    case 'INSPECTION':
      bg = 'bg-cyan-50 text-[#0891B2] border-cyan-200';
      dotColor = 'bg-[#06B6D4]';
      label = 'รอตรวจสภาพ (Inspection)';
      break;
    case 'PARTIALLY_RECEIVED':
    case 'PARTIALLY_ISSUED':
    case 'PARTIAL':
      bg = 'bg-sky-50 text-[#0284C7] border-sky-200';
      dotColor = 'bg-[#0EA5E9]';
      label = status === 'PARTIALLY_RECEIVED' ? 'รับของบางส่วน' : 'รับ/จ่ายบางส่วน';
      break;
    case 'LOW_STOCK':
      bg = 'bg-orange-50 text-[#EA580C] border-orange-200';
      dotColor = 'bg-[#F97316]';
      label = 'สินค้าใกล้หมด (Low)';
      break;
    case 'OUT_OF_STOCK':
    case 'REJECTED':
    case 'CANCELLED':
    case 'DAMAGED':
    case 'REVERSED':
      bg = 'bg-rose-50 text-[#E11D48] border-rose-200';
      dotColor = 'bg-[#EF4444]';
      label =
        status === 'OUT_OF_STOCK'
          ? 'สินค้าหมดคลัง'
          : status === 'REJECTED'
          ? 'ปฏิเสธ / ไม่อนุมัติ'
          : status === 'REVERSED'
          ? 'ยกเลิกการตัดรับ (Reversed)'
          : status === 'DAMAGED'
          ? 'ชำรุด'
          : 'ยกเลิก';
      break;
    case 'CLOSED':
      bg = 'bg-slate-100 text-slate-700 border-slate-300';
      dotColor = 'bg-slate-500';
      label = 'ปิดสมบูรณ์ (Closed)';
      break;
    case 'EXPIRED':
      bg = 'bg-red-50 text-[#DC2626] border-red-200 font-bold';
      dotColor = 'bg-[#DC2626]';
      label = 'หมดอายุแล้ว';
      break;
    case 'QUARANTINE':
      bg = 'bg-purple-50 text-[#7C3AED] border-purple-200';
      dotColor = 'bg-[#8B5CF6]';
      label = 'กักกัน (Quarantine)';
      break;
    case 'DRAFT':
      bg = 'bg-slate-50 text-[#64748B] border-[#E2EAF4]';
      dotColor = 'bg-[#94A3B8]';
      label = 'ฉบับร่าง (Draft)';
      break;
    default:
      label = status;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
