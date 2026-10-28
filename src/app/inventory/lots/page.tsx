'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CalendarClock,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  RefreshCw,
  Sparkles,
  Eye,
  Copy,
  Printer,
  X,
  Layers,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function LotsManagementPage() {
  const { selectedWarehouse, refreshKey, addToast } = useApp();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, ACTIVE, NEAR_EXPIRY, EXPIRED, QUARANTINE

  // Full-screen Lot Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLotDetail, setSelectedLotDetail] = useState<any | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // FEFO Simulator state
  const [fefoItemId, setFefoItemId] = useState('');
  const [fefoQty, setFefoQty] = useState(50);
  const [fefoResult, setFefoResult] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/items')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
          if (data.length > 0) setFefoItemId(data[0].id);
        }
      });
  }, []);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeFilter !== 'ALL') params.set('filter', activeFilter);
    if (selectedWarehouse) params.set('warehouseId', selectedWarehouse);

    fetch(`/api/lots?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLots(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [search, activeFilter, selectedWarehouse, refreshKey]);

  const runFEFOSimulation = async () => {
    if (!fefoItemId) return;
    try {
      const res = await fetch('/api/fefo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: fefoItemId,
          warehouseId: selectedWarehouse || 'cmvg2xcn0000pluofuqlfn5za', // Default to Main
          requiredQty: fefoQty,
        }),
      });
      const data = await res.json();
      setFefoResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-orange-600" />
            การควบคุม Lot และวันหมดอายุ (Lot & Expiry Management)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            ติดตาม Batch/Lot รายคลัง • แจ้งเตือนสินค้าหมดอายุ • บังคับใช้เกณฑ์ FEFO (First-Expired, First-Out) ในการจ่ายพัสดุ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const csvContent =
                '\uFEFF' +
                [
                  'Lot Number,รหัสสินค้า,ชื่อสินค้า,คลัง,ตำแหน่ง,คงเหลือ,พร้อมจ่าย,วันหมดอายุ,สถานะ',
                  ...lots.map(
                    (l) =>
                      `"${l.lotNumber}","${l.itemCode}","${l.itemName}","${l.warehouseName}","${l.locationCode}",${l.currentQty},${l.availableInLot},"${new Date(l.expiryDate).toLocaleDateString('th-TH')}","${l.status}"`
                  ),
                ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `Lots_Report_${Date.now()}.csv`);
              link.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* FEFO Interactive Simulation Tool */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold tracking-wide">เครื่องมือจำลองการจัดสรร Lot ตามหลักเกณฑ์ FEFO (Interactive FEFO Engine)</h2>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 bg-blue-500/20 text-blue-200 rounded-full border border-blue-400/30">
            อัลกอริทึมเลือกวันหมดอายุเร็วสุดก่อน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-1">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">เลือกสินค้าที่จะเบิกจ่าย</label>
            <select
              value={fefoItemId}
              onChange={(e) => setFefoItemId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-2 focus:ring-blue-400"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  [{it.itemCode}] {it.itemName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">จำนวนที่ต้องการเบิก</label>
            <input
              type="number"
              min="1"
              value={fefoQty}
              onChange={(e) => setFefoQty(parseFloat(e.target.value) || 0)}
              className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-right"
            />
          </div>

          <button
            onClick={runFEFOSimulation}
            className="w-full px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            คำนวณ FEFO Allocation
          </button>
        </div>

        {/* Simulation Output */}
        {fefoResult && (
          <div className="mt-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-2 animate-fade-in">
            {fefoResult.success ? (
              <div>
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  ✓ จัดสรรครบถ้วนตามเกณฑ์ FEFO (จำนวน {fefoResult.allocatedTotal} หน่วย)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {fefoResult.allocations.map((a: any, i: number) => (
                    <div key={i} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                      <div className="font-mono text-amber-300 font-bold">{a.lotNumber}</div>
                      <div className="text-[11px] text-slate-300">
                        จัดสรร: <span className="font-bold text-white">{a.allocateQty} หน่วย</span> (คงเหลือใน Lot: {a.availableInLot})
                      </div>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">
                        หมดอายุ: {new Date(a.expiryDate).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-rose-400 font-semibold flex items-center gap-1.5">
                ⚠ {fefoResult.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Lots Table Card with Integrated Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E2EAF4] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white">
          <h2 className="text-base font-bold text-[#14213D] shrink-0">
            รายการล็อตและวันหมดอายุ
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 lg:w-72">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหาเลข Lot, รหัสสินค้า, ชื่อสินค้า..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] placeholder-[#94A3B8] transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {[
                { id: 'ALL', label: 'ทุกล็อต' },
                { id: 'ACTIVE', label: 'ใช้งานปกติ' },
                { id: 'NEAR_EXPIRY', label: 'ใกล้หมดอายุ (< 90 วัน)' },
                { id: 'EXPIRED', label: 'หมดอายุแล้ว' },
                { id: 'QUARANTINE', label: 'กักกัน' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === tab.id
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2EAF4] uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">LOT NUMBER</th>
                <th className="py-3 px-3">รายการสินค้า</th>
                <th className="py-3 px-3">คลังสินค้า</th>
                <th className="py-3 px-3">ตำแหน่ง (LOCATION)</th>
                <th className="py-3 px-3 text-right">จำนวนคงเหลือ</th>
                <th className="py-3 px-3 text-right text-blue-700">พร้อมจ่าย (AVAILABLE)</th>
                <th className="py-3 px-3 text-right">ราคาทุน/หน่วย</th>
                <th className="py-3 px-3">วันหมดอายุ</th>
                <th className="py-3 px-3 text-center">ระยะเวลาคงเหลือ</th>
                <th className="py-3 px-4 text-center">สถานะ LOT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
                    กำลังดึงข้อมูล Lot ทั้งหมด...
                  </td>
                </tr>
              ) : lots.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#94A3B8]">
                    ไม่พบข้อมูล Lot ตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                lots
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((l) => (
                    <tr key={l.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLotDetail(l);
                            setShowDetailModal(true);
                          }}
                          className="font-mono font-bold text-[#2563EB] hover:text-[#164EAB] hover:underline"
                          title="คลิกเพื่อดูข้อมูล Lot 360° และวันหมดอายุแบบเต็มจอ"
                        >
                          {l.lotNumber}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#14213D]">{l.itemName}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{l.itemCode}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#334155]">
                        {l.warehouseName}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#64748B] whitespace-nowrap">
                        {l.locationCode}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-[#14213D] tabular-nums whitespace-nowrap">
                        {l.currentQty.toLocaleString()} {l.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-blue-700 tabular-nums bg-blue-50/30 whitespace-nowrap">
                        {l.availableInLot.toLocaleString()} {l.unit}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-[#64748B] whitespace-nowrap">
                        ฿{l.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-[#14213D]">
                        {new Date(l.expiryDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {l.isExpired ? (
                          <span className="text-red-700 font-bold text-[11px]">
                            หมดอายุแล้ว ({Math.abs(l.daysRemaining)} วันที่แล้ว)
                          </span>
                        ) : l.isNearExpiry ? (
                          <span className="text-amber-700 font-semibold text-[11px]">
                            เหลือ {l.daysRemaining} วัน (ใกล้หมดอายุ)
                          </span>
                        ) : (
                          <span className="text-[#64748B] text-[11px]">
                            เหลือ {l.daysRemaining} วัน
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E2EAF4] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div>
            แสดง{' '}
            <span className="font-semibold text-[#14213D]">
              {lots.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, lots.length)}
            </span>{' '}
            จาก{' '}
            <span className="font-semibold text-[#14213D]">{lots.length.toLocaleString()}</span>{' '}
            รายการ
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E2EAF4] hover:bg-[#F5F8FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4 text-[#64748B]" />
            </button>

            {Array.from({ length: Math.max(1, Math.ceil(lots.length / pageSize)) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'border border-[#E2EAF4] hover:bg-[#F5F8FC] text-[#334155]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(Math.max(1, Math.ceil(lots.length / pageSize)), p + 1))}
              disabled={currentPage === Math.max(1, Math.ceil(lots.length / pageSize)) || lots.length === 0}
              className="p-1.5 rounded-lg border border-[#E2EAF4] hover:bg-[#F5F8FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen Lot 360° Detail Modal */}
      {showDetailModal && selectedLotDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-2xs shrink-0">
                  <CalendarClock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Lot Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedLotDetail.lotNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedLotDetail.lotNumber);
                          addToast('info', `คัดลอกเลขที่ Lot ${selectedLotDetail.lotNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่ Lot"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={selectedLotDetail.status} />

                    <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      FEFO Monitored
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      {selectedLotDetail.itemName}
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (รหัสพัสดุ: {selectedLotDetail.itemCode})
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
                  title="พิมพ์รายละเอียดล็อต"
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
                    ยอดคงคลังในล็อตนี้ (Current Balance)
                  </span>
                  <div className="text-xl font-bold text-[#14213D] mt-1 tabular-nums">
                    {selectedLotDetail.currentQty?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedLotDetail.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    คลัง: {selectedLotDetail.warehouseName}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                    ยอดพร้อมจ่ายในล็อต (Available)
                  </span>
                  <div className="text-xl font-bold text-blue-700 mt-1 tabular-nums">
                    {selectedLotDetail.availableInLot?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedLotDetail.unit}</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>สามารถเบิกจ่ายได้ทันที</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    ราคาทุนต่อหน่วย (Unit Cost)
                  </span>
                  <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                    ฿{(selectedLotDetail.unitCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1">
                    ต่อหน่วย {selectedLotDetail.unit}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                    มูลค่าสต็อกของล็อตนี้ (Valuation)
                  </span>
                  <div className="text-xl font-bold text-purple-700 mt-1 tabular-nums">
                    ฿{((selectedLotDetail.currentQty || 0) * (selectedLotDetail.unitCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-purple-600 mt-1">
                    มูลค่าคงคลังใน Lot
                  </div>
                </div>
              </div>

              {/* Expiry & FEFO Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FEFO & Expiry Status Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>สถานะอายุยาและการหมดอายุ (FEFO & Expiration Analysis)</span>
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#E2EAF4]">
                      <span className="text-[#64748B]">วันหมดอายุ (Expiry Date):</span>
                      <span className="font-mono font-bold text-[#14213D] text-sm">
                        {new Date(selectedLotDetail.expiryDate).toLocaleDateString('th-TH')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#E2EAF4]">
                      <span className="text-[#64748B]">ระยะเวลาคงเหลือ (Days Remaining):</span>
                      <span className="font-bold text-sm">
                        {selectedLotDetail.isExpired ? (
                          <span className="text-rose-600 font-bold">หมดอายุแล้ว ({Math.abs(selectedLotDetail.daysRemaining)} วันที่แล้ว)</span>
                        ) : selectedLotDetail.isNearExpiry ? (
                          <span className="text-amber-600 font-bold">เหลืออีก {selectedLotDetail.daysRemaining} วัน (ใกล้หมดอายุ)</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">เหลืออีก {selectedLotDetail.daysRemaining} วัน</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#E2EAF4]">
                      <span className="text-[#64748B]">ลำดับความสำคัญ FEFO:</span>
                      <span className="px-2.5 py-0.5 rounded font-semibold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                        {selectedLotDetail.daysRemaining <= 90 ? 'จ่ายออกก่อนทันที (High Priority)' : 'จ่ายตามลำดับปกติ (Standard FEFO)'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#64748B]">การควบคุมกักกัน:</span>
                      <span className="font-semibold text-[#334155]">ผ่านการตรวจรับมาตรฐาน (GHP Accepted)</span>
                    </div>
                  </div>
                </div>

                {/* Storage Location Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#2563EB]" />
                      <span>ตำแหน่งจัดเก็บและคลังสินค้า (Storage Location)</span>
                    </h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#E2EAF4]">
                      <span className="text-[#64748B]">คลังพัสดุ:</span>
                      <span className="font-bold text-[#14213D]">{selectedLotDetail.warehouseName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#E2EAF4]">
                      <span className="text-[#64748B]">รหัสตำแหน่ง (Bin Location):</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                        {selectedLotDetail.locationCode || 'RACK-01 / SHELF-02'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#E2EAF4]">
                      <span className="text-[#64748B]">สภาวะการจัดเก็บ:</span>
                      <span className="font-semibold text-[#334155]">ควบคุมอุณหภูมิห้อง (15-25°C)</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#64748B]">การตรวจสอบย้อนกลับ:</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>รองรับ Barcode / 2D DataMatrix</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Navigation Links */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-bold text-blue-900 block">ตรวจสอบประวัติการเคลื่อนไหวของสินค้านี้</span>
                  <p className="text-blue-700 mt-0.5">เปิดดูบัตรสต็อก (Stock Card) เพื่อดูประวัติการรับเข้าและจ่ายออกย้อนหลัง</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/inventory/stock-card?itemId=${selectedLotDetail.itemId}`}
                    className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>เปิดบัตรสต็อก (Stock Card)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-4 border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#64748B] flex items-center gap-4">
                <span>Lot: <strong className="font-mono text-[#14213D]">{selectedLotDetail.lotNumber}</strong></span>
                <span>คลัง: <strong>{selectedLotDetail.warehouseName}</strong></span>
                <span>คงเหลือ: <strong className="text-blue-700">{selectedLotDetail.currentQty?.toLocaleString()} {selectedLotDetail.unit}</strong></span>
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
