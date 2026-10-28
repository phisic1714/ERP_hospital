'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle,
  XCircle,
  Search,
  Building,
  RefreshCw,
  AlertTriangle,
  Eye,
  Copy,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function StockAdjustmentPage() {
  const { currentUser, addToast, refreshKey, triggerRefresh } = useApp();
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any | null>(null);

  // Form
  const [warehouseId, setWarehouseId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('DAMAGED');
  const [reason, setReason] = useState('');
  const [lines, setLines] = useState<any[]>([
    { itemId: '', currentQty: 0, adjustmentQty: -1, unit: 'Unit' },
  ]);

  const loadData = () => {
    setLoading(true);
    fetch('/api/adjustments')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAdjustments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    fetch('/api/warehouses')
      .then((r) => r.json())
      .then((whs) => {
        if (Array.isArray(whs)) {
          setWarehouses(whs);
          if (whs.length > 0) setWarehouseId(whs[0].id);
        }
      });
    fetch('/api/items')
      .then((r) => r.json())
      .then((its) => {
        if (Array.isArray(its)) setItems(its);
      });
  }, [refreshKey]);

  const handleItemChange = (idx: number, itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return;
    const sb = it.stockBalances?.find((b: any) => b.warehouseId === warehouseId);
    const onHand = sb ? sb.onHand : 0;

    const updated = [...lines];
    updated[idx].itemId = itemId;
    updated[idx].currentQty = onHand;
    updated[idx].unit = it.unit;
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { itemId: '', currentQty: 0, adjustmentQty: -1, unit: 'Unit' }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== idx));
    }
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      addToast('error', 'กรุณาระบุเหตุผลการปรับปรุงยอด');
      return;
    }

    try {
      const res = await fetch('/api/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId,
          adjustmentType,
          reason,
          userName: currentUser.name,
          lines: lines.map((l) => ({
            itemId: l.itemId,
            currentQty: l.currentQty,
            adjustmentQty: l.adjustmentQty,
            reason,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', `สร้างใบขอปรับปรุงยอดเลขที่ ${data.adjustmentNumber} เรียบร้อยแล้ว (รออนุมัติ)`);
      setShowCreateModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleApproveAdjustment = async (adjId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/adjustments/${adjId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userName: currentUser.name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');

      addToast(
        'success',
        `${action === 'APPROVE' ? 'อนุมัติและปรับปรุงยอดคงคลังสำเร็จ' : 'ปฏิเสธคำขอปรับปรุงยอด'}`
      );
      setShowDetailModal(null);
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
            <SlidersHorizontal className="w-5 h-5 text-amber-600" />
            ระบบปรับปรุงยอดสินค้าคงคลัง (Stock Adjustment)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            ปรับปรุงยอดกรณี: เพิ่ม/ลด, สินค้าชำรุด (Damaged), หมดอายุ (Expired), สูญหาย (Lost), หรือแก้ไขยอดนับ (Correction) • ต้องผ่านการอนุมัติก่อนตัดสต็อก
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างใบขอปรับปรุงยอด (New Adjustment)</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่เอกสาร (ADJ No.)</th>
                <th className="py-3 px-3">คลังสินค้า</th>
                <th className="py-3 px-3">ประเภทการปรับปรุง</th>
                <th className="py-3 px-3 text-right">จำนวนรายการ</th>
                <th className="py-3 px-3">เหตุผล</th>
                <th className="py-3 px-3">ผู้ยื่นคำขอ</th>
                <th className="py-3 px-3">ผู้อนุมัติ</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-amber-600 mb-2" />
                    กำลังดึงข้อมูลใบปรับยอด...
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    ยังไม่มีรายการขอปรับปรุงยอด
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    className="hover:bg-amber-50/40 transition-colors group cursor-pointer"
                    onClick={() => setShowDetailModal(adj)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      <span className="hover:underline bg-amber-50 group-hover:bg-amber-100 text-amber-800 px-2 py-0.5 rounded transition-colors">
                        {adj.adjustmentNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#14213D] whitespace-nowrap">
                      {adj.warehouse.name}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {adj.adjustmentType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {adj.lines.length} รายการ
                    </td>
                    <td className="py-3 px-3 text-[#64748B] truncate max-w-[200px]" title={adj.reason}>
                      {adj.reason}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">
                      {adj.requestedBy}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">
                      {adj.approvedBy || '-'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={adj.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setShowDetailModal(adj)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูรายละเอียด & อนุมัติ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Adjustment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-3xl w-full p-6 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <h3 className="text-sm font-bold text-[#14213D]">สร้างใบขอปรับปรุงยอดสต็อก (New Stock Adjustment)</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#64748B] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">คลังสินค้าที่ต้องการปรับปรุง *</label>
                  <select
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
                  <label className="block text-xs font-semibold text-[#334155] mb-1">ประเภทการปรับปรุง (Type) *</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-semibold"
                  >
                    <option value="DAMAGED">สินค้าชำรุดเสียหาย (DAMAGED)</option>
                    <option value="EXPIRED">สินค้าหมดอายุรอตัดทำลาย (EXPIRED)</option>
                    <option value="LOST">สินค้าสูญหาย (LOST)</option>
                    <option value="INCREASE">ปรับเพิ่มยอด (INCREASE)</option>
                    <option value="DECREASE">ปรับลดยอด (DECREASE)</option>
                    <option value="CORRECTION">แก้ไขผลต่างนับ (CORRECTION)</option>
                  </select>
                </div>
              </div>

              {/* Lines */}
              <div className="border border-[#E2EAF4] rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-[#F5F8FC] border-b border-[#E2EAF4] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155]">รายการสินค้าที่จะปรับยอด</span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-[11px] px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-md font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มรายการ
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#F5F8FC] p-2.5 rounded-lg border border-[#E2EAF4]">
                      <div className="flex-1">
                        <select
                          required
                          value={line.itemId}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-medium"
                        >
                          <option value="">-- เลือกรายการสินค้า --</option>
                          {items.map((it) => (
                            <option key={it.id} value={it.id}>
                              [{it.itemCode}] {it.itemName} ({it.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24 text-right">
                        <div className="text-[10px] text-[#94A3B8]">คงเหลือก่อนปรับ:</div>
                        <div className="text-xs font-bold text-[#14213D] tabular-nums">
                          {line.currentQty} {line.unit}
                        </div>
                      </div>

                      <div className="w-28">
                        <label className="text-[10px] text-[#94A3B8] block text-right">ปรับ (+/-):</label>
                        <input
                          type="number"
                          required
                          value={line.adjustmentQty}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].adjustmentQty = parseFloat(e.target.value) || 0;
                            setLines(updated);
                          }}
                          className={`w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold tabular-nums ${
                            line.adjustmentQty > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        />
                      </div>

                      <div className="w-24 text-right">
                        <div className="text-[10px] text-[#94A3B8]">ยอดใหม่สุทธิ:</div>
                        <div className="text-xs font-bold text-blue-700 tabular-nums">
                          {line.currentQty + line.adjustmentQty}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-[#94A3B8] hover:text-rose-600 p-1 mt-3"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">
                  เหตุผลและความจำเป็นในการปรับปรุงยอด *
                </label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น กล่องบรรจุภัณฑ์เปียกชื้น ฉีกขาดระหว่างขนส่ง หรือตรวจพบส่วนต่าง..."
                  className="w-full text-xs p-2.5 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg focus:ring-2 focus:ring-amber-500"
                />
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  ส่งขออนุมัติปรับยอด (Submit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Full-Screen Stock Adjustment Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs shrink-0">
                  <SlidersHorizontal className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Adjustment Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{showDetailModal.adjustmentNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(showDetailModal.adjustmentNumber);
                          addToast('info', `คัดลอกเลขที่ ${showDetailModal.adjustmentNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่ใบปรับปรุงยอด"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={showDetailModal.status} />

                    <span className="bg-slate-100 text-[#475569] border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium font-mono">
                      {showDetailModal.adjustmentType}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      บันทึกการขอปรับปรุงยอดสต็อกคงคลัง
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Stock Adjustment Full Specification)
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
                  title="พิมพ์เอกสารใบปรับยอด"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {showDetailModal.status === 'PENDING_APPROVAL' && (
                  <button
                    onClick={() => handleApproveAdjustment(showDetailModal.id, 'APPROVE')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>อนุมัติ & ตัดปรับยอดสต็อก</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDetailModal(null)}
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
                    <span>คลังสินค้าที่ปรับยอด</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showDetailModal.warehouse?.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    รหัสคลัง: {showDetailModal.warehouse?.code || '-'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                    <span>ประเภทการปรับปรุง</span>
                  </div>
                  <div className="font-bold text-amber-800 text-sm mt-1">
                    {showDetailModal.adjustmentType === 'DAMAGED'
                      ? 'สินค้าชำรุดเสียหาย'
                      : showDetailModal.adjustmentType === 'EXPIRED'
                      ? 'สินค้าหมดอายุ'
                      : showDetailModal.adjustmentType === 'FOUND'
                      ? 'พบสินค้าเกินจากการตรวจนับ'
                      : showDetailModal.adjustmentType}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ตามระเบียบพัสดุและคลัง
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ผู้ยื่นขอ & ผู้อนุมัติ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showDetailModal.requestedBy}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ผู้อนุมัติ: {showDetailModal.approvedBy || 'รอการอนุมัติ'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs bg-gradient-to-br from-white to-amber-50/40">
                  <div className="text-[11px] font-medium text-amber-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>จำนวนรายการพัสดุ</span>
                  </div>
                  <div className="font-bold text-amber-900 text-xl mt-1 tabular-nums">
                    {showDetailModal.lines?.length || 0} <span className="text-xs font-normal text-amber-700">รายการ</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">สถานะ: {showDetailModal.status}</div>
                </div>
              </div>

              {/* Remarks / Reason Callout */}
              {showDetailModal.reason && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-amber-900">เหตุผลความจำเป็นในการปรับยอด: </span>
                    <span className="text-[#334155]">{showDetailModal.reason}</span>
                  </div>
                </div>
              )}

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-xs text-[#14213D]">
                      รายการพัสดุและผลการปรับปรุงยอด ({showDetailModal.lines?.length || 0} รายการ)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    เปรียบเทียบยอดคงเหลือก่อนและหลังการปรับปรุง
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F5F8FC] text-[#64748B] uppercase font-semibold text-[10px] tracking-wider border-b border-[#E2EAF4]">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">ลำดับ</th>
                        <th className="py-2.5 px-3">รหัสพัสดุ</th>
                        <th className="py-2.5 px-3">ชื่อรายการเวชภัณฑ์ / พัสดุ</th>
                        <th className="py-2.5 px-3 text-center">หน่วย</th>
                        <th className="py-2.5 px-3 text-right">ยอดเดิมในระบบ</th>
                        <th className="py-2.5 px-3 text-right">จำนวนที่ปรับ (+/-)</th>
                        <th className="py-2.5 px-3 text-right text-blue-700">ยอดใหม่สุทธิ</th>
                        <th className="py-2.5 px-3">หมายเหตุรายการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showDetailModal.lines && showDetailModal.lines.length > 0 ? (
                        showDetailModal.lines.map((l: any, idx: number) => {
                          const item = l.item || {};
                          return (
                            <tr key={l.id || idx} className="hover:bg-[#F5F8FC] transition-colors">
                              <td className="py-2.5 px-4 text-center font-mono text-[#94A3B8]">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                                {item.itemCode || '-'}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#14213D]">
                                {item.itemName || 'รายการพัสดุ'}
                                {item.genericName && (
                                  <div className="text-[10px] text-[#94A3B8] italic">
                                    {item.genericName}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center text-[#64748B]">
                                {item.unit || l.unit || 'ชิ้น'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-[#64748B] tabular-nums">
                                {l.currentQty?.toLocaleString()}
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                                  l.adjustmentQty > 0 ? 'text-emerald-600' : 'text-rose-600'
                                }`}
                              >
                                {l.adjustmentQty > 0 ? `+${l.adjustmentQty}` : l.adjustmentQty}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-blue-700 tabular-nums">
                                {((l.currentQty || 0) + (l.adjustmentQty || 0)).toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-[#64748B]">
                                {l.reason || showDetailModal.reason || '-'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-[#94A3B8]">
                            ไม่พบรายการสินค้าในใบปรับปรุงยอดนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual Workflow Steps */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                <h4 className="text-xs font-bold text-[#14213D] mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>ขั้นตอนการปรับปรุงยอดสต็อก (Stock Adjustment Workflow Timeline)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. ยื่นคำขอปรับยอด</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ระบุสินค้า, ยอดปรับ, และเหตุผล
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status === 'APPROVED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {showDetailModal.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>2. ตรวจสอบและอนุมัติ</span>
                    </div>
                    <div className="text-[11px] mt-1">
                      {showDetailModal.approvedBy
                        ? `อนุมัติโดย: ${showDetailModal.approvedBy}`
                        : 'รอผู้มีอำนาจอนุมัติ'}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status === 'APPROVED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3. ตัดปรับยอดสต็อกจริง</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      {showDetailModal.status === 'APPROVED'
                        ? 'ปรับยอด On Hand & Available เรียบร้อย'
                        : 'รอยืนยันการอนุมัติ'}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status === 'APPROVED'
                        ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>4. บันทึก Stock Card & Audit</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      บันทึกประวัติการปรับปรุงลง Audit Log
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
                    {showDetailModal.lines?.length || 0}
                  </strong>{' '}
                  รายการ
                </span>
                <span>•</span>
                <span>
                  สถานะ:{' '}
                  <strong className="text-amber-900 font-bold">
                    {showDetailModal.status}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-[#334155] font-semibold rounded-xl text-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
                {showDetailModal.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleApproveAdjustment(showDetailModal.id, 'REJECT')}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      ไม่อนุมัติ
                    </button>
                    <button
                      onClick={() => handleApproveAdjustment(showDetailModal.id, 'APPROVE')}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>อนุมัติ & ตัดปรับสต็อก (Post Adjustment)</span>
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
