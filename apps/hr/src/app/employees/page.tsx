'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR, HREmployee } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Eye,
  Printer,
  Copy,
  X,
  Briefcase,
  GraduationCap,
  Wallet,
  Calendar,
} from 'lucide-react';

export default function HREmployeesPage() {
  const { employees, addEmployee } = useHR();
  const { addToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmpModal, setSelectedEmpModal] = useState<HREmployee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form state
  const [empCode, setEmpCode] = useState(`EMP-6700${employees.length + 1}`);
  const [title, setTitle] = useState('พว.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [departmentName, setDepartmentName] = useState('หอผู้ป่วยวิกฤต (ICU)');
  const [staffCategory, setStaffCategory] = useState<HREmployee['staffCategory']>('พยาบาล (Nurse)');
  const [employmentType, setEmploymentType] = useState<HREmployee['employmentType']>('พนักงานประจำ');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [baseSalary, setBaseSalary] = useState(35000);
  const [education, setEducation] = useState('');

  const filtered = employees.filter((e) => {
    const matchSearch =
      !search ||
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.empCode.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      (e.licenseNo && e.licenseNo.toLowerCase().includes(search.toLowerCase()));
    const matchCat = !selectedCategory || e.staffCategory === selectedCategory;
    const matchDept = !selectedDept || e.departmentName === selectedDept;
    return matchSearch && matchCat && matchDept;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
      empCode,
      title,
      firstName,
      lastName,
      fullName: `${title} ${firstName} ${lastName}`,
      gender: title === 'นพ.' || title === 'ภก.' || title === 'ทนพ.' || title === 'นาย' ? 'ชาย' : 'หญิง',
      birthDate: '1995-01-01',
      idCard: '1-1005-00999-11-2',
      phone: phone || '081-000-0000',
      email: email || 'staff@hospital.org',
      departmentCode: 'MED',
      departmentName,
      position,
      staffCategory,
      employmentType,
      hireDate: new Date().toISOString().slice(0, 10),
      probationEndDate: '2027-02-28',
      status: 'ACTIVE',
      baseSalary: Number(baseSalary),
      positionAllowance: 5000,
      licenseAllowance: licenseNo ? 6000 : 0,
      bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
      bankAccount: '401-2-99881-0',
      taxId: '1100500999112',
      socialSecurityStatus: 'ขึ้นทะเบียน ม.33',
      licenseNo: licenseNo || undefined,
      licenseType: licenseNo ? 'ใบประกอบวิชาชีพทางการแพทย์/การพยาบาล' : undefined,
      licenseExpiry: licenseNo ? '2029-12-31' : undefined,
      education: education || 'ปริญญาตรี สายวิทยาศาสตร์สุขภาพ',
      bloodGroup: 'O',
      emergencyContact: 'ผู้ติดต่อฉุกเฉิน (089-999-9999)',
    });
    addToast('success', `ขึ้นทะเบียนบุคลากร ${title} ${firstName} ${lastName} เรียบร้อยแล้ว`);
    setShowAddModal(false);
    setFirstName('');
    setLastName('');
    setPosition('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">
              HUMAN RESOURCE
            </Link>
            <span>/</span>
            <span className="text-[#64748B]">EMPLOYEE MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#0D9488]" />
            <span>ทะเบียนบุคลากรโรงพยาบาล (Employee Directory)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            บริหารจัดการประวัติพนักงาน รหัสพนักงาน ตำแหน่ง แผนก ประเภทการจ้าง และเลขที่ใบประกอบวิชาชีพ
          </p>
        </div>

        <button
          onClick={() => {
            setEmpCode(`EMP-6700${employees.length + 1}`);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ขึ้นทะเบียนบุคลากรใหม่</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ-สกุล, รหัสพนักงาน (EMP), ตำแหน่ง หรือเลขใบประกอบวิชาชีพ..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-xl focus:outline-none focus:border-[#0D9488]"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-xl text-[#14213D] font-semibold focus:outline-none"
        >
          <option value="">ทุกกลุ่มสายวิชาชีพ (All Categories)</option>
          <option value="แพทย์ (Physician)">แพทย์ (Physician)</option>
          <option value="พยาบาล (Nurse)">พยาบาล (Nurse)</option>
          <option value="เภสัชกร (Pharmacist)">เภสัชกร (Pharmacist)</option>
          <option value="สหวิชาชีพ (Allied Health)">สหวิชาชีพ (Allied Health)</option>
          <option value="สายสนับสนุน (Support)">สายสนับสนุน (Support)</option>
        </select>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-xl text-[#14213D] font-semibold focus:outline-none"
        >
          <option value="">ทุกแผนก/หอผู้ป่วย (All Departments)</option>
          {Array.from(new Set(employees.map((e) => e.departmentName))).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            onClick={() => setSelectedEmpModal(emp)}
            className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs hover:border-[#0D9488] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-teal-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {emp.firstName.slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {emp.empCode}
                      </span>
                      <span className="text-[10px] font-semibold text-[#64748B]">
                        {emp.employmentType}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-sm text-[#14213D] mt-1 group-hover:text-[#0D9488] transition-colors">
                      {emp.fullName}
                    </h3>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    emp.status === 'PROBATION'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {emp.status === 'PROBATION' ? 'ทดลองงาน' : 'ปฏิบัติงาน'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E2EAF4] space-y-1.5 text-xs text-[#64748B]">
                <div className="flex items-center gap-2 font-semibold text-[#14213D]">
                  <Briefcase className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span className="truncate">{emp.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.departmentName}</span>
                </div>
                {emp.licenseNo && (
                  <div className="flex items-center gap-2 text-teal-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                    <span>ใบประกอบวิชาชีพ: {emp.licenseNo}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#E2EAF4] flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-[#64748B]">{emp.staffCategory}</span>
              <span className="text-[#0D9488] font-bold flex items-center gap-1 group-hover:underline">
                <Eye className="w-3.5 h-3.5" />
                <span>ดูแฟ้มประวัติ 360°</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: 360 Employee Profile */}
      {selectedEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#E2EAF4] flex items-center justify-between bg-gradient-to-r from-[#F0FDFA] to-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0D9488] text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                  {selectedEmpModal.firstName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#14213D] text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg">
                      {selectedEmpModal.empCode}
                    </span>
                    <span className="bg-teal-50 text-[#0D9488] border border-teal-200 text-xs font-bold px-2.5 py-0.5 rounded-lg">
                      {selectedEmpModal.staffCategory}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#14213D] mt-1">
                    {selectedEmpModal.fullName}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    {selectedEmpModal.position} • {selectedEmpModal.departmentName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 border border-[#E2EAF4] rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ประวัติ</span>
                </button>
                <button
                  onClick={() => setSelectedEmpModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 bg-[#F5F8FC] flex-1 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
                  <span className="text-[#64748B] block text-[11px]">ประเภทการจ้าง / วันเริ่มงาน</span>
                  <div className="font-extrabold text-sm text-[#14213D] mt-1">{selectedEmpModal.employmentType}</div>
                  <div className="text-[11px] text-[#0D9488] mt-1">เริ่มงาน: {selectedEmpModal.hireDate}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
                  <span className="text-[#64748B] block text-[11px]">ใบประกอบวิชาชีพ</span>
                  <div className="font-extrabold text-sm text-[#0D9488] mt-1">
                    {selectedEmpModal.licenseNo || 'ไม่ต้องใช้ใบประกอบฯ'}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-1">
                    หมดอายุ: {selectedEmpModal.licenseExpiry || '-'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
                  <span className="text-[#64748B] block text-[11px]">ฐานเงินเดือน + เงินประจำตำแหน่ง</span>
                  <div className="font-extrabold text-sm text-emerald-700 mt-1">
                    ฿{(selectedEmpModal.baseSalary + selectedEmpModal.positionAllowance + selectedEmpModal.licenseAllowance).toLocaleString()} / เดือน
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-1">
                    บัญชี: {selectedEmpModal.bankName} ({selectedEmpModal.bankAccount})
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] space-y-3">
                <h4 className="font-bold text-[#14213D] uppercase text-xs flex items-center gap-2 border-b border-[#E2EAF4] pb-2">
                  <GraduationCap className="w-4 h-4 text-[#0D9488]" />
                  <span>ข้อมูลส่วนบุคคล คุณวุฒิการศึกษา และสวัสดิการ</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#64748B] block">เลขบัตรประชาชน:</span>
                    <span className="font-mono font-bold text-[#14213D]">{selectedEmpModal.idCard}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">วันเดือนปีเกิด / กรุ๊ปเลือด:</span>
                    <span className="font-bold text-[#14213D]">
                      {selectedEmpModal.birthDate} (หมู่เลือด {selectedEmpModal.bloodGroup})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">คุณวุฒิการศึกษา:</span>
                    <span className="font-bold text-[#14213D]">{selectedEmpModal.education}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">สิทธิประกันสังคม / สวัสดิการ:</span>
                    <span className="font-bold text-emerald-700">{selectedEmpModal.socialSecurityStatus}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">อีเมลทางการ:</span>
                    <span className="font-bold text-[#14213D]">{selectedEmpModal.email}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">ผู้ติดต่อฉุกเฉิน:</span>
                    <span className="font-bold text-[#14213D]">{selectedEmpModal.emergencyContact}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-[#E2EAF4] flex justify-end gap-2">
              <button
                onClick={() => setSelectedEmpModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#14213D] rounded-xl text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
              <h3 className="font-extrabold text-base text-[#14213D]">ขึ้นทะเบียนบุคลากรใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">รหัสพนักงาน</label>
                  <input
                    type="text"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">คำนำหน้าวิชาชีพ</label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                  >
                    <option value="นพ.">นพ.</option>
                    <option value="พญ.">พญ.</option>
                    <option value="พว.">พว. (พยาบาล)</option>
                    <option value="ภก.">ภก. (เภสัชกร)</option>
                    <option value="ภญ.">ภญ. (เภสัชกรหญิง)</option>
                    <option value="ทนพ.">ทนพ. (เทคนิคการแพทย์)</option>
                    <option value="กภ.">กภ. (กายภาพบำบัด)</option>
                    <option value="นาย">นาย</option>
                    <option value="น.ส.">น.ส.</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">สายวิชาชีพ</label>
                  <select
                    value={staffCategory}
                    onChange={(e) => setStaffCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                  >
                    <option value="แพทย์ (Physician)">แพทย์ (Physician)</option>
                    <option value="พยาบาล (Nurse)">พยาบาล (Nurse)</option>
                    <option value="เภสัชกร (Pharmacist)">เภสัชกร (Pharmacist)</option>
                    <option value="สหวิชาชีพ (Allied Health)">สหวิชาชีพ (Allied Health)</option>
                    <option value="สายสนับสนุน (Support)">สายสนับสนุน (Support)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">ชื่อจริง *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="เช่น วรัญญา"
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="เช่น สุขใจ"
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">ตำแหน่งงาน *</label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="เช่น พยาบาลวิชาชีพชำนาญการ"
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">แผนก / กลุ่มงาน</label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">เลขใบประกอบวิชาชีพ (ถ้ามี)</label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="เช่น ว.12345 หรือ พย.55432"
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ฐานเงินเดือน (บาท)</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2EAF4]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-xl"
                >
                  บันทึกทะเบียนบุคลากร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

