'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  RefreshCw,
  ShieldCheck,
  User,
  Clock,
} from 'lucide-react';

export default function AuditTrailPage() {
  const { refreshKey, triggerRefresh } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadLogs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (moduleFilter) params.set('module', moduleFilter);
    if (search) params.set('search', search);

    fetch(`/api/audit?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLogs();
  }, [moduleFilter, search, refreshKey]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#334155]" />
            ประวัติการปฏิบัติงานและการตรวจสอบ (Audit Trail & Activity Logs)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            บันทึกประวัติการสร้าง แก้ไข อนุมัติ และตัดจ่ายสต็อกทุกรายการแบบถาวร เพื่อความโปร่งใสและตรวจสอบได้ตามมาตรฐานสากล
          </p>
        </div>

        <button
          onClick={() => triggerRefresh()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>รีเฟรชประวัติ</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAF4] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ทำรายการ หรือรายละเอียดกิจกรรม..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
            />
          </div>

          <div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer"
            >
              <option value="">ทุกโมดูล (All Modules)</option>
              <option value="GR">ใบรับสินค้า (GR)</option>
              <option value="ISSUE">ใบเบิกสินค้า (ISSUE)</option>
              <option value="TRANSFER">ใบโอนย้าย (TRANSFER)</option>
              <option value="RETURN">ใบคืนสินค้า (RETURN)</option>
              <option value="ADJUSTMENT">ปรับปรุงยอด (ADJUSTMENT)</option>
              <option value="COUNT">ตรวจนับสินค้า (COUNT)</option>
              <option value="ITEM">ข้อมูลสินค้า (ITEM)</option>
              <option value="WAREHOUSE">คลังสินค้า (WAREHOUSE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">วัน-เวลา (Timestamp)</th>
                <th className="py-3 px-3">ผู้ปฏิบัติงาน</th>
                <th className="py-3 px-3">การกระทำ (Action)</th>
                <th className="py-3 px-3">โมดูล</th>
                <th className="py-3 px-4">รายละเอียดกิจกรรม (Details)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
                    กำลังดึงข้อมูล Audit Trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#94A3B8]">
                    ไม่พบข้อมูลประวัติการทำงาน
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F8FC] transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-[#64748B] font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#14213D] whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#334155] border border-[#E2EAF4]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-[#2563EB] font-bold">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 text-[#334155] leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
