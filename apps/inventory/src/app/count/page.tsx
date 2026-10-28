'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@erp/app-context';
import {
  ClipboardCheck,
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  Building,
  Copy,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';

export default function StockCountPage() {
  const { currentUser, addToast, refreshKey, triggerRefresh } = useApp();
  const [counts, setCounts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCount, setActiveCount] = useState<any | null>(null);

  // New Count form
  const [warehouseId, setWarehouseId] = useState('');
  const [countPlanName, setCountPlanName] = useState('แผนตรวจนับพัสดุประจำไตรมาส');
  const [isBlindCount, setIsBlindCount] = useState(false);
  const [counterName, setCounterName] = useState(currentUser.name);

  // Active Count Edit lines
  const [editLines, setEditLines] = useState<any[]>([]);

  const loadCounts = () => {
    setLoading(true);
    fetch('/api/counts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCounts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCounts();
    fetch('/api/warehouses')
      .then((r) => r.json())
      .then((whs) => {
        if (Array.isArray(whs)) {
          setWarehouses(whs);
          if (whs.length > 0) setWarehouseId(whs[0].id);
        }
      });
  }, [refreshKey]);

  const handleCreateCount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId,
          countPlanName,
          isBlindCount,
          counterName,
          userName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', `เปิดแผนตรวจนับเลขที่ ${data.countNumber} เรียบร้อยแล้ว`);
      setShowCreateModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const openCountDetail = (cnt: any) => {
    setActiveCount(cnt);
    setEditLines(
      cnt.lines.map((l: any) => ({
        id: l.id,
        itemName: l.item.itemName,
        itemCode: l.item.itemCode,
        unit: l.item.unit,
        systemQty: l.systemQty,
        countedQty: l.countedQty,
        varianceQty: l.varianceQty,
        variancePercentage: l.variancePercentage,
        recountRequired: l.recountRequired,
        notes: l.notes || '',
      }))
    );
  };

  const handleSaveCountLines = async () => {
    if (!activeCount) return;
    try {
      const res = await fetch(`/api/counts/${activeCount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_COUNT',
          userName: currentUser.name,
          lines: editLines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', 'บันทึกผลการตรวจนับชั่วคราวเรียบร้อย');
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleCloseAndAdjust = async () => {
    if (!activeCount) return;
    if (!confirm('ยืนยันปิดรายการตรวจนับและให้ระบบปรับยอดสต็อกคงคลังอัตโนมัติ?')) return;

    try {
      const res = await fetch(`/api/counts/${activeCount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE_AND_ADJUST',
          userName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', 'ปิดรายการตรวจนับและปรับปรุงยอดคงคลังตรงกับผลนับจริงเสร็จสมบูรณ์');
      setActiveCount(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            ระบบตรวจนับสินค้าคงคลัง (Stock Count & Physical Inventory)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            สร้างแผนตรวจนับ • รองรับ Blind Count • เปรียบเทียบยอดระบบกับจำนวนจริง (Variance Tracking) • ปรับยอดคงคลังอัตโนมัติเมื่อปิดรอบ
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เปิดแผนตรวจนับใหม่ (New Count Plan)</span>
        </button>
      </div>

      {/* Counts Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่แผนนับ (CNT No.)</th>
                <th className="py-3 px-3">ชื่อแผนตรวจนับ</th>
                <th className="py-3 px-3">คลังสินค้า</th>
                <th className="py-3 px-3 text-right">จำนวนรายการ</th>
                <th className="py-3 px-3">ผู้ตรวจนับ</th>
                <th className="py-3 px-3">วันที่ตรวจนับ</th>
                <th className="py-3 px-3 text-center">Blind Count</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-emerald-600 mb-2" />
                    กำลังดึงข้อมูลแผนตรวจนับ...
                  </td>
                </tr>
              ) : counts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    ยังไม่มีข้อมูลแผนตรวจนับสินค้า
                  </td>
                </tr>
              ) : (
                counts.map((cnt) => (
                  <tr
                    key={cnt.id}
                    className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    onClick={() => openCountDetail(cnt)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      <span className="hover:underline bg-emerald-50 group-hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded transition-colors">
                        {cnt.countNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#14213D]">
                      {cnt.countPlanName}
                    </td>
                    <td className="py-3 px-3 text-[#334155]">
                      {cnt.warehouse.name}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {cnt.lines.length} รายการ
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">
                      {cnt.counterName}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                      {new Date(cnt.countDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {cnt.isBlindCount ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Blind Count
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] text-[11px]">แสดงยอด</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={cnt.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openCountDetail(cnt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>บันทึกผล & ปิดยอด</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Count Plan */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-md w-full p-6 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <h3 className="text-sm font-bold text-[#14213D]">เปิดแผนตรวจนับสินค้าคงคลังใหม่</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#64748B] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">คลังสินค้าที่ตรวจนับ *</label>
                <select
                  required
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">ชื่อแผนตรวจนับ *</label>
                <input
                  type="text"
                  required
                  value={countPlanName}
                  onChange={(e) => setCountPlanName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">ชื่อผู้ตรวจนับ (Counter) *</label>
                <input
                  type="text"
                  required
                  value={counterName}
                  onChange={(e) => setCounterName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#334155]">
                  <input
                    type="checkbox"
                    checked={isBlindCount}
                    onChange={(e) => setIsBlindCount(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>ใช้วิธี Blind Count (ซ่อนยอดระบบจากผู้ตรวจนับ)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2EAF4]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  สร้างแผนตรวจนับ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Full-Screen Physical Inventory & Count Detail Modal */}
      {activeCount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                  <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Count Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{activeCount.countNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(activeCount.countNumber);
                          addToast('info', `คัดลอกเลขที่ ${activeCount.countNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่แผนตรวจนับ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={activeCount.status} />

                    {activeCount.isBlindCount && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                        Blind Count
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      บันทึกผลการตรวจนับพัสดุและกระทบยอดคงคลัง
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Physical Inventory & Cycle Count Sheet)
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#334155] rounded-xl text-xs font-semibold border border-[#E2EAF4] shadow-2xs transition-all"
                  title="พิมพ์ใบตรวจนับ"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {activeCount.status !== 'CLOSED' && (
                  <button
                    type="button"
                    onClick={handleCloseAndAdjust}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ปิดรอบ & ปรับสต็อก</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveCount(null)}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors ml-1"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F8FC]">
              {/* 4 Summary Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>คลังสินค้าที่ตรวจนับ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {activeCount.warehouse?.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ชื่อแผน: {activeCount.countPlanName}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>วันที่ตรวจนับ & ผู้ตรวจ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {new Date(activeCount.countDate).toLocaleDateString('th-TH')}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ผู้ตรวจนับ: {activeCount.counterName}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>ชนิดการตรวจนับ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {activeCount.isBlindCount ? 'Blind Count (ไม่แสดงยอด)' : 'Standard Count (แสดงยอด)'}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    รอบตรวจนับพัสดุประจำงวด
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-gradient-to-br from-white to-emerald-50/40">
                  <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>รายการตรวจนับ & สถานะ</span>
                  </div>
                  <div className="font-bold text-emerald-900 text-xl mt-1 tabular-nums">
                    {editLines.length} <span className="text-xs font-normal text-emerald-700">รายการ</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">
                    สถานะ: {activeCount.status === 'CLOSED' ? 'ปิดรอบและปรับสต็อกแล้ว' : 'กำลังดำเนินการนับ'}
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-[#14213D]">
                      รายการพัสดุและผลการนับจริง ({editLines.length} รายการ)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    กรอกจำนวนที่นับได้จริงเพื่อคำนวณ Variance ส่วนต่างอัตโนมัติ
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F5F8FC] text-[#64748B] uppercase font-semibold text-[10px] tracking-wider border-b border-[#E2EAF4]">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">ลำดับ</th>
                        <th className="py-2.5 px-3">รหัสพัสดุ</th>
                        <th className="py-2.5 px-3">ชื่อรายการเวชภัณฑ์ / พัสดุ</th>
                        {!activeCount.isBlindCount && (
                          <th className="py-2.5 px-3 text-right">ยอดในระบบ (System)</th>
                        )}
                        <th className="py-2.5 px-3 text-right text-emerald-700 font-bold">นับได้จริง (Physical)</th>
                        <th className="py-2.5 px-3 text-right">ส่วนต่าง (Variance)</th>
                        <th className="py-2.5 px-3 text-center">ต้องนับซ้ำ (Recount)</th>
                        <th className="py-2.5 px-3">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editLines.map((line, idx) => {
                        const variance = line.countedQty - line.systemQty;
                        return (
                          <tr key={line.id} className="hover:bg-[#F5F8FC] transition-colors">
                            <td className="py-2.5 px-4 text-center font-mono text-[#94A3B8]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                              {line.itemCode}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#14213D]">
                              {line.itemName}
                            </td>

                            {!activeCount.isBlindCount && (
                              <td className="py-2.5 px-3 text-right tabular-nums text-[#64748B] font-medium">
                                {line.systemQty?.toLocaleString()} {line.unit}
                              </td>
                            )}

                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                disabled={activeCount.status === 'CLOSED'}
                                value={line.countedQty}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const updated = [...editLines];
                                  updated[idx].countedQty = val;
                                  updated[idx].varianceQty = val - updated[idx].systemQty;
                                  setEditLines(updated);
                                }}
                                className="w-24 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-bold text-[#14213D] tabular-nums focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            </td>

                            <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                              {variance === 0 ? (
                                <span className="text-[#94A3B8]">0</span>
                              ) : variance > 0 ? (
                                <span className="text-emerald-600">+{variance}</span>
                              ) : (
                                <span className="text-rose-600">{variance}</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                disabled={activeCount.status === 'CLOSED'}
                                checked={line.recountRequired}
                                onChange={(e) => {
                                  const updated = [...editLines];
                                  updated[idx].recountRequired = e.target.checked;
                                  setEditLines(updated);
                                }}
                                className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                              />
                            </td>

                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                disabled={activeCount.status === 'CLOSED'}
                                value={line.notes}
                                onChange={(e) => {
                                  const updated = [...editLines];
                                  updated[idx].notes = e.target.value;
                                  setEditLines(updated);
                                }}
                                placeholder="ระบุสาเหตุส่วนต่าง..."
                                className="w-full text-xs px-2.5 py-1 bg-white border border-[#E2EAF4] rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual Workflow Steps */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                <h4 className="text-xs font-bold text-[#14213D] mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ขั้นตอนการตรวจนับและกระทบยอด (Physical Inventory Workflow Timeline)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. เปิดแผนตรวจนับ</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ล็อกสแน็ปช็อตยอดสต็อกในระบบ
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2. นับสต็อกจริงหน้าคลัง</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ลงพื้นที่ตรวจนับและกรอกยอดจริง
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      activeCount.status === 'CLOSED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {activeCount.status === 'CLOSED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>3. กระทบยอดส่วนต่าง</span>
                    </div>
                    <div className="text-[11px] mt-1">
                      คำนวณผลต่าง (Variance) และสาเหตุ
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      activeCount.status === 'CLOSED'
                        ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>4. ปรับสต็อก & ปิดรอบ</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      ปรับยอดคงคลังให้ตรงกับยอดจริง
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-4 text-xs text-[#64748B]">
                <span>
                  รวมรายการ:{' '}
                  <strong className="text-[#14213D] font-bold">
                    {editLines.length}
                  </strong>{' '}
                  รายการ
                </span>
                <span>•</span>
                <span>
                  สถานะ:{' '}
                  <strong className="text-emerald-900 font-bold">
                    {activeCount.status}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCount(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-[#334155] font-semibold rounded-xl text-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>

                {activeCount.status !== 'CLOSED' && (
                  <>
                    <button
                      type="button"
                      onClick={handleSaveCountLines}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-[#14213D] rounded-xl text-xs font-semibold transition-colors"
                    >
                      บันทึกผลชั่วคราว
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseAndAdjust}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>ปิดรอบและปรับปรุงยอดคงคลัง (Reconcile & Close)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
