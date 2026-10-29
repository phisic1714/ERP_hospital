'use client';

import React, { useState } from 'react';
import Link from '@erp/ui/navigation';
import { useHR } from '@erp/app-context';
import { useApp } from '@erp/app-context';
import { ShieldCheck, Plus, RefreshCw } from 'lucide-react';

export default function HRLicensesPage() {
  const { licenses, employees, addLicense, renewLicense } = useHR();
  const { addToast } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [empCode, setEmpCode] = useState(employees[0]?.empCode || '');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseType, setLicenseType] = useState<'ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)' | 'ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์' | 'ใบประกอบวิชาชีพเภสัชกรรม' | 'ใบประกอบวิชาชีพเทคนิคการแพทย์' | 'ใบประกอบวิชาชีพกายภาพบำบัด' | 'ใบรับรอง ACLS / BLS'>('ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์');
  const [expiryDate, setExpiryDate] = useState('2031-10-28');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.empCode === empCode) || employees[0];
    addLicense({
      empCode: emp.empCode,
      empName: emp.fullName,
      departmentName: emp.departmentName,
      position: emp.position,
      licenseType,
      licenseNo,
      issuedBy: 'สภาวิชาชีพทางการแพทย์และสาธารณสุข',
      issueDate: '2026-10-28',
      expiryDate,
      daysRemaining: 1825,
      cmeCreditsRequired: 50,
      cmeCreditsEarned: 50,
      status: 'ACTIVE',
    });
    addToast('success', `บันทึกทะเบียนใบประกอบวิชาชีพ ${licenseNo} เรียบร้อยแล้ว`);
    setShowModal(false);
    setLicenseNo('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] mb-1">
            <Link href="/hr" className="hover:underline">HUMAN RESOURCE</Link>
            <span>/</span>
            <span className="text-[#64748B]">PROFESSIONAL CREDENTIAL</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#14213D] flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#0D9488]" />
            <span>ทะเบียนใบประกอบวิชาชีพทางการแพทย์ (Professional Licenses Registry)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            ตรวจสอบเลขที่ใบอนุญาตประกอบวิชาชีพ แพทยสภา สภาการพยาบาล สภาเภสัชกรรม สภาเทคนิคการแพทย์ และหน่วยกิตสะสม
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ขึ้นทะเบียนใบอนุญาตใหม่</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2EAF4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-bold">
              <tr>
                <th className="py-3.5 px-4">เลขใบอนุญาต</th>
                <th className="py-3.5 px-4">ผู้ถือใบอนุญาต / แผนก</th>
                <th className="py-3.5 px-4">ประเภทใบประกอบวิชาชีพ</th>
                <th className="py-3.5 px-4">วันหมดอายุ</th>
                <th className="py-3.5 px-4 text-center">หน่วยกิตสะสม</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การต่ออายุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {licenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-[#F5F8FC]">
                  <td className="py-3 px-4 font-mono font-bold text-[#0D9488]">{lic.licenseNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#14213D]">{lic.empName}</div>
                    <div className="text-[10px] text-[#64748B]">{lic.departmentName}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#14213D]">
                    <div>{lic.licenseType}</div>
                    <div className="text-[10px] text-[#64748B]">{lic.issuedBy}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#14213D]">{lic.expiryDate}</td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className="font-bold text-[#0D9488]">{lic.cmeCreditsEarned}</span>/{lic.cmeCreditsRequired}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {lic.status === 'EXPIRED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        หมดอายุ ({Math.abs(lic.daysRemaining)} วัน)
                      </span>
                    ) : lic.status === 'NEAR_EXPIRY' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        เหลือ {lic.daysRemaining} วัน
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ปกติ (Active)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {(lic.status === 'EXPIRED' || lic.status === 'NEAR_EXPIRY') && (
                      <button
                        onClick={() => {
                          renewLicense(lic.id, '2031-10-28');
                          addToast('success', `บันทึกต่ออายุใบประกอบวิชาชีพ ${lic.licenseNo} อีก 5 ปีเรียบร้อยแล้ว`);
                        }}
                        className="px-3 py-1 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>ต่ออายุ 5 ปี</span>
                      </button>
                    )}
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
            <h3 className="font-extrabold text-base text-[#14213D]">ขึ้นทะเบียนใบประกอบวิชาชีพใหม่</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">บุคลากร</label>
                <select value={empCode} onChange={(e) => setEmpCode(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  {employees.map((e) => (
                    <option key={e.id} value={e.empCode}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">ประเภทใบประกอบวิชาชีพ</label>
                <select value={licenseType} onChange={(e) => setLicenseType(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]">
                  <option value="ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)">ใบประกอบวิชาชีพเวชกรรม (แพทยสภา)</option>
                  <option value="ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์">ใบประกอบวิชาชีพการพยาบาลและผดุงครรภ์</option>
                  <option value="ใบประกอบวิชาชีพเภสัชกรรม">ใบประกอบวิชาชีพเภสัชกรรม</option>
                  <option value="ใบประกอบวิชาชีพเทคนิคการแพทย์">ใบประกอบวิชาชีพเทคนิคการแพทย์</option>
                  <option value="ใบรับรอง ACLS / BLS">ใบรับรอง ACLS / BLS</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">เลขที่ใบอนุญาต *</label>
                  <input type="text" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} placeholder="เช่น พย.556789" className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" required />
                </div>
                <div>
                  <label className="block font-bold mb-1">วันหมดอายุ</label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-[#F5F8FC]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white font-bold rounded-xl">บันทึกใบอนุญาต</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

