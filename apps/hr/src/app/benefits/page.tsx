'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { HeartHandshake, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function HRBenefitsPage() {
  const { employees } = useHR();
  const { addToast } = useApp();

  const [claims, setClaims] = useState([
    { id: 'cl-1', docNo: 'BNF-2026-031', empName: 'พว. ศิริพร วงศ์สวัสดิ์', type: 'สวัสดิการทำฟันและทันตกรรม', amount: 2500, date: '2026-10-25', status: 'APPROVED' },
    { id: 'cl-2', docNo: 'BNF-2026-030', empName: 'ภก. ธนากร เจริญสุข', type: 'สวัสดิการตัดแว่นสายตาบุคลากร', amount: 3000, date: '2026-10-20', status: 'APPROVED' },
    { id: 'cl-3', docNo: 'BNF-2026-029', empName: 'ทนพ. ณัฐวุฒิ สายชล', type: 'ส่วนลดค่ารักษาพยาบาลครอบครัว (OPD/IPD)', amount: 4200, date: '2026-10-14', status: 'APPROVED' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [empName, setEmpName] = useState(employees[0]?.fullName || '');
  const [type, setType] = useState('สวัสดิการทำฟันและทันตกรรม');
  const [amount, setAmount] = useState(2000);

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setClaims((prev) => [
      {
        id: `cl-${Date.now()}`,
        docNo: `BNF-2026-0${prev.length + 32}`,
        empName,
        type,
        amount: Number(amount),
        date: '2026-10-28',
        status: 'APPROVED',
      },
      ...prev,
    ]);
    addToast('success', `บันทึกการเบิกสวัสดิการของ ${empName} เรียบร้อยแล้ว`);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">PAYROLL & BENEFITS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <HeartHandshake className="w-7 h-7 text-[#0D9488]" />
            <span>สวัสดิการ ประกันสังคม และสิทธิรักษาพยาบาล (Employee Benefits)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารสิทธิประกันสังคม (ม.33) กองทุนสำรองเลี้ยงชีพ (PVD) สิทธิรักษาพยาบาลพนักงานและครอบครัว วัคซีนประจำปี และตรวจสุขภาพ
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ยื่นเบิกสวัสดิการพนักงาน</span>
        </button>
      </div>

      {/* Benefits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-[#0D9488]">Medical Coverage</span>
          <h3 className="font-extrabold text-sm text-[#14213D]">สิทธิรักษาพยาบาลบุคลากรและครอบครัว</h3>
          <p className="text-[#64748B]">พนักงานเบิกค่ารักษาใน รพ. ฟรี 100% • บิดา/มารดา/คู่สมรส/บุตร ส่วนลด 50%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-blue-600">Social Security & PVD</span>
          <h3 className="font-extrabold text-sm text-[#14213D]">ประกันสังคม ม.33 & กองทุนสำรองเลี้ยงชีพ</h3>
          <p className="text-[#64748B]">สมทบประกันสังคม 5% (สูงสุด 750 บ.) • กองทุนสำรองเลี้ยงชีพสมทบ 5% - 10%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-purple-600">Health & Wellness</span>
          <h3 className="font-extrabold text-sm text-[#14213D]">ตรวจสุขภาพประจำปี & วัคซีนบุคลากรด่านหน้า</h3>
          <p className="text-[#64748B]">ตรวจสุขภาพตามความเสี่ยง 100% • วัคซีนไข้หวัดใหญ่และไวรัสตับอักเสบบีฟรี</p>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] font-extrabold text-xs text-[#14213D]">
          ประวัติการเบิกจ่ายสวัสดิการล่าสุด (Recent Benefit Claims)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3 px-4">เลขที่เอกสาร</th>
                <th className="py-3 px-4">วันที่เบิก</th>
                <th className="py-3 px-4">ชื่อบุคลากร</th>
                <th className="py-3 px-4">ประเภทสวัสดิการ</th>
                <th className="py-3 px-4 text-right">จำนวนเงิน (บาท)</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{c.docNo}</td>
                  <td className="py-3 px-4 text-[#64748B]">{c.date}</td>
                  <td className="py-3 px-4 font-bold text-[#14213D]">{c.empName}</td>
                  <td className="py-3 px-4 text-[#14213D]">{c.type}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-700">฿{c.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      อนุมัติจ่ายแล้ว
                    </span>
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
            <h3 className="font-extrabold text-base text-[#14213D]">ยื่นเบิกสวัสดิการพนักงาน</h3>
            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">บุคลากร</label>
                <select value={empName} onChange={(e) => setEmpName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  {employees.map((e) => (
                    <option key={e.id} value={e.fullName}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">ประเภทสวัสดิการ</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  <option value="สวัสดิการทำฟันและทันตกรรม">สวัสดิการทำฟันและทันตกรรม</option>
                  <option value="สวัสดิการตัดแว่นสายตาบุคลากร">สวัสดิการตัดแว่นสายตาบุคลากร</option>
                  <option value="ส่วนลดค่ารักษาพยาบาลครอบครัว (OPD/IPD)">ส่วนลดค่ารักษาพยาบาลครอบครัว (OPD/IPD)</option>
                  <option value="เงินช่วยเหลือมงคลสมรส / คลอดบุตร">เงินช่วยเหลือมงคลสมรส / คลอดบุตร</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">จำนวนเงินที่ขอเบิก (บาท)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">บันทึกเบิกสวัสดิการ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

