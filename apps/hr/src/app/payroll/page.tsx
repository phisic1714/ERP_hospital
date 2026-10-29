'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR, HRPayrollRecord } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { Wallet, Printer, Eye, CheckCircle2, RefreshCw, X } from 'lucide-react';

export default function HRPayrollPage() {
  const { payrolls, runPayrollBatch } = useHR();
  const { addToast } = useApp();

  const [selectedSlip, setSelectedSlip] = useState<HRPayrollRecord | null>(null);

  const totalBase = payrolls.reduce((s, p) => s + p.baseSalary, 0);
  const totalShiftAndOT = payrolls.reduce((s, p) => s + p.shiftAllowance + p.otPay, 0);
  const totalTaxAndSSO = payrolls.reduce((s, p) => s + p.taxDeduction + p.ssoDeduction + p.providentFund, 0);
  const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0);

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
            <Wallet className="w-7 h-7 text-[#0D9488]" />
            <span>ประมวลผลเงินเดือนและสลิปอิเล็กทรอนิกส์ (Hospital Payroll Processing)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            คำนวณฐานเงินเดือน เงินประจำตำแหน่ง ค่าใบประกอบวิชาชีพ ค่าเวร ค่า OT หักภาษี ณ ที่จ่าย (ภ.ง.ด.1) และประกันสังคม
          </p>
        </div>

        <button
          onClick={() => {
            runPayrollBatch('2026-10');
            addToast('success', 'ประมวลผล Batch เงินเดือนและออก e-Payslip ประจำเดือนตุลาคม 2569 สำเร็จ');
          }}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>คำนวณและอนุมัติงวดเงินเดือน</span>
        </button>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">รวมฐานเงินเดือน</span>
          <div className="text-xl font-extrabold text-[#14213D] mt-1">฿{totalBase.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">รวมค่าเวร + ค่า OT</span>
          <div className="text-xl font-extrabold text-[#0D9488] mt-1">฿{totalShiftAndOT.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">รวมหักภาษี / ปกส. / กองทุน</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">-฿{totalTaxAndSSO.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4]">
          <span className="text-xs text-[#64748B]">ยอดโอนเข้าบัญชีสุทธิ (Net Pay)</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">฿{totalNet.toLocaleString()}</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">รหัส / บุคลากร</th>
                <th className="py-3.5 px-3 text-right">เงินเดือนฐาน</th>
                <th className="py-3.5 px-3 text-right">ค่าตำแหน่ง/ใบประกอบ</th>
                <th className="py-3.5 px-3 text-right">ค่าเวร + OT</th>
                <th className="py-3.5 px-3 text-right">หักภาษี/ปกส./PVD</th>
                <th className="py-3.5 px-4 text-right">รับสุทธิ (Net)</th>
                <th className="py-3.5 px-3 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">e-Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{p.empName}</div>
                    <div className="text-[10px] text-[#64748B]">{p.empCode} • {p.departmentName}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">฿{p.baseSalary.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono text-[#0D9488]">
                    +฿{(p.positionAllowance + p.licenseAllowance).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-600">
                    +฿{(p.shiftAllowance + p.otPay).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600">
                    -฿{(p.taxDeduction + p.ssoDeduction + p.providentFund).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700 text-sm">
                    ฿{p.netSalary.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      โอนแล้ว
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedSlip(p)}
                      className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-[#0D9488] rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูสลิป</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: e-Payslip */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-2xl max-w-xl w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#0D9488] uppercase">Hospital Confidential e-Payslip</span>
                <h3 className="text-base font-extrabold text-[#14213D]">ใบแจ้งเงินเดือนและค่าตอบแทนวิชาชีพ</h3>
                <p className="text-[11px] text-[#64748B]">งวดประจำเดือน: {selectedSlip.period}</p>
              </div>
              <button onClick={() => setSelectedSlip(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#F5F8FC] rounded-2xl border border-[#E2EAF4] flex justify-between">
              <div>
                <div className="font-extrabold text-sm text-[#14213D]">{selectedSlip.empName}</div>
                <div className="text-[#64748B]">{selectedSlip.position}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-[#0D9488]">{selectedSlip.empCode}</div>
                <div className="text-[#64748B]">วันที่โอน: {selectedSlip.paymentDate}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                <div className="font-extrabold text-emerald-800 border-b border-emerald-200 pb-1">รายการได้ (Earnings)</div>
                <div className="flex justify-between"><span>ฐานเงินเดือน:</span><b>฿{selectedSlip.baseSalary.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>เงินประจำตำแหน่ง:</span><b>฿{selectedSlip.positionAllowance.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>ค่าใบประกอบวิชาชีพ:</span><b>฿{selectedSlip.licenseAllowance.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>ค่าขึ้นเวรบ่าย/ดึก:</span><b>฿{selectedSlip.shiftAllowance.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>ค่าล่วงเวลา (OT):</span><b>฿{selectedSlip.otPay.toLocaleString()}</b></div>
              </div>

              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-2">
                <div className="font-extrabold text-rose-800 border-b border-rose-200 pb-1">รายการหัก (Deductions)</div>
                <div className="flex justify-between"><span>ภาษีหัก ณ ที่จ่าย (ภ.ง.ด.1):</span><b>฿{selectedSlip.taxDeduction.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>ประกันสังคม (ม.33):</span><b>฿{selectedSlip.ssoDeduction.toLocaleString()}</b></div>
                <div className="flex justify-between"><span>กองทุนสำรองเลี้ยงชีพ (PVD):</span><b>฿{selectedSlip.providentFund.toLocaleString()}</b></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#14213D] text-white flex items-center justify-between">
              <span className="font-bold">เงินได้สุทธิโอนเข้าบัญชีธนาคาร (Net Pay)</span>
              <span className="text-xl font-extrabold text-teal-300">฿{selectedSlip.netSalary.toLocaleString()}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => window.print()} className="px-4 py-2 border rounded-xl font-bold flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์ e-Payslip</span>
              </button>
              <button onClick={() => setSelectedSlip(null)} className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

