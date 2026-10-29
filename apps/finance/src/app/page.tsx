'use client';

import React from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import {
  Landmark,
  CreditCard,
  TrendingUp,
  BookOpen,
  Sparkles,
  ChevronRight,
  Printer,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function FinanceDashboardPage() {
  const { addToast } = useApp();

  const cashflowData = [
    { month: 'พ.ค. 69', revenue: 18500000, expense: 14200000 },
    { month: 'มิ.ย. 69', revenue: 19400000, expense: 14800000 },
    { month: 'ก.ค. 69', revenue: 20100000, expense: 15100000 },
    { month: 'ส.ค. 69', revenue: 19800000, expense: 15600000 },
    { month: 'ก.ย. 69', revenue: 21200000, expense: 15900000 },
    { month: 'ต.ค. 69', revenue: 22450000, expense: 16320000 },
  ];

  const recentVouchers = [
    { voucherNo: 'PV-202610-089', date: '2026-10-28', type: 'ใบสำคัญจ่าย (Payment Voucher)', party: 'บริษัท ซิลลิค ฟาร์มา จำกัด (PO ยาและเวชภัณฑ์)', amount: 485000, status: 'PAID' },
    { voucherNo: 'JV-202610-042', date: '2026-10-28', type: 'ใบสำคัญทั่วไป (Payroll GL)', party: 'บันทึกบัญชีเงินเดือนและค่าเวรบุคลากร ต.ค. 69', amount: 725535, status: 'POSTED' },
    { voucherNo: 'RV-202610-115', date: '2026-10-27', type: 'ใบสำคัญรับ (Receipt Voucher)', party: 'รับชำระค่ารักษาพยาบาลกองทุนประกันสังคม & สปสช.', amount: 1850000, status: 'POSTED' },
    { voucherNo: 'PV-202610-088', date: '2026-10-27', type: 'ใบสำคัญจ่าย (Payment Voucher)', party: 'บริษัท ดีเคเอสเอช (ประเทศไทย) จำกัด', amount: 320000, status: 'PENDING_PAYMENT' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F0F9FF] via-[#F8FAFC] to-white border border-[#E2EAF4] p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>FINANCE • ACCOUNTING</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284C7] border border-sky-200">
                AP / AR / GL Integrated
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14213D]">
              แดชบอร์ดระบบบริหารการเงินและบัญชี (Finance & Accounting)
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              บริหารรายรับ รายจ่าย เจ้าหนี้การค้า (AP) ลูกหนี้สิทธิการรักษา (AR) การเบิกจ่าย และการบันทึกสมุดบัญชีแยกประเภท (General Ledger) ของโรงพยาบาล
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-white border border-[#E2EAF4] rounded-xl text-xs font-bold text-[#14213D] flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[#0284C7]" />
              <span>พิมพ์งบทดลอง</span>
            </button>
            <Link
              href="/finance/payables"
              className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>อนุมัติจ่ายชำระเจ้าหนี้ (AP)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
          <span className="text-xs font-bold text-[#64748B]">รายรับค่ารักษาพยาบาลเดือนนี้</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">฿22.45M</div>
          <div className="text-[11px] text-[#64748B] mt-1">OPD / IPD / สิทธิประกันสังคม & สปสช.</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
          <span className="text-xs font-bold text-[#64748B]">รายจ่ายดำเนินงานและค่ายาเดือนนี้</span>
          <div className="text-2xl font-extrabold text-[#14213D] mt-2">฿16.32M</div>
          <div className="text-[11px] text-[#64748B] mt-1">รวมต้นทุนเวชภัณฑ์และเงินเดือน HR</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
          <span className="text-xs font-bold text-[#64748B]">เจ้าหนี้การค้ารอชำระ (AP Balance)</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">฿3.84M</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">จากใบตรวจรับพัสดุ (GR) 12 รายการ</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
          <span className="text-xs font-bold text-[#64748B]">ลูกหนี้สิทธิการรักษาคงค้าง (AR)</span>
          <div className="text-2xl font-extrabold text-[#0284C7] mt-2">฿5.12M</div>
          <div className="text-[11px] text-[#64748B] mt-1">สิทธิกรมบัญชีกลาง / ประกันชีวิต / ปกส.</div>
        </div>
      </div>

      {/* 3 Sub-Module Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/finance/payables" className="bg-white p-5 rounded-2xl border border-[#E2EAF4] hover:border-[#0284C7] transition-all flex items-center justify-between group">
          <div>
            <div className="font-bold text-sm text-[#14213D] group-hover:text-[#0284C7]">บัญชีเจ้าหนี้และการเบิกจ่าย (AP)</div>
            <div className="text-xs text-[#64748B] mt-0.5">ตรวจสอบ 3-Way Match (PO/GR/Invoice) และออกใบสำคัญจ่าย</div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#0284C7]" />
        </Link>
        <Link href="/finance/receivables" className="bg-white p-5 rounded-2xl border border-[#E2EAF4] hover:border-[#0284C7] transition-all flex items-center justify-between group">
          <div>
            <div className="font-bold text-sm text-[#14213D] group-hover:text-[#0284C7]">บัญชีลูกหนี้และรายรับค่ารักษา (AR)</div>
            <div className="text-xs text-[#64748B] mt-0.5">บริหารรายรับ OPD/IPD และลูกหนี้สิทธิ์ประกันสุขภาพ</div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#0284C7]" />
        </Link>
        <Link href="/finance/ledger" className="bg-white p-5 rounded-2xl border border-[#E2EAF4] hover:border-[#0284C7] transition-all flex items-center justify-between group">
          <div>
            <div className="font-bold text-sm text-[#14213D] group-hover:text-[#0284C7]">สมุดบัญชีแยกประเภท (General Ledger)</div>
            <div className="text-xs text-[#64748B] mt-0.5">ผังบัญชีโรงพยาบาล (COA) และการลงบัญชีอัตโนมัติ</div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#0284C7]" />
        </Link>
      </div>

      {/* Revenue vs Expense Chart */}
      <div className="bg-white p-6 rounded-3xl border border-[#E2EAF4] shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-[#14213D]">
          เปรียบเทียบรายรับค่ารักษาพยาบาลและรายจ่ายดำเนินงานย้อนหลัง 6 เดือน
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashflowData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#0284C7" radius={[6, 6, 0, 0]} name="รายรับรวม (บาท)" />
              <Bar dataKey="expense" fill="#64748B" radius={[6, 6, 0, 0]} name="รายจ่ายรวม (บาท)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Vouchers Table */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2EAF4] bg-[#F5F8FC] font-extrabold text-xs text-[#14213D]">
          รายการใบสำคัญรับ-จ่ายและบันทึกบัญชีล่าสุด (Recent Accounting Vouchers)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขที่ใบสำคัญ</th>
                <th className="py-3.5 px-4">วันที่</th>
                <th className="py-3.5 px-4">ประเภทสมุดรายวัน</th>
                <th className="py-3.5 px-4">รายการ / คู่ค้า / กองทุน</th>
                <th className="py-3.5 px-4 text-right">จำนวนเงิน (บาท)</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {recentVouchers.map((v) => (
                <tr key={v.voucherNo} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">{v.voucherNo}</td>
                  <td className="py-3 px-4 text-[#64748B]">{v.date}</td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">{v.type}</td>
                  <td className="py-3 px-4 text-[#14213D]">{v.party}</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-[#14213D]">
                    ฿{v.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                      {v.status}
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

