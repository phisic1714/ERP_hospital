'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function BudgetCommitmentsPage() {
  const commitments = [
    { docNo: 'PR-202610-001', date: '2026-10-28', budgetCode: 'BG-69-PHARM', dept: 'กลุ่มงานเภสัชกรรม', desc: 'ขออนุมัติจัดซื้อยาปฏิชีวนะและสารน้ำ IV ประจำไตรมาส', amount: 485000, stage: 'กันวงเงิน PR (Pre-Commitment)' },
    { docNo: 'PO-202610-012', date: '2026-10-27', budgetCode: 'BG-69-MED', dept: 'ห้องผ่าตัด OR', desc: 'ใบสั่งซื้อไหมเย็บแผลและเวชภัณฑ์ศัลยกรรมส่องกล้อง', amount: 320000, stage: 'ผูกพันสัญญา PO (Committed)' },
    { docNo: 'PO-202610-011', date: '2026-10-25', budgetCode: 'BG-69-LAB', dept: 'แผนกพยาธิวิทยา', desc: 'ใบสั่งซื้อน้ำยาตรวจวิเคราะห์ CBC และเคมีคลินิก', amount: 215000, stage: 'ตรวจรับแล้ว รอเบิกจ่าย AP' },
    { docNo: 'PAY-202610', date: '2026-10-28', budgetCode: 'BG-69-HR', dept: 'ฝ่ายทรัพยากรบุคคล', desc: 'งบค่าตอบแทนเวรบ่าย-ดึก และ OT บุคลากรทางการแพทย์ ต.ค. 69', amount: 725535, stage: 'ตัดจ่ายงบประมาณแล้ว (Actual)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
          <Link href="/budget" className="hover:underline">BUDGET MANAGEMENT</Link>
          <span>/</span>
          <span className="text-[#64748B]">COMMITMENTS</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
          <FileSpreadsheet className="w-7 h-7 text-[#059669]" />
          <span>ควบคุมภาระผูกพันงบประมาณ (Budget Encumbrance & Commitment Control)</span>
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          ติดตามการกันวงเงินงบประมาณตั้งแต่ขั้นตอนใบขอซื้อ (PR), ใบสั่งซื้อ (PO) จนถึงการเบิกจ่ายจริงเพื่อป้องกันการใช้งบเกินกรอบ
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขที่เอกสารอ้างอิง</th>
                <th className="py-3.5 px-4">วันที่ผูกพัน</th>
                <th className="py-3.5 px-4">รหัสงบประมาณ</th>
                <th className="py-3.5 px-4">รายการภาระผูกพัน</th>
                <th className="py-3.5 px-4 text-right">วงเงินผูกพัน (บาท)</th>
                <th className="py-3.5 px-4 text-center">สถานะวงเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {commitments.map((c) => (
                <tr key={c.docNo} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#059669]">{c.docNo}</td>
                  <td className="py-3 px-4 text-[#64748B]">{c.date}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#14213D]">{c.budgetCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{c.desc}</div>
                    <div className="text-[10px] text-[#64748B]">{c.dept}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#14213D]">
                    ฿{c.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#059669] border border-emerald-200">
                      {c.stage}
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

