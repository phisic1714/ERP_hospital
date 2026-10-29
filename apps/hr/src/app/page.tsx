'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import {
  Users,
  CalendarDays,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  UserPlus,
  GraduationCap,
  Target,
  FileCheck2,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Stethoscope,
  Timer,
  Palmtree,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STAFF_COLORS = ['#0D9488', '#2563EB', '#F28C28', '#8B5CF6', '#EC4899'];

export default function HRDashboardPage() {
  const {
    employees,
    recruitments,
    attendance,
    swaps,
    otRequests,
    leaves,
    payrolls,
    licenses,
    trainings,
  } = useHR();
  const { addToast } = useApp();

  const [selectedLicenseModal, setSelectedLicenseModal] = useState<any | null>(null);

  // KPIs Calculation
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE' || e.status === 'PROBATION');
  const presentToday = attendance.filter((a) => a.status === 'NORMAL' || a.status === 'OT' || a.status === 'LATE').length;
  const lateToday = attendance.filter((a) => a.status === 'LATE').length;

  const pendingSwaps = swaps.filter((s) => s.status === 'PENDING_APPROVAL');
  const pendingOTs = otRequests.filter((o) => o.status === 'PENDING_APPROVAL');
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING_APPROVAL');
  const totalPendingHR = pendingSwaps.length + pendingOTs.length + pendingLeaves.length;

  const criticalLicenses = licenses.filter(
    (l) => l.status === 'EXPIRED' || l.status === 'NEAR_EXPIRY'
  );
  const totalMonthlyPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const openPositions = recruitments.reduce(
    (sum, r) => sum + (r.headcountRequested - r.headcountFilled),
    0
  );

  // Staff distribution by category
  const categoryMap: Record<string, number> = {};
  employees.forEach((e) => {
    categoryMap[e.staffCategory] = (categoryMap[e.staffCategory] || 0) + 1;
  });
  const staffCategoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Department headcount chart
  const deptMap: Record<string, { dept: string; actual: number; target: number }> = {
    MED: { dept: 'อายุรกรรม', actual: 18, target: 20 },
    ICU: { dept: 'ICU วิกฤต', actual: 24, target: 28 },
    ER: { dept: 'ฉุกเฉิน ER', actual: 22, target: 25 },
    OR: { dept: 'ห้องผ่าตัด OR', actual: 19, target: 20 },
    PHARM: { dept: 'เภสัชกรรม', actual: 14, target: 15 },
    LAB: { dept: 'ชันสูตร Lab', actual: 11, target: 12 },
    IPD: { dept: 'ผู้ป่วยใน IPD', actual: 32, target: 35 },
  };
  const deptChartData = Object.values(deptMap);

  const kpis = [
    {
      title: 'บุคลากรปฏิบัติงานทั้งหมด',
      subTitle: 'Total Active Workforce',
      value: '148',
      unit: 'คน',
      sub: `ตัวอย่างในระบบ ${activeEmployees.length} ราย (แพทย์/พยาบาล/สหวิชาชีพ)`,
      icon: Users,
      color: 'text-[#0D9488] bg-teal-50 border-teal-200',
      href: '/hr/employees',
    },
    {
      title: 'ลงเวลาเข้าเวรวันนี้',
      subTitle: 'Today Shift Attendance',
      value: `${presentToday}/${employees.length}`,
      unit: 'คน',
      sub: lateToday > 0 ? `มาสาย ${lateToday} คน • ตรงเวลา ${presentToday - lateToday} คน` : 'ตรงเวลาครบทุกคน',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      href: '/hr/attendance',
    },
    {
      title: 'จัดตารางเวร & ขอสลับเวร',
      subTitle: 'Shift & Roster Control',
      value: pendingSwaps.length,
      unit: 'คำขอสลับเวร',
      sub: 'คลิกตรวจสอบตารางเวร 24 ชม. (เช้า/บ่าย/ดึก)',
      icon: CalendarDays,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      highlight: pendingSwaps.length > 0,
      href: '/hr/roster',
    },
    {
      title: 'ใบประกอบวิชาชีพใกล้หมดอายุ',
      subTitle: 'License & Credential Alert',
      value: criticalLicenses.length,
      unit: 'ใบอนุญาต',
      sub: 'ต้องต่ออายุก่อนขึ้นเวรตามเกณฑ์ HA / JCI',
      icon: ShieldCheck,
      color: 'text-rose-600 bg-rose-50 border-rose-300',
      highlight: criticalLicenses.length > 0,
      href: '/hr/expiry-alerts',
    },
    {
      title: 'คำขอลา & OT รออนุมัติ',
      subTitle: 'Pending Leave & OT',
      value: pendingLeaves.length + pendingOTs.length,
      unit: 'รายการ',
      sub: `ใบลา ${pendingLeaves.length} ใบ • ขอ OT ${pendingOTs.length} รายการ`,
      icon: FileCheck2,
      color: 'text-amber-600 bg-amber-50 border-amber-300',
      highlight: pendingLeaves.length + pendingOTs.length > 0,
      href: '/hr/approvals',
    },
    {
      title: 'งบเงินเดือนและค่าเวรเดือนนี้',
      subTitle: 'Monthly Payroll & Shift Pay',
      value: `฿${(totalMonthlyPayroll / 1000).toFixed(1)}k`,
      unit: '',
      sub: `รวมสุทธิ ฿${totalMonthlyPayroll.toLocaleString()}`,
      icon: Wallet,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      href: '/hr/payroll',
    },
    {
      title: 'อัตราเปิดรับสมัคร (Vacancies)',
      subTitle: 'Active Recruitment',
      value: openPositions,
      unit: 'อัตราว่าง',
      sub: `กำลังสัมภาษณ์ ${recruitments.length} ตำแหน่งวิชาชีพ`,
      icon: UserPlus,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      href: '/hr/recruitment',
    },
    {
      title: 'หลักสูตรอบรม & เก็บ CME',
      subTitle: 'Training & CNEU / CME',
      value: trainings.length,
      unit: 'หลักสูตร',
      sub: 'พัฒนาวิชาชีพต่อเนื่องและมาตรฐาน HA',
      icon: GraduationCap,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      href: '/hr/training',
    },
  ];

  const quickDock = [
    { title: 'ทะเบียนบุคลากร', desc: 'ประวัติแพทย์/พยาบาล', href: '/hr/employees', icon: Users, color: 'text-[#0D9488] bg-teal-50 hover:bg-teal-100 border-teal-200' },
    { title: 'จัดตารางเวร (Roster)', desc: 'เวรเช้า-บ่าย-ดึก & สลับเวร', href: '/hr/roster', icon: CalendarDays, color: 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200' },
    { title: 'บันทึกเวลาเข้า-ออก', desc: 'ตรวจสอบลงเวลา/สาย', href: '/hr/attendance', icon: Clock, color: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { title: 'การลาและวันหยุด', desc: 'ลาป่วย/กิจ/พักร้อน', href: '/hr/leaves', icon: Palmtree, color: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
    { title: 'ทำงานล่วงเวลา (OT)', desc: 'เบิก OT และเวร On-call', href: '/hr/overtime', icon: Timer, color: 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200' },
    { title: 'ประมวลผลเงินเดือน', desc: 'เงินเดือน/ค่าเวร/ภาษี', href: '/hr/payroll', icon: Wallet, color: 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { title: 'ใบประกอบวิชาชีพ', desc: 'ตรวจวันหมดอายุใบอนุญาต', href: '/hr/licenses', icon: ShieldCheck, color: 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200' },
    { title: 'ประเมินผล KPI', desc: 'KPI & Competency', href: '/hr/performance', icon: Target, color: 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans pb-12">
      {/* 1. Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F0FDFA] via-[#F8FAFC] to-white border border-[#E2EAF4] p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Hospital Human Resource Management (HRM)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                HA / JCI Credential Ready
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14213D] flex items-center gap-3">
              <span>แดชบอร์ดบริหารทรัพยากรบุคคลโรงพยาบาล (Dashboard HR)</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              ศูนย์กลางบริหารจัดการบุคลากรทางการแพทย์ พยาบาล สหวิชาชีพ และสายสนับสนุน ครอบคลุมการจัดตารางเวร 24 ชั่วโมง การควบคุมใบประกอบวิชาชีพ เงินเดือนค่าเวร และการประเมินสมรรถนะ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/hr/roster"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-teal-50 text-[#0D9488] rounded-xl text-xs font-bold border border-[#0D9488]/30 shadow-2xs transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              <span>ตารางเวร (Roster)</span>
            </Link>
            <Link
              href="/hr/employees"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Users className="w-4 h-4" />
              <span>+ เพิ่มบุคลากรใหม่</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Quick Operations Dock */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[#0D9488]" />
            <h2 className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
              ทางลัดระบบบริหารงานบุคคลโรงพยาบาล (HR Quick Modules)
            </h2>
          </div>
          <span className="text-[11px] text-[#94A3B8] font-medium">ครบทั้ง 11 โมดูลหลักตามโครงสร้างมาตรฐาน</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {quickDock.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs ${item.color}`}
              >
                <Icon className="w-5 h-5 mb-1.5 shrink-0" />
                <span className="text-xs font-bold leading-tight line-clamp-1">{item.title}</span>
                <span className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{item.desc}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Pending HR Approvals Alert Banner */}
      {totalPendingHR > 0 && (
        <div className="bg-[#F0FDFA] rounded-2xl border border-teal-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#14213D]">
                  มีคำขอบุคลากรรออนุมัติทั้งหมด {totalPendingHR} รายการ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#0D9488] border border-teal-200">
                  HR Approval Center
                </span>
              </div>
              <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-3 mt-1">
                <span>• คำขอสลับเวร: <b>{pendingSwaps.length}</b> รายการ</span>
                <span>• ขออนุมัติ OT: <b>{pendingOTs.length}</b> รายการ</span>
                <span>• ใบลารออนุมัติ: <b>{pendingLeaves.length}</b> ใบ</span>
              </div>
            </div>
          </div>

          <Link
            href="/hr/approvals"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>เปิดศูนย์อนุมัติ HR</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4. 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              href={kpi.href}
              className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between group ${
                kpi.highlight ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-[#E2EAF4] shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#14213D] block group-hover:text-[#0D9488] transition-colors">
                      {kpi.title}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono block">
                      {kpi.subTitle}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border shrink-0 ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight tabular-nums">
                    {kpi.value}
                  </span>
                  {kpi.unit && <span className="text-xs text-[#64748B] font-medium">{kpi.unit}</span>}
                </div>
              </div>

              <div className="text-[11px] text-[#94A3B8] mt-2.5 pt-2.5 border-t border-[#E2EAF4] flex items-center justify-between">
                <span className="truncate max-w-[170px]">{kpi.sub}</span>
                <span className="text-[#0D9488] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 5. Charts Row: Manpower vs Target & Staff Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Manpower by Department */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0D9488]" />
                  <h2 className="text-sm font-bold text-[#14213D]">
                    อัตรากำลังบุคลากรจริงเทียบกรอบอัตรากำลัง (Manpower Capacity vs Target)
                  </h2>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  เปรียบเทียบจำนวนบุคลากรปฏิบัติงานจริงกับกรอบอัตรากำลังมาตรฐานแยกตามแผนก
                </p>
              </div>
              <Link
                href="/hr/positions"
                className="text-xs px-3 py-1 bg-teal-50 text-[#0D9488] rounded-full font-bold border border-teal-200 hover:bg-teal-100"
              >
                ดูกรอบอัตรากำลัง →
              </Link>
            </div>

            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14213D',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="actual" fill="#0D9488" radius={[6, 6, 0, 0]} name="อัตราปฏิบัติงานจริง (คน)" />
                  <Bar dataKey="target" fill="#CBD5E1" radius={[6, 6, 0, 0]} name="กรอบอัตรากำลัง (คน)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#E2EAF4] pt-4 mt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E2EAF4]">
              <span className="text-[#64748B] block text-[11px]">อัตราครองงานเฉลี่ย</span>
              <span className="font-extrabold text-[#0D9488] text-sm">92.4% ของกรอบ</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E2EAF4]">
              <span className="text-[#64748B] block text-[11px]">สัดส่วนพยาบาล ICU</span>
              <span className="font-extrabold text-[#14213D] text-sm">1 : 1.5 เตียง</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E2EAF4]">
              <span className="text-[#64748B] block text-[11px]">อัตรา Turnover รายปี</span>
              <span className="font-extrabold text-emerald-600 text-sm">3.8% (เกณฑ์ดีมาก)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E2EAF4]">
              <span className="text-[#64748B] block text-[11px]">ความพร้อมใบประกอบฯ</span>
              <span className="font-extrabold text-amber-600 text-sm">96.2% Active</span>
            </div>
          </div>
        </div>

        {/* Pie Chart: Staff Category Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#0D9488]" />
                  <h2 className="text-sm font-bold text-[#14213D]">สัดส่วนสายวิชาชีพโรงพยาบาล</h2>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">Medical, Nursing & Allied Health</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {staffCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={STAFF_COLORS[index % STAFF_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#14213D',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-[#E2EAF4] pt-3 space-y-2">
            {staffCategoryData.map((c, i) => (
              <div key={c.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 truncate max-w-[180px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: STAFF_COLORS[i % STAFF_COLORS.length] }}
                  />
                  <span className="text-[#64748B] truncate">{c.name}</span>
                </div>
                <span className="font-bold text-[#14213D] tabular-nums">{c.value} คน</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Critical Tables: License Expiry Alerts & Today Shift Roster / Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Professional License & Credential Control */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                    <span>ควบคุมใบประกอบวิชาชีพ & วันหมดอายุ</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold border border-rose-200">
                      HA Compliance
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">ตรวจสอบสถานะใบอนุญาตแพทย์ พยาบาล เภสัชกร เทคนิคการแพทย์</p>
                </div>
              </div>
              <Link
                href="/hr/licenses"
                className="text-xs text-[#0D9488] font-bold hover:underline flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2EAF4]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">เลขใบอนุญาต</th>
                    <th className="py-2.5 px-3">บุคลากร / แผนก</th>
                    <th className="py-2.5 px-3">วันหมดอายุ</th>
                    <th className="py-2.5 px-3 text-center">หน่วยกิต CME</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAF4]">
                  {licenses.slice(0, 5).map((lic) => (
                    <tr
                      key={lic.id}
                      onClick={() => setSelectedLicenseModal(lic)}
                      className="hover:bg-[#F5F8FC] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#0D9488]">{lic.licenseNo}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#14213D]">{lic.empName}</div>
                        <div className="text-[10px] text-[#64748B] truncate max-w-[150px]">{lic.licenseType}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium text-[#14213D]">
                        {new Date(lic.expiryDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className="font-bold text-[#14213D]">{lic.cmeCreditsEarned}</span>/{lic.cmeCreditsRequired}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {lic.status === 'EXPIRED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            หมดอายุ ({Math.abs(lic.daysRemaining)} วัน)
                          </span>
                        ) : lic.status === 'NEAR_EXPIRY' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            เหลือ {lic.daysRemaining} วัน
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ปกติ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#94A3B8] flex items-center justify-between pt-2 border-t border-[#E2EAF4]">
            <span>เกณฑ์แจ้งเตือนล่วงหน้า 90 วันก่อนใบอนุญาตหมดอายุ</span>
            <Link href="/hr/expiry-alerts" className="text-rose-600 font-bold hover:underline">
              จัดการใบใกล้หมดอายุ ({criticalLicenses.length}) →
            </Link>
          </div>
        </div>

        {/* Table 2: Today's Attendance & Shift Check-in */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0D9488] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                    <span>บันทึกเวลาปฏิบัติงานและเข้าเวรวันนี้</span>
                    <span className="text-[10px] text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-200">
                      Real-time Biometric
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">สถานะการสแกนใบหน้าเข้า-ออกเวร เช้า / บ่าย / ดึก</p>
                </div>
              </div>
              <Link
                href="/hr/attendance"
                className="text-xs text-[#0D9488] font-bold hover:underline flex items-center gap-1"
              >
                <span>ดูเวลาทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2EAF4]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">บุคลากร</th>
                    <th className="py-2.5 px-3">ผลัดเวร</th>
                    <th className="py-2.5 px-3 text-center">เข้า - ออก</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAF4]">
                  {attendance.slice(0, 5).map((att) => (
                    <tr key={att.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#14213D]">{att.empName}</div>
                        <div className="text-[10px] text-[#64748B]">{att.departmentName}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#334155] font-semibold text-[11px]">
                          {att.shiftType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#14213D]">
                        {att.checkIn} - {att.checkOut}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {att.status === 'LATE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            สาย ({att.lateMinutes} นาที)
                          </span>
                        ) : att.status === 'OT' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            ควบเวร OT (+{att.otHours} ชม.)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ตรงเวลา
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#94A3B8] flex items-center justify-between pt-2 border-t border-[#E2EAF4]">
            <span>เชื่อมโยงข้อมูลเครื่องสแกนใบหน้าโรงพยาบาลอัตโนมัติ</span>
            <Link href="/hr/roster" className="text-[#0D9488] font-bold hover:underline">
              เปิดตารางเวรรวม →
            </Link>
          </div>
        </div>
      </div>

      {/* Modal: Quick License Detail */}
      {selectedLicenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#0D9488] uppercase">Professional Credential</span>
                <h3 className="text-base font-extrabold text-[#14213D]">{selectedLicenseModal.licenseType}</h3>
              </div>
              <button
                onClick={() => setSelectedLicenseModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 bg-[#F5F8FC] rounded-xl">
                <span className="text-[#64748B]">ชื่อ-นามสกุลผู้ถือใบอนุญาต:</span>
                <span className="font-bold text-[#14213D]">{selectedLicenseModal.empName}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F5F8FC] rounded-xl">
                <span className="text-[#64748B]">เลขที่ใบประกอบวิชาชีพ:</span>
                <span className="font-mono font-bold text-[#0D9488]">{selectedLicenseModal.licenseNo}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F5F8FC] rounded-xl">
                <span className="text-[#64748B]">หน่วยงานผู้ออกใบอนุญาต:</span>
                <span className="font-semibold text-[#14213D]">{selectedLicenseModal.issuedBy}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F5F8FC] rounded-xl">
                <span className="text-[#64748B]">วันหมดอายุ:</span>
                <span className="font-bold text-rose-600">
                  {new Date(selectedLicenseModal.expiryDate).toLocaleDateString('th-TH')}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#F5F8FC] rounded-xl">
                <span className="text-[#64748B]">หน่วยกิตการศึกษาต่อเนื่อง (CME/CNEU):</span>
                <span className="font-bold text-emerald-700">
                  สะสม {selectedLicenseModal.cmeCreditsEarned} / เกณฑ์ {selectedLicenseModal.cmeCreditsRequired} หน่วยกิต
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2EAF4]">
              <button
                onClick={() => {
                  addToast('success', `ส่งแจ้งเตือนต่ออายุใบอนุญาตให้ ${selectedLicenseModal.empName} แล้ว`);
                  setSelectedLicenseModal(null);
                }}
                className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold"
              >
                แจ้งเตือนต่ออายุทันที
              </button>
              <button
                onClick={() => setSelectedLicenseModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#14213D] rounded-xl text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

