'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { GraduationCap, Plus, Award, Calendar, Users } from 'lucide-react';

export default function HRTrainingPage() {
  const { trainings, addTraining } = useHR();
  const { addToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'บังคับตามมาตรฐาน HA / JCI' | 'พัฒนาทักษะทางคลินิก (Clinical)' | 'ช่วยชีวิตขั้นสูง (BLS / ACLS)' | 'บริหารจัดการและผู้นำ' | 'ความปลอดภัยและอาชีวอนามัย (IC / ENV)'>('พัฒนาทักษะทางคลินิก (Clinical)');
  const [instructor, setInstructor] = useState('');
  const [hours, setHours] = useState(6);
  const [cmePoints, setCmePoints] = useState(10);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addTraining({
      courseCode: `TRN-2026-0${trainings.length + 13}`,
      title,
      category,
      instructor: instructor || 'คณะกรรมการวิชาการโรงพยาบาล',
      date: '2026-11-20',
      hours: Number(hours),
      cmePoints: Number(cmePoints),
      seatsTotal: 50,
      seatsEnrolled: 12,
      location: 'ห้องประชุมวิชาการ ชั้น 9',
      status: 'UPCOMING',
    });
    addToast('success', `สร้างหลักสูตรฝึกอบรม "${title}" เรียบร้อยแล้ว`);
    setShowModal(false);
    setTitle('');
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
            <GraduationCap className="w-7 h-7 text-[#0D9488]" />
            <span>ฝึกอบรมและพัฒนาวิชาชีพต่อเนื่อง (Training & CME / CNEU Credits)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารจัดการหลักสูตรอบรมภายใน-ภายนอก ประวัติการฝึกอบรม และสะสมหน่วยกิตวิชาชีพ (CME / CNEU / CPE)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เปิดหลักสูตรฝึกอบรมใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {trainings.map((tr) => (
          <div key={tr.id} className="bg-white p-5 rounded-3xl border border-[#E2EAF4] shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#0D9488] bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {tr.courseCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  +{tr.cmePoints} หน่วยกิต CME/CNEU
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-[#14213D] mt-2">{tr.title}</h3>
              <p className="text-xs text-[#0D9488] font-semibold mt-1">{tr.category}</p>

              <div className="mt-3 pt-3 border-t border-[#E2EAF4] space-y-1.5 text-xs text-[#64748B]">
                <div>วิทยากร: <strong className="text-[#14213D]">{tr.instructor}</strong></div>
                <div>วันที่อบรม: <strong>{tr.date}</strong> ({tr.hours} ชั่วโมงพัฒนาวิชาชีพ)</div>
                <div>สถานที่: {tr.location}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2EAF4] flex items-center justify-between text-xs">
              <span className="font-bold text-[#14213D]">
                ผู้ลงทะเบียน: {tr.seatsEnrolled}/{tr.seatsTotal} คน
              </span>
              <button
                onClick={() => addToast('info', `บันทึกการลงทะเบียนเข้าอบรมหลักสูตร ${tr.courseCode}`)}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0D9488] font-bold rounded-xl"
              >
                ส่งบุคลากรเข้าอบรม
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#14213D]">เปิดหลักสูตรฝึกอบรมใหม่</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">ชื่อหลักสูตรอบรม *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น การช่วยฟื้นคืนชีพขั้นสูง ACLS" className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
              </div>
              <div>
                <label className="block font-bold mb-1">หมวดหมู่หลักสูตร</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  <option value="บังคับตามมาตรฐาน HA / JCI">บังคับตามมาตรฐาน HA / JCI</option>
                  <option value="พัฒนาทักษะทางคลินิก (Clinical)">พัฒนาทักษะทางคลินิก (Clinical)</option>
                  <option value="ช่วยชีวิตขั้นสูง (BLS / ACLS)">ช่วยชีวิตขั้นสูง (BLS / ACLS)</option>
                  <option value="ความปลอดภัยและอาชีวอนามัย (IC / ENV)">ความปลอดภัยและอาชีวอนามัย (IC / ENV)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">วิทยากร</label>
                <input type="text" value={instructor} onChange={(e) => setInstructor(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">จำนวนชั่วโมง</label>
                  <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
                <div>
                  <label className="block font-bold mb-1">หน่วยกิต CME/CNEU</label>
                  <input type="number" value={cmePoints} onChange={(e) => setCmePoints(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">บันทึกหลักสูตร</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

