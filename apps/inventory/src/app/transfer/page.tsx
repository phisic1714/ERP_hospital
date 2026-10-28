'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@erp/app-context';
import {
  ArrowLeftRight,
  Plus,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Building,
  RefreshCw,
  Send,
  PackageCheck,
  Eye,
  Copy,
  Printer,
  X,
  Clock,
  Calendar,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';

export default function StockTransferPage() {
  const { currentUser, addToast, refreshKey, triggerRefresh } = useApp();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any | null>(null);

  // Form states
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [remark, setRemark] = useState('');
  const [lines, setLines] = useState<any[]>([
    { itemId: '', requestedQty: 1, lotNumber: '', availableStock: 0 },
  ]);

  const loadData = () => {
    setLoading(true);
    fetch('/api/transfers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTransfers(data);
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
          if (whs.length >= 2) {
            setSourceWarehouseId(whs[0].id);
            setDestinationWarehouseId(whs[1].id);
          }
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
    const sb = it.stockBalances?.find((b: any) => b.warehouseId === sourceWarehouseId);
    const available = sb ? sb.available : 0;

    const updated = [...lines];
    updated[idx].itemId = itemId;
    updated[idx].availableStock = available;
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { itemId: '', requestedQty: 1, lotNumber: '', availableStock: 0 }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== idx));
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceWarehouseId === destinationWarehouseId) {
      addToast('error', 'คลังต้นทางและปลายทางต้องไม่เหมือนกัน');
      return;
    }

    try {
      const payload = {
        sourceWarehouseId,
        destinationWarehouseId,
        transferDate: new Date(),
        remark,
        userName: currentUser.name,
        lines: lines.map((l) => ({
          itemId: l.itemId,
          requestedQty: l.requestedQty,
        })),
      };

      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');

      addToast('success', `สร้างใบขอโอนย้ายเลขที่ ${result.transferNumber} เรียบร้อยแล้ว`);
      setShowCreateModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleApprove = async (transferId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/transfers/${transferId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userName: currentUser.name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');
      addToast('success', `${action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}การโอนย้ายเรียบร้อย`);
      setShowDetailModal(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDispatch = async (transferId: string) => {
    if (!confirm('ยืนยันการจัดส่งพัสดุออกจากคลังต้นทาง? (ตัด On Hand ต้นทาง และปรับสถานะเป็น In Transit)')) return;

    try {
      const res = await fetch(`/api/transfers/${transferId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: currentUser.name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to dispatch');
      addToast('success', 'สินค้าถูกจัดส่งเรียบร้อยแล้ว (สถานะ In Transit กำลังเดินทาง)');
      setShowDetailModal(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleReceive = async (transferId: string) => {
    if (!confirm('ยืนยันการรับพัสดุเข้าคลังปลายทางเรียบร้อย? (ลด In Transit และเพิ่ม On Hand คลังปลายทาง)')) return;

    try {
      const res = await fetch(`/api/transfers/${transferId}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: currentUser.name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to receive');
      addToast('success', 'คลังปลายทางยืนยันรับเข้าสต็อกเสร็จสมบูรณ์');
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
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            ระบบโอนย้ายสินค้าระหว่างคลัง (Stock Transfer)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            ติดตามสถานะ Source Stock ➔ In Transit (ระหว่างขนส่ง) ➔ Destination Stock และตรวจสอบผลต่าง (Discrepancy)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างใบโอนย้าย (New Transfer)</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ใบโอน (TRF No.)</th>
                <th className="py-3 px-3">คลังต้นทาง (Source)</th>
                <th className="py-3 px-3">คลังปลายทาง (Dest)</th>
                <th className="py-3 px-3 text-right">จำนวนรายการ</th>
                <th className="py-3 px-3">วันที่โอน</th>
                <th className="py-3 px-3">ผู้จัดส่ง</th>
                <th className="py-3 px-3">ผู้รับปลายทาง</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-indigo-600 mb-2" />
                    กำลังดึงข้อมูลใบโอนย้าย...
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    ยังไม่มีรายการโอนย้ายพัสดุ
                  </td>
                </tr>
              ) : (
                transfers.map((trf) => (
                  <tr
                    key={trf.id}
                    className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                    onClick={() => setShowDetailModal(trf)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      <span className="hover:underline bg-indigo-50 group-hover:bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded transition-colors">
                        {trf.transferNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#14213D] whitespace-nowrap">
                      {trf.sourceWarehouse.name}
                    </td>
                    <td className="py-3 px-3 font-semibold text-indigo-700 whitespace-nowrap">
                      {trf.destWarehouse.name}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {trf.lines.length} รายการ
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[#64748B]">
                      {new Date(trf.transferDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">
                      {trf.dispatchedBy || '-'}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">
                      {trf.receivedBy || '-'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={trf.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setShowDetailModal(trf)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูรายละเอียด</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Transfer */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-3xl w-full p-6 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  สร้างใบโอนย้ายพัสดุระหว่างคลัง (New Stock Transfer)
                </h3>
                <p className="text-xs text-[#64748B]">
                  โอนสินค้าจากคลังต้นทางไปยังคลังปลายทาง พร้อมควบคุม In Transit
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#64748B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    คลังต้นทาง (Source) *
                  </label>
                  <select
                    value={sourceWarehouseId}
                    onChange={(e) => setSourceWarehouseId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    คลังปลายทาง (Destination) *
                  </label>
                  <select
                    value={destinationWarehouseId}
                    onChange={(e) => setDestinationWarehouseId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lines */}
              <div className="border border-[#E2EAF4] rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-[#F5F8FC] border-b border-[#E2EAF4] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155]">รายการสินค้าที่จะโอนย้าย</span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-[11px] px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-semibold flex items-center gap-1"
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
                        <div className="text-[10px] text-[#94A3B8]">พร้อมจ่าย:</div>
                        <div className="text-xs font-bold text-blue-700 tabular-nums">
                          {line.availableStock}
                        </div>
                      </div>

                      <div className="w-24">
                        <label className="text-[10px] text-[#94A3B8] block text-right">จำนวนโอน:</label>
                        <input
                          type="number"
                          min="1"
                          max={line.availableStock || 99999}
                          required
                          value={line.requestedQty}
                          onChange={(e) => {
                            const updated = [...lines];
                            updated[idx].requestedQty = parseFloat(e.target.value) || 0;
                            setLines(updated);
                          }}
                          className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded text-right font-bold"
                        />
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
                  หมายเหตุ / วัตถุประสงค์การโอนย้าย
                </label>
                <textarea
                  rows={2}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="เช่น เติมสต็อกฉุกเฉินประจำสัปดาห์..."
                  className="w-full text-xs p-2.5 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  สร้างใบโอนย้าย (Submit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Full-Screen Stock Transfer Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
                  <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Transfer Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{showDetailModal.transferNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(showDetailModal.transferNumber);
                          addToast('info', `คัดลอกเลขที่ ${showDetailModal.transferNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่ใบโอนย้าย"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={showDetailModal.status} />
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      บันทึกการโอนย้ายพัสดุและเวชภัณฑ์ระหว่างคลังสินค้า
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Inter-Warehouse Transfer Full Details)
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
                  title="พิมพ์เอกสารใบโอนย้าย"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {showDetailModal.status === 'APPROVED' && (
                  <button
                    onClick={() => handleDispatch(showDetailModal.id)}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>จัดส่ง (In-Transit)</span>
                  </button>
                )}

                {showDetailModal.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleReceive(showDetailModal.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>รับเข้าคลังปลายทาง</span>
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
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    <span>คลังต้นทาง ➔ ปลายทาง</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-xs mt-1">
                    {showDetailModal.sourceWarehouse?.name}
                  </div>
                  <div className="text-xs font-bold text-indigo-700 mt-0.5">
                    ➔ {showDetailModal.destWarehouse?.name}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>วันที่ทำรายการ & ผู้จัดทำ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {new Date(showDetailModal.transferDate).toLocaleDateString('th-TH')}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ผู้เปิดคำขอ: {showDetailModal.createdBy}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-purple-600" />
                    <span>ผู้จัดส่ง & ผู้รับปลายทาง</span>
                  </div>
                  <div className="text-xs text-[#334155] mt-1">
                    จัดส่ง: <strong className="text-[#14213D]">{showDetailModal.dispatchedBy || 'ยังไม่จัดส่ง'}</strong>
                  </div>
                  <div className="text-xs text-[#334155] mt-0.5">
                    รับมอบ: <strong className="text-[#14213D]">{showDetailModal.receivedBy || 'ยังไม่ได้รับ'}</strong>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-2xs bg-gradient-to-br from-white to-indigo-50/40">
                  <div className="text-[11px] font-medium text-indigo-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                    <span>จำนวนรายการโอนย้าย</span>
                  </div>
                  <div className="font-bold text-indigo-900 text-xl mt-1 tabular-nums">
                    {showDetailModal.lines?.length || 0} <span className="text-xs font-normal text-indigo-700">รายการ</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">สถานะ: {showDetailModal.status}</div>
                </div>
              </div>

              {/* Remarks Callout */}
              {showDetailModal.remark && (
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-indigo-900">หมายเหตุการโอนย้าย: </span>
                    <span className="text-[#334155]">{showDetailModal.remark}</span>
                  </div>
                </div>
              )}

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-[#14213D]">
                      รายการพัสดุที่โอนย้าย ({showDetailModal.lines?.length || 0} รายการ)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    ติดตามยอดจัดส่ง และ ยอดที่รับเข้าปลายทางจริง
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
                        <th className="py-2.5 px-3 text-right">จำนวนขอโอน</th>
                        <th className="py-2.5 px-3 text-right text-indigo-700">จัดส่งแล้ว (Dispatched)</th>
                        <th className="py-2.5 px-3 text-right text-emerald-700">ปลายทางรับแล้ว (Received)</th>
                        <th className="py-2.5 px-3 text-center">สถานะรายการ</th>
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
                                {item.unit || 'ชิ้น'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#14213D] tabular-nums">
                                {l.requestedQty?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-indigo-700 tabular-nums">
                                {l.dispatchedQty > 0 ? l.dispatchedQty.toLocaleString() : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                                {l.receivedQty > 0 ? l.receivedQty.toLocaleString() : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    l.receivedQty > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : l.dispatchedQty > 0
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-100 text-[#64748B]'
                                  }`}
                                >
                                  {l.receivedQty > 0
                                    ? 'รับครบแล้ว'
                                    : l.dispatchedQty > 0
                                    ? 'กำลังเดินทาง'
                                    : 'รอจัดส่ง'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-[#94A3B8]">
                            ไม่พบรายการสินค้าในใบโอนย้ายนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual 4-Step Transfer Workflow Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                <h4 className="text-xs font-bold text-[#14213D] mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>ขั้นตอนการโอนย้ายระหว่างคลัง (Stock Transfer Workflow Timeline)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. ยื่นขอโอน (Draft)</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ระบุคลังต้นทางและปลายทาง
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status !== 'PENDING_APPROVAL'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {showDetailModal.status !== 'PENDING_APPROVAL' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>2. อนุมัติการโอน</span>
                    </div>
                    <div className="text-[11px] mt-1">
                      {showDetailModal.status !== 'PENDING_APPROVAL'
                        ? 'อนุมัติเรียบร้อย'
                        : 'รอผู้จัดการคลังอนุมัติ'}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status === 'COMPLETED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : showDetailModal.status === 'IN_TRANSIT'
                        ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Send className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>3. จัดส่ง (In-Transit)</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      {showDetailModal.dispatchedBy
                        ? `จัดส่งโดย: ${showDetailModal.dispatchedBy}`
                        : 'ตัดยอดต้นทางเข้า In-Transit'}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status === 'COMPLETED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>4. ปลายทางรับเข้าสต็อก</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      {showDetailModal.receivedBy
                        ? `รับโดย: ${showDetailModal.receivedBy}`
                        : 'ปรับสถานะและเพิ่มยอดคลังปลายทาง'}
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
                  <strong className="text-indigo-900 font-bold">
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
                      onClick={() => handleApprove(showDetailModal.id, 'REJECT')}
                      className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold"
                    >
                      ไม่อนุมัติ
                    </button>
                    <button
                      onClick={() => handleApprove(showDetailModal.id, 'APPROVE')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                    >
                      อนุมัติการโอนย้าย
                    </button>
                  </>
                )}

                {showDetailModal.status === 'APPROVED' && (
                  <button
                    onClick={() => handleDispatch(showDetailModal.id)}
                    className="px-5 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>จัดส่งสินค้า (Dispatch to In-Transit)</span>
                  </button>
                )}

                {showDetailModal.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleReceive(showDetailModal.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>คลังปลายทางยืนยันรับเข้าสต็อก (Receive)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
