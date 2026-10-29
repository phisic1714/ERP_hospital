'use client';

import React, { useState } from 'react';
import {
  Settings,
  Calendar,
  Layers,
  Building2,
  FolderKanban,
  Landmark,
  Users,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';

export default function BudgetSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'FISCAL_YEAR' | 'CATEGORIES' | 'DEPARTMENTS' | 'PROJECTS' | 'FUND_SOURCES' | 'WORKFLOW'
  >('FISCAL_YEAR');
  const [savedNotice, setSavedNotice] = useState(false);

  const triggerSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
            <Settings className="w-3.5 h-3.5" />
            MOD-007 • BUDGET SYSTEM CONFIGURATION
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            07. ตั้งค่าระบบบริหารงบประมาณ (Budget Settings)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดปีงบประมาณ หมวดหมู่งบประมาณ หน่วยงาน โครงการ แหล่งที่มาของเงิน สิทธิ์ผู้ใช้งาน และสายอนุมัติ
          </p>
        </div>

        <button
          onClick={triggerSave}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
        >
          บันทึกการตั้งค่าระบบ
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          บันทึกการตั้งค่าระบบบริหารงบประมาณเรียบร้อยแล้ว
        </div>
      )}

      {/* Settings Tabs matching Sitemap 07 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-2">
          {[
            { id: 'FISCAL_YEAR', label: 'ปีงบประมาณ', icon: Calendar },
            { id: 'CATEGORIES', label: 'หมวดหมู่งบประมาณ', icon: Layers },
            { id: 'DEPARTMENTS', label: 'หน่วยงาน / แผนก', icon: Building2 },
            { id: 'PROJECTS', label: 'โครงการและกิจกรรม', icon: FolderKanban },
            { id: 'FUND_SOURCES', label: 'แหล่งที่มาของงบประมาณ', icon: Landmark },
            { id: 'WORKFLOW', label: 'ผู้ใช้งานและขั้นตอนอนุมัติ', icon: GitPullRequest },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === item.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 text-xs">
          {activeTab === 'FISCAL_YEAR' && (
            <div className="space-y-3">
              {[
                {
                  year: '2569',
                  period: '1 ตุลาคม 2568 – 30 กันยายน 2569',
                  cap: '฿50,000,000',
                  status: 'ACTIVE (ปีงบประมาณปัจจุบัน)',
                },
                {
                  year: '2570',
                  period: '1 ตุลาคม 2569 – 30 กันยายน 2570',
                  cap: '฿55,000,000 (กรอบร่าง)',
                  status: 'PLANNING (เปิดรับคำของบ)',
                },
                {
                  year: '2568',
                  period: '1 ตุลาคม 2567 – 30 กันยายน 2568',
                  cap: '฿46,500,000',
                  status: 'CLOSED (ปิดปีงบประมาณแล้ว)',
                },
              ].map((fy) => (
                <div
                  key={fy.year}
                  className="p-4 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">
                      ปีงบประมาณ พ.ศ. {fy.year}
                    </span>
                    <p className="text-slate-500 mt-0.5">ช่วงเวลา: {fy.period}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">กรอบวงเงิน: {fy.cap}</div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {fy.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'CATEGORIES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { code: 'CAT-01', name: 'งบบุคลากร (Personnel)', desc: 'เงินเดือน ค่าตอบแทน ค่าเวร OT' },
                {
                  code: 'CAT-02',
                  name: 'งบดำเนินงาน - ยาและเวชภัณฑ์ (Medical Supplies)',
                  desc: 'ยา สารน้ำ เวชภัณฑ์มิใช่ยา น้ำยาชันสูตร',
                },
                {
                  code: 'CAT-03',
                  name: 'งบลงทุน - ครุภัณฑ์การแพทย์ (Capital Medical Equipment)',
                  desc: 'เครื่องมือแพทย์ ครุภัณฑ์ผ่าตัด และระบบ IT โรงพยาบาล',
                },
                {
                  code: 'CAT-04',
                  name: 'งบสาธารณูปโภคและซ่อมบำรุง (Facility & Maintenance)',
                  desc: 'ค่าไฟฟ้า ประปา ก๊าซทางการแพทย์ และบำรุงรักษาอาคาร',
                },
                {
                  code: 'CAT-05',
                  name: 'งบพัฒนาวิชาชีพและวิจัย (Training & R&D)',
                  desc: 'ฝึกอบรมวิชาชีพ มาตรฐาน HA และงานวิจัยคลินิก',
                },
              ].map((c) => (
                <div key={c.code} className="p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-700">{c.code}</span>
                  <div className="font-bold text-slate-900 mt-0.5">{c.name}</div>
                  <p className="text-slate-500 mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'DEPARTMENTS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { code: 'PHARM', name: 'กลุ่มงานเภสัชกรรม (Pharmacy)', head: 'ภญ.สุภาวดี มีสุข' },
                { code: 'OR', name: 'กลุ่มงานศัลยกรรมและห้องผ่าตัด (OR & ICU)', head: 'นพ.ธีรพงศ์ วรเวช' },
                { code: 'LAB', name: 'แผนกพยาธิวิทยาและชันสูตร (Central Lab)', head: 'ทนพญ.กมลชนก ใจดี' },
                { code: 'FAC', name: 'ฝ่ายบริหารทั่วไปและซ่อมบำรุง (Facility)', head: 'คุณสมชาย สายช่าง' },
                { code: 'HRD', name: 'กลุ่มงานทรัพยากรบุคคลและพัฒนาคุณภาพ (HR & HA)', head: 'คุณกานดา วงศ์สวัสดิ์' },
              ].map((d) => (
                <div key={d.code} className="p-4 rounded-xl border border-slate-200 flex justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700">รหัสหน่วยรับงบ: {d.code}</span>
                    <div className="font-bold text-slate-900 mt-0.5">{d.name}</div>
                    <p className="text-slate-500 mt-0.5">ผู้รับผิดชอบงบ: {d.head}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'PROJECTS' && (
            <div className="space-y-3">
              {[
                'โครงการจัดหายาจำเป็นและเวชภัณฑ์ปลอดเชื้อตามเกณฑ์ FEFO',
                'โครงการจัดซื้อเครื่องช่วยหายใจวิกฤตและชุดผ่าตัดส่องกล้อง',
                'โครงการจัดหาน้ำยาตรวจวิเคราะห์โลหิตวิทยาและเคมีคลินิก',
                'โครงการบำรุงรักษาระบบก๊าซทางการแพทย์ ระบบปรับอากาศความดันลบ และสาธารณูปโภค',
                'โครงการพัฒนาศักยภาพบุคลากรทางการแพทย์และต่ออายุมาตรฐาน HA',
              ].map((proj, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 font-semibold text-slate-800">
                  PRJ-2569-0{idx + 1} • {proj}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'FUND_SOURCES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'เงินงบประมาณแผ่นดิน', ratio: '25% ของงบรวม' },
                { name: 'เงินบำรุงโรงพยาบาล (รายรับค่ารักษา)', ratio: '50% ของงบรวม' },
                { name: 'เงินกองทุน สปสช. / ประกันสังคม', ratio: '20% ของงบรวม' },
                { name: 'เงินบริจาคเพื่อการกุศล', ratio: '5% ของงบรวม' },
              ].map((f) => (
                <div key={f.name} className="p-4 rounded-xl border border-slate-200 flex justify-between">
                  <span className="font-bold text-slate-900">{f.name}</span>
                  <span className="text-emerald-700 font-bold">{f.ratio}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'WORKFLOW' && (
            <div className="space-y-3">
              {[
                {
                  level: 'ระดับที่ 1: หัวหน้ากลุ่มงาน / หัวหน้าแผนก',
                  rule: 'อนุมัติคำขอใช้งบ (PR) ไม่เกิน 100,000 บาท และเสนอคำขอโอนงบภายในแผนก',
                },
                {
                  level: 'ระดับที่ 2: เจ้าหน้าที่วิเคราะห์งบประมาณ (Budget Controller)',
                  rule: 'ตรวจสอบรหัสงบ ตรวจสอบวงเงินคงเหลือ และกลั่นกรองคำขอจัดสรร/โอนงบ',
                },
                {
                  level: 'ระดับที่ 3: รองผู้อำนวยการฝ่ายบริหาร / คณะกรรมการบริหารงบประมาณ',
                  rule: 'อนุมัติโอนงบระหว่างหน่วยงานไม่เกิน 2,000,000 บาท',
                },
                {
                  level: 'ระดับที่ 4: ผู้อำนวยการโรงพยาบาล',
                  rule: 'อนุมัติแผนงบประมาณประจำปี จัดสรรงบรายไตรมาส และอนุมัติเพิ่ม/ลดกรอบงบประมาณ',
                },
              ].map((wf) => (
                <div key={wf.level} className="p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-900">{wf.level}</div>
                  <p className="text-slate-600 mt-1">{wf.rule}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

