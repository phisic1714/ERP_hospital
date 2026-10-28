'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Copy,
  Printer,
  X,
  Layers,
  CheckCircle2,
  Package,
  ExternalLink,
  FileText,
} from 'lucide-react';

function StockCardContent() {
  const searchParams = useSearchParams();
  const initialItemId = searchParams.get('itemId') || '';
  const initialWarehouseId = searchParams.get('warehouseId') || '';

  const { selectedWarehouse, refreshKey, addToast } = useApp();
  const [movements, setMovements] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Full-screen Movement Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any | null>(null);

  // Filters
  const [selectedItemId, setSelectedItemId] = useState(initialItemId);
  const [selectedWhId, setSelectedWhId] = useState(initialWarehouseId || selectedWarehouse || '');
  const [movementType, setMovementType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/items').then((r) => r.json()).then((d) => Array.isArray(d) && setItems(d));
    fetch('/api/warehouses').then((r) => r.json()).then((d) => Array.isArray(d) && setWarehouses(d));
  }, []);

  const loadMovements = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedItemId) params.set('itemId', selectedItemId);
    if (selectedWhId) params.set('warehouseId', selectedWhId);
    if (movementType) params.set('movementType', movementType);
    if (search) params.set('search', search);

    fetch(`/api/stock/card?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMovements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMovements();
  }, [selectedItemId, selectedWhId, movementType, search, refreshKey]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <History className="w-5 h-5 text-[#2563EB]" />
            บัตรสต็อกสินค้าและประวัติความเคลื่อนไหว (Stock Card & Movements)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            บันทึกการรับเข้า จ่ายออก โอนย้าย และปรับยอดพัสดุแบบเรียลไทม์ ตรวจสอบย้อนกลับได้ทุกธุรกรรม
          </p>
        </div>

        <button
          onClick={() => {
            const csvContent =
              '\uFEFF' +
              [
                'วันที่,เลขที่เอกสาร,ประเภท,รหัสสินค้า,ชื่อสินค้า,Lot Number,จำนวน,คงเหลือก่อน,คงเหลือหลัง,ผู้บันทึก,หมายเหตุ',
                ...movements.map(
                  (m) =>
                    `"${new Date(m.createdAt).toLocaleString('th-TH')}","${m.documentNumber}","${m.movementType}","${m.item.itemCode}","${m.item.itemName}","${m.lotNumber || '-'}","${m.quantity}","${m.balanceBefore}","${m.balanceAfter}","${m.createdBy}","${m.remark || '-'}"`
                ),
              ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Stock_Card_${Date.now()}.csv`);
            link.click();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ส่งออก Stock Card CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAF4] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">ค้นหาเลขที่เอกสาร / สินค้า</label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="เช่น GR-202610, ISS-..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
              />
            </div>
          </div>

          {/* Item filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">กรองตามรายการสินค้า</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer"
            >
              <option value="">ทุกรายการสินค้า (All Items)</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  [{it.itemCode}] {it.itemName}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">คลังสินค้า</label>
            <select
              value={selectedWhId}
              onChange={(e) => setSelectedWhId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer"
            >
              <option value="">ทุกคลังสินค้า (All Warehouses)</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] mb-1">ประเภทการเคลื่อนไหว</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer"
            >
              <option value="">ทุกประเภท (All Types)</option>
              <option value="RECEIVE">รับเข้าจากจัดซื้อ (RECEIVE)</option>
              <option value="ISSUE_DIRECT">เบิกจ่ายตรง (ISSUE_DIRECT)</option>
              <option value="TRANSFER_DISPATCH">โอนออก (DISPATCH)</option>
              <option value="TRANSFER_RECEIVE">รับโอนเข้า (RECEIVE)</option>
              <option value="RETURN_DEPT">รับคืนจากแผนก (RETURN)</option>
              <option value="ADJUSTMENT">ปรับปรุงยอด (ADJUSTMENT)</option>
              <option value="COUNT_ADJUST">ปรับยอดตรวจนับ (COUNT_ADJUST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">วัน-เวลา</th>
                <th className="py-3 px-3">เลขที่เอกสาร</th>
                <th className="py-3 px-3">ประเภทธุรกรรม</th>
                <th className="py-3 px-3">รายการสินค้า</th>
                <th className="py-3 px-3">Lot No.</th>
                <th className="py-3 px-3 text-right">รับเข้า (+)</th>
                <th className="py-3 px-3 text-right">จ่ายออก (-)</th>
                <th className="py-3 px-3 text-right">คงเหลือก่อน</th>
                <th className="py-3 px-3 text-right font-bold text-[#14213D]">คงเหลือสุทธิ</th>
                <th className="py-3 px-3">ผู้บันทึก</th>
                <th className="py-3 px-4">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
                    กำลังดึงข้อมูลบัตรสต็อก...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#94A3B8]">
                    ไม่พบรายการเคลื่อนไหวตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F5F8FC] transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-[#64748B] font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMovement(m);
                          setShowDetailModal(true);
                        }}
                        className="font-mono font-bold text-[#2563EB] hover:text-[#164EAB] hover:underline"
                        title="คลิกเพื่อดูรายละเอียดธุรกรรมและบัตรสต็อกแบบเต็มจอ"
                      >
                        {m.documentNumber}
                      </button>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-[#334155] border border-[#E2EAF4]">
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#14213D]">{m.item.itemName}</div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">{m.item.itemCode}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#64748B]">
                      {m.lotNumber || '-'}
                    </td>
                    {/* Incoming (+) */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 tabular-nums">
                      {m.quantity > 0 ? `+${m.quantity.toLocaleString()} ${m.item.unit}` : '-'}
                    </td>
                    {/* Outgoing (-) */}
                    <td className="py-3 px-3 text-right font-bold text-rose-600 tabular-nums">
                      {m.quantity < 0 ? `${m.quantity.toLocaleString()} ${m.item.unit}` : '-'}
                    </td>
                    {/* Balance Before */}
                    <td className="py-3 px-3 text-right text-[#64748B] tabular-nums">
                      {m.balanceBefore.toLocaleString()}
                    </td>
                    {/* Balance After */}
                    <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums bg-[#F5F8FC]">
                      {m.balanceAfter.toLocaleString()} {m.item.unit}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[#64748B]">
                      {m.createdBy}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8] text-[11px] truncate max-w-[200px]">
                      {m.remark || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full-screen Stock Movement & Audit Modal */}
      {showDetailModal && selectedMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-2xs shrink-0">
                  <History className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Document Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedMovement.documentNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedMovement.documentNumber);
                          addToast('info', `คัดลอกเลขที่เอกสาร ${selectedMovement.documentNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่เอกสาร"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      ประเภทธุรกรรม: {selectedMovement.movementType}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      บัตรสต็อกและประวัติการเคลื่อนไหวพัสดุ
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Stock Card Movement Audit Trail)
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
                  title="พิมพ์บัตรสต็อก"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors ml-1"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F5F8FC]">
              {/* 4 Financial & Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    จำนวนในธุรกรรม (Qty In/Out)
                  </span>
                  <div className={`text-xl font-bold mt-1 tabular-nums ${selectedMovement.quantity >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {selectedMovement.quantity > 0 ? `+${selectedMovement.quantity.toLocaleString()}` : selectedMovement.quantity.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedMovement.item.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    {selectedMovement.quantity >= 0 ? 'รับเข้าคลังสินค้า' : 'ตัดจ่ายออกจากคลัง'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    ยอดคงเหลือก่อนหน้า (Before)
                  </span>
                  <div className="text-xl font-bold text-[#334155] mt-1 tabular-nums">
                    {selectedMovement.balanceBefore?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedMovement.item.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    ยอดสต็อกเดิมในระบบ
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                    ยอดคงเหลือสุทธิ (After)
                  </span>
                  <div className="text-xl font-bold text-blue-700 mt-1 tabular-nums">
                    {selectedMovement.balanceAfter?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedMovement.item.unit}</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>อัปเดตยอดคงเหลือเรียลไทม์</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                    มูลค่าธุรกรรมประเมิน
                  </span>
                  <div className="text-xl font-bold text-purple-700 mt-1 tabular-nums">
                    ฿{Math.abs(selectedMovement.quantity * (selectedMovement.unitCost || selectedMovement.item.standardCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-purple-600 mt-1">
                    ทุนมาตรฐาน: ฿{(selectedMovement.item.standardCost || 0).toLocaleString()} / {selectedMovement.item.unit}
                  </div>
                </div>
              </div>

              {/* Movement Metadata Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#2563EB]" />
                    <span>ข้อมูลสินค้าและบันทึกการทำธุรกรรม (Transaction Details)</span>
                  </h4>
                  <span className="font-mono text-xs text-[#94A3B8]">
                    ID: {selectedMovement.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">รายการสินค้า</span>
                    <span className="font-bold text-[#14213D] text-sm block">{selectedMovement.item.itemName}</span>
                    <span className="font-mono text-[#2563EB] block text-[11px]">{selectedMovement.item.itemCode}</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">หมายเลข Lot / Batch</span>
                    <span className="font-mono font-bold text-[#14213D] text-sm block">{selectedMovement.lotNumber || 'ไม่ระบุ Lot'}</span>
                    <span className="text-[#94A3B8] block text-[11px]">เกณฑ์ควบคุม FEFO</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">วัน-เวลาที่เกิดธุรกรรม</span>
                    <span className="font-semibold text-[#14213D] block text-sm">
                      {new Date(selectedMovement.createdAt).toLocaleString('th-TH')}
                    </span>
                    <span className="text-[#94A3B8] block text-[11px]">บันทึกแบบ Transaction Log</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">ผู้บันทึกรายการ (Operator)</span>
                    <span className="font-bold text-[#14213D] block">{selectedMovement.createdBy || 'เจ้าหน้าที่คลัง'}</span>
                    <span className="text-[#94A3B8] block text-[11px]">บันทึกในระบบ ERP</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1 sm:col-span-2">
                    <span className="text-[#94A3B8] block text-[11px]">หมายเหตุประกอบรายการ (Remark / Audit)</span>
                    <span className="text-[#14213D] block font-medium">
                      {selectedMovement.remark || 'ไม่มีการระบุหมายเหตุเพิ่มเติม (ทำรายการปกติผ่านระบบคลัง)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Jump to Origin Module */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-[#2563EB]" />
                    <span>การเชื่อมโยงระบบ (Origin Module Traceability)</span>
                  </h4>
                  <p className="text-xs text-blue-700 mt-0.5">
                    เอกสารนี้เชื่อมโยงกับธุรกรรม <strong>{selectedMovement.documentNumber}</strong> สามารถกดเพื่อไปตรวจดูใบงานต้นฉบับได้
                  </p>
                </div>

                <div>
                  {(() => {
                    const doc = selectedMovement.documentNumber || '';
                    let targetUrl = '/inventory';
                    let label = 'ไปที่หน้าระบบคลัง';

                    if (doc.startsWith('PO-')) {
                      targetUrl = '/procurement/orders';
                      label = 'ดูใบสั่งซื้อ (PO)';
                    } else if (doc.startsWith('GR-')) {
                      targetUrl = '/inventory/receiving';
                      label = 'ดูใบรับสินค้า (GR)';
                    } else if (doc.startsWith('ISS-')) {
                      targetUrl = '/inventory/issue';
                      label = 'ดูใบเบิกพัสดุ (Issue)';
                    } else if (doc.startsWith('TRF-')) {
                      targetUrl = '/inventory/transfer';
                      label = 'ดูใบโอนย้าย (Transfer)';
                    } else if (doc.startsWith('RET-')) {
                      targetUrl = '/inventory/return';
                      label = 'ดูใบคืนพัสดุ (Return)';
                    } else if (doc.startsWith('ADJ-')) {
                      targetUrl = '/inventory/adjustment';
                      label = 'ดูใบปรับยอด (Adjustment)';
                    } else if (doc.startsWith('CNT-')) {
                      targetUrl = '/inventory/count';
                      label = 'ดูใบตรวจนับ (Count)';
                    }

                    return (
                      <Link
                        href={targetUrl}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-4 border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#64748B] flex items-center gap-4">
                <span>เลขที่: <strong className="font-mono text-[#14213D]">{selectedMovement.documentNumber}</strong></span>
                <span>สินค้า: <strong>{selectedMovement.item.itemName}</strong></span>
                <span>คงเหลือสุทธิ: <strong className="text-blue-700">{selectedMovement.balanceAfter?.toLocaleString()} {selectedMovement.item.unit}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-[#E2EAF4] hover:bg-slate-100 text-[#334155] rounded-xl text-xs font-semibold transition-colors"
                >
                  ปิดหน้าต่าง (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockCardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#94A3B8]">กำลังโหลดข้อมูลประวัติความเคลื่อนไหวคลัง...</div>}>
      <StockCardContent />
    </Suspense>
  );
}
