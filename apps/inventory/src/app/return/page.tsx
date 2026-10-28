'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@erp/app-context';
import {
  RotateCcw,
  Plus,
  CheckCircle,
  AlertTriangle,
  Building,
  RefreshCw,
  Search,
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
import { StatusBadge } from '@erp/ui';

export default function StockReturnPage() {
  const { currentUser, addToast, refreshKey, triggerRefresh } = useApp();
  const [returns, setReturns] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState<any | null>(null);

  // Form
  const [returnType, setReturnType] = useState('DEPT_RETURN');
  const [departmentId, setDepartmentId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [originalDocumentNumber, setOriginalDocumentNumber] = useState('');
  const [reason, setReason] = useState('');
  const [lines, setLines] = useState<any[]>([
    { itemId: '', returnQty: 5, condition: 'GOOD', lotNumber: '', reason: '' },
  ]);

  const loadData = () => {
    setLoading(true);
    fetch('/api/returns')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReturns(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    fetch('/api/departments').then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) {
        setDepartments(d);
        if (d.length > 0) setDepartmentId(d[0].id);
      }
    });
    fetch('/api/warehouses').then((r) => r.json()).then((w) => {
      if (Array.isArray(w)) {
        setWarehouses(w);
        if (w.length > 0) setWarehouseId(w[0].id);
      }
    });
    fetch('/api/items').then((r) => r.json()).then((its) => {
      if (Array.isArray(its)) setItems(its);
    });
  }, [refreshKey]);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnType,
          departmentId: returnType === 'DEPT_RETURN' ? departmentId : null,
          warehouseId,
          originalDocumentNumber,
          reason,
          userName: currentUser.name,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', `สร้างใบคืนพัสดุเลขที่ ${data.returnNumber} เรียบร้อยแล้ว (รอการตรวจรับสภาพ)`);
      setShowCreateModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handlePostReturn = async (returnId: string) => {
    if (!confirm('ยืนยันผลการตรวจสอบสภาพสินค้าและรับกลับเข้าคลังพัสดุ?')) return;

    try {
      const res = await fetch(`/api/returns/${returnId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser.name,
          inspectionResult: 'ผ่านการตรวจสอบสภาพสมบูรณ์ รับเข้าสต็อกพร้อมจ่ายเรียบร้อย',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', 'บันทึกรับคืนสินค้าเข้าคลังและปรับยอดสต็อกเรียบร้อยแล้ว');
      setShowInspectModal(null);
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
            <RotateCcw className="w-5 h-5 text-purple-600" />
            ระบบรับคืนสินค้าและส่งคืนคู่ค้า (Stock Return Management)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            รองรับ: คืนสินค้าจากแผนก (Return from Dept) และส่งคืนผู้จัดจำหน่าย (Return to Supplier) • สินค้าต้องผ่านการตรวจสอบสภาพก่อนกลับเข้า Available Stock
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างใบคืนสินค้า (New Return)</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ใบคืน (RET No.)</th>
                <th className="py-3 px-3">ประเภท</th>
                <th className="py-3 px-3">แผนก / คู่ค้า</th>
                <th className="py-3 px-3">คลังรับคืน</th>
                <th className="py-3 px-3 text-right">จำนวนรายการ</th>
                <th className="py-3 px-3">เหตุผล</th>
                <th className="py-3 px-3">วันที่</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-purple-600 mb-2" />
                    กำลังดึงข้อมูลใบคืนสินค้า...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    ยังไม่มีข้อมูลใบคืนสินค้า
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr
                    key={ret.id}
                    className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                    onClick={() => setShowInspectModal(ret)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">
                      <span className="hover:underline bg-purple-50 group-hover:bg-purple-100 text-purple-800 px-2 py-0.5 rounded transition-colors">
                        {ret.returnNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {ret.returnType === 'DEPT_RETURN' ? 'คืนจากแผนก' : 'คืนให้คู่ค้า'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-[#14213D] whitespace-nowrap">
                      {ret.department?.name || ret.supplier?.name || '-'}
                    </td>
                    <td className="py-3 px-3 text-[#334155] whitespace-nowrap">
                      {ret.warehouse.name}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {ret.lines.length} รายการ
                    </td>
                    <td className="py-3 px-3 text-[#64748B] truncate max-w-[200px]" title={ret.reason}>
                      {ret.reason || '-'}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                      {new Date(ret.returnDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={ret.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setShowInspectModal(ret)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{ret.status === 'PENDING_INSPECTION' ? 'ตรวจสภาพ & รับคืน' : 'ดูรายละเอียด'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Return */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-2xl w-full p-6 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <h3 className="text-sm font-bold text-[#14213D]">สร้างใบคืนสินค้า (New Stock Return)</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#64748B] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">ประเภทการคืน *</label>
                  <select
                    value={returnType}
                    onChange={(e) => setReturnType(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                  >
                    <option value="DEPT_RETURN">คืนจากแผนกเข้าคลัง (Return from Department)</option>
                    <option value="SUPPLIER_RETURN">คืนสินค้าให้ผู้จัดจำหน่าย (Return to Supplier)</option>
                  </select>
                </div>

                {returnType === 'DEPT_RETURN' ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">แผนกที่ส่งคืน *</label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">คลังที่รับคืน *</label>
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
                )}

                {returnType === 'DEPT_RETURN' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">คลังที่รับคืน *</label>
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
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">อ้างอิงเลขที่ใบเบิกเดิม</label>
                  <input
                    type="text"
                    placeholder="เช่น ISS-202610-0002"
                    value={originalDocumentNumber}
                    onChange={(e) => setOriginalDocumentNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-[#E2EAF4] rounded-xl p-3 bg-[#F5F8FC] space-y-2">
                <div className="text-xs font-bold text-[#334155] mb-1">รายการสินค้าที่ส่งคืน</div>
                {lines.map((l, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#E2EAF4]">
                    <div className="flex-1">
                      <select
                        required
                        value={l.itemId}
                        onChange={(e) => {
                          const updated = [...lines];
                          updated[idx].itemId = e.target.value;
                          setLines(updated);
                        }}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#F5F8FC] border border-slate-300 rounded font-medium"
                      >
                        <option value="">-- เลือกรายการสินค้า --</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            [{it.itemCode}] {it.itemName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="text-[10px] text-[#94A3B8] block text-right">จำนวนคืน:</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={l.returnQty}
                        onChange={(e) => {
                          const updated = [...lines];
                          updated[idx].returnQty = parseFloat(e.target.value) || 0;
                          setLines(updated);
                        }}
                        className="w-full text-xs px-2 py-1 bg-[#F5F8FC] border border-slate-300 rounded text-right font-bold"
                      />
                    </div>

                    <div className="w-28">
                      <label className="text-[10px] text-[#94A3B8] block">สภาพสินค้า:</label>
                      <select
                        value={l.condition}
                        onChange={(e) => {
                          const updated = [...lines];
                          updated[idx].condition = e.target.value;
                          setLines(updated);
                        }}
                        className="w-full text-xs px-2 py-1 bg-[#F5F8FC] border border-slate-300 rounded"
                      >
                        <option value="GOOD">สมบูรณ์ (Good)</option>
                        <option value="DAMAGED">ชำรุด (Damaged)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">สาเหตุการส่งคืน</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="เช่น เบิกเกินจำนวนที่ใช้งานจริงสำหรับคลินิกพิเศษ..."
                  className="w-full text-xs p-2.5 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  บันทึกใบคืนสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Full-Screen Stock Return Detail & Inspection Modal */}
      {showInspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs shrink-0">
                  <RotateCcw className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Return Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{showInspectModal.returnNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(showInspectModal.returnNumber);
                          addToast('info', `คัดลอกเลขที่ ${showInspectModal.returnNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่ใบคืน"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={showInspectModal.status} />

                    <span className="bg-slate-100 text-[#475569] border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {showInspectModal.returnType === 'DEPT_RETURN' ? 'คืนจากแผนกเข้าคลัง' : 'คืนคู่ค้า'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      บันทึกการส่งคืนพัสดุและตรวจรับสภาพเข้าคลัง
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Stock Return & Condition Inspection Full Report)
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
                  title="พิมพ์เอกสารใบคืน"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {showInspectModal.status === 'PENDING_INSPECTION' && (
                  <button
                    type="button"
                    onClick={() => handlePostReturn(showInspectModal.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ตรวจสภาพ & Post รับคืน</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowInspectModal(null)}
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
                    <Building className="w-3.5 h-3.5 text-purple-600" />
                    <span>แผนกผู้ส่งคืน / คู่ค้า</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showInspectModal.department?.name || showInspectModal.supplier?.name || '-'}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ประเภท: {showInspectModal.returnType === 'DEPT_RETURN' ? 'คืนจากแผนก' : 'คืนผู้จำหน่าย'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>คลังสินค้ารับคืน</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showInspectModal.warehouse?.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    วันที่ส่งคืน: {new Date(showInspectModal.returnDate).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ผู้บันทึก & เอกสารเดิม</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showInspectModal.createdBy}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                    อ้างอิง: {showInspectModal.originalDocumentNumber || '-'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-2xs bg-gradient-to-br from-white to-purple-50/40">
                  <div className="text-[11px] font-medium text-purple-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-600" />
                    <span>จำนวนรายการส่งคืน</span>
                  </div>
                  <div className="font-bold text-purple-900 text-xl mt-1 tabular-nums">
                    {showInspectModal.lines?.length || 0} <span className="text-xs font-normal text-purple-700">รายการ</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">สถานะ: {showInspectModal.status}</div>
                </div>
              </div>

              {/* Remarks / Reason Callout */}
              {showInspectModal.reason && (
                <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-purple-900">เหตุผลความจำเป็นในการส่งคืน: </span>
                    <span className="text-[#334155]">{showInspectModal.reason}</span>
                  </div>
                </div>
              )}

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-xs text-[#14213D]">
                      รายการพัสดุและผลการตรวจสภาพ ({showInspectModal.lines?.length || 0} รายการ)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    แยกประเภทสินค้าสภาพสมบูรณ์พร้อมใช้ กับ สินค้าชำรุดรอจำหน่ายออก
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
                        <th className="py-2.5 px-3 text-right">จำนวนคืน</th>
                        <th className="py-2.5 px-3">Lot Number</th>
                        <th className="py-2.5 px-3 text-center">สภาพสินค้า (Condition)</th>
                        <th className="py-2.5 px-3">สาเหตุเฉพาะรายการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showInspectModal.lines && showInspectModal.lines.length > 0 ? (
                        showInspectModal.lines.map((l: any, idx: number) => {
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
                              <td className="py-2.5 px-3 text-right font-bold text-purple-800 tabular-nums">
                                {l.returnQty?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[#334155]">
                                {l.lotNumber || '-'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    l.condition === 'GOOD'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {l.condition === 'GOOD' ? 'สมบูรณ์ (พร้อมใช้)' : 'ชำรุด/หมดอายุ'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[#64748B]">
                                {l.reason || '-'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-[#94A3B8]">
                            ไม่พบรายการสินค้าในใบคืนนี้
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
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>ขั้นตอนการรับคืนสินค้า (Stock Return Workflow Timeline)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. ยื่นคำขอคืน (Submitted)</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ระบุรายการและสาเหตุการคืน
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2. ตรวจสอบสภาพ</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      แยกพัสดุพร้อมใช้ หรือ ชำรุด
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showInspectModal.status === 'COMPLETED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {showInspectModal.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>3. Post รับคืนเข้าคลัง</span>
                    </div>
                    <div className="text-[11px] mt-1">
                      {showInspectModal.status === 'COMPLETED'
                        ? 'ปรับยอดสต็อกเข้า On Hand แล้ว'
                        : 'รอยืนยันการตัดรับเข้าคลัง'}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showInspectModal.status === 'COMPLETED'
                        ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>4. บันทึกประวัติ Stock Card</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      สร้าง Movement ประเภท RETURN_IN
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
                    {showInspectModal.lines?.length || 0}
                  </strong>{' '}
                  รายการ
                </span>
                <span>•</span>
                <span>
                  สถานะ:{' '}
                  <strong className="text-purple-900 font-bold">
                    {showInspectModal.status}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInspectModal(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-[#334155] font-semibold rounded-xl text-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
                {showInspectModal.status === 'PENDING_INSPECTION' && (
                  <button
                    type="button"
                    onClick={() => handlePostReturn(showInspectModal.id)}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ยืนยันตรวจสภาพ & รับคืนเข้าคลัง (Post Return)</span>
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
