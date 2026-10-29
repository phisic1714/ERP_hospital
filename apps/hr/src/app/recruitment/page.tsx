'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR, HRRecruitment } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { UserPlus, Plus, Eye, ShieldCheck, Calendar, X } from 'lucide-react';

export default function HRRecruitmentPage() {
  const { recruitments, addRecruitment } = useHR();
  const { addToast } = useApp();

  const [selectedJob, setSelectedJob] = useState<HRRecruitment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [positionTitle, setPositionTitle] = useState('');
  const [departmentName, setDepartmentName] = useState('หอผู้ป่วยวิกฤต (ICU)');
  const [headcountRequested, setHeadcountRequested] = useState(2);
  const [salaryRange, setSalaryRange] = useState('35,000 - 48,000 บาท');
  const [qualification, setQualification] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addRecruitment({
      reqNo: `MRF-2026-00${recruitments.length + 1}`,
      positionTitle,
      departmentName,
      staffCategory: 'พยาบาล (Nurse)',
      employmentType: 'พนักงานประจำ',
      headcountRequested: Number(headcountRequested),
      headcountFilled: 0,
      urgency: 'URGENT',
      status: 'OPEN',
      postedDate: '2026-10-28',
      applicantsCount: 0,
      salaryRange,
      qualification: qualification || 'มีใบประกอบวิชาชีพตามมาตรฐานวิชาชีพโรงพยาบาล',
      applicants: [],
    });
    addToast('success', `เปิดประกาศรับสมัครตำแหน่ง ${positionTitle} เรียบร้อยแล้ว`);
    setShowAddModal(false);
    setPositionTitle('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">DEVELOPMENT & EVALUATION</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <UserPlus className="w-7 h-7 text-[#0D9488]" />
            <span>สรรหาและคัดเลือกบุคลากร (Recruitment & Applicant Tracking)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารใบขออัตรากำลัง (MRF) ประกาศรับสมัครงาน คัดกรองใบสมัคร ตารางสัมภาษณ์ และตรวจสอบใบประกอบวิชาชีพก่อนรับเข้าทำงาน
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เปิดประกาศรับสมัครงานใหม่ (New MRF)</span>
        </button>
      </div>

      {/* Recruitment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recruitments.map((rec) => (
          <div
            key={rec.id}
            onClick={() => setSelectedJob(rec)}
            className="bg-white p-5 rounded-3xl border border-[#E2EAF4] shadow-xs hover:border-[#0D9488] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#0D9488] bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {rec.reqNo}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    rec.urgency === 'URGENT'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {rec.urgency === 'URGENT' ? 'อัตราเร่งด่วน' : 'ตามแผนประจำปี'}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-[#14213D] mt-2.5 group-hover:text-[#0D9488] transition-colors">
                {rec.positionTitle}
              </h3>
              <p className="text-xs text-[#64748B] mt-1">{rec.departmentName}</p>

              <div className="mt-3 pt-3 border-t border-[#E2EAF4] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">อัตรากำลังที่ต้องการ:</span>
                  <span className="font-bold text-[#14213D]">
                    รับแล้ว {rec.headcountFilled} / {rec.headcountRequested} อัตรา
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">ผู้สมัครทั้งหมด:</span>
                  <span className="font-bold text-[#0D9488]">{rec.applicantsCount} คน</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">ช่วงอัตราเงินเดือน:</span>
                  <span className="font-semibold text-emerald-700">{rec.salaryRange}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2EAF4] flex items-center justify-between text-xs font-bold text-[#0D9488]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>ดูรายชื่อผู้สมัครและผลสัมภาษณ์</span>
              </span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Applicant Tracking Detail */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-3xl w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
              <div>
                <span className="font-mono font-bold text-[#0D9488]">{selectedJob.reqNo}</span>
                <h3 className="text-base font-extrabold text-[#14213D] mt-0.5">{selectedJob.positionTitle}</h3>
                <p className="text-[#64748B]">{selectedJob.qualification}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="font-bold text-[#14213D]">รายชื่อผู้สมัครและสถานะการสัมภาษณ์ ({selectedJob.applicants.length} ราย)</div>

            <div className="overflow-x-auto rounded-2xl border border-[#E2EAF4]">
              <table className="w-full text-left">
                <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">ชื่อผู้สมัคร</th>
                    <th className="py-2.5 px-3">วุฒิ / ใบประกอบฯ</th>
                    <th className="py-2.5 px-3">วันนัดสัมภาษณ์</th>
                    <th className="py-2.5 px-3 text-center">คะแนน</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAF4]">
                  {selectedJob.applicants.map((app) => (
                    <tr key={app.id}>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#14213D]">{app.name}</div>
                        <div className="text-[10px] text-[#64748B]">{app.phone}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div>{app.education}</div>
                        {app.licenseNo && <div className="text-[#0D9488] font-mono">ใบอนุญาต: {app.licenseNo}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">{app.interviewDate || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-extrabold text-[#0D9488]">{app.score || '-'}/100</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#0D9488] border border-teal-200">
                          {app.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  addToast('success', 'ส่งหนังสือเสนองาน (Offer Letter) ให้ผู้ผ่านการคัดเลือกแล้ว');
                  setSelectedJob(null);
                }}
                className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl"
              >
                อนุมัติรับเข้าทำงาน (Issue Offer)
              </button>
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2 border rounded-xl">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#14213D]">เปิดประกาศรับสมัครงานใหม่ (New MRF)</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">ชื่อตำแหน่งที่ต้องการรับสมัคร *</label>
                <input type="text" value={positionTitle} onChange={(e) => setPositionTitle(e.target.value)} placeholder="เช่น พยาบาลวิชาชีพห้องผ่าตัด (OR RN)" className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
              </div>
              <div>
                <label className="block font-bold mb-1">แผนกต้นสังกัด</label>
                <input type="text" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">จำนวนอัตรา</label>
                  <input type="number" value={headcountRequested} onChange={(e) => setHeadcountRequested(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">กรอบเงินเดือน</label>
                  <input type="text" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">คุณสมบัติเฉพาะตำแหน่ง</label>
                <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="เช่น มีใบประกอบวิชาชีพ..." className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">ประกาศรับสมัคร</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

