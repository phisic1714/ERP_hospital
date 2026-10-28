'use client';

import React, { useState, useEffect } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import {
  Layers,
  Search,
  Filter,
  Download,
  Eye,
  History,
  AlertTriangle,
  RefreshCw,
  Building,
  CheckCircle2,
  Calendar,
  CalendarClock,
  Copy,
  X,
  Printer,
  Package,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';

export default function StockOverviewPage() {
  const { selectedWarehouse, refreshKey } = useApp();
  const [balances, setBalances] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState(selectedWarehouse || '');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Selected item for Lot Detail Modal
  const [selectedItemLots, setSelectedItemLots] = useState<any | null>(null);

  useEffect(() => {
    setFilterWarehouse(selectedWarehouse || '');
  }, [selectedWarehouse]);

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterWarehouse) params.set('warehouseId', filterWarehouse);
    if (filterCategory) params.set('categoryId', filterCategory);
    if (filterStatus !== 'ALL') params.set('status', filterStatus);

    fetch(`/api/stock?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBalances(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [search, filterWarehouse, filterCategory, filterStatus, refreshKey]);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(console.error);
    fetch('/api/warehouses').then((r) => r.json()).then(setWarehouses).catch(console.error);
  }, []);

  const openLotsModal = async (itemId: string, warehouseId: string, itemName: string) => {
    try {
      const res = await fetch(`/api/lots?itemId=${itemId}&warehouseId=${warehouseId}`);
      const lots = await res.json();
      setSelectedItemLots({ itemName, lots });
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = [
      'รหัสสินค้า',
      'ชื่อสินค้า',
      'หมวดหมู่',
      'คลังสินค้า',
      'On Hand (คงคลังทั้งหมด)',
      'Reserved (จอง)',
      'Available (พร้อมจ่าย)',
      'In Transit (ระหว่างโอน)',
      'Quarantine (กักกัน)',
      'Damaged (ชำรุด)',
      'Expired (หมดอายุ)',
      'หน่วยนับ',
      'ราคาทุนมาตรฐาน',
      'มูลค่ารวม',
      'สถานะสต็อก',
    ];

    const rows = balances.map((b) => [
      `"${b.itemCode}"`,
      `"${b.itemName}"`,
      `"${b.categoryName}"`,
      `"${b.warehouseName}"`,
      b.onHand,
      b.reserved,
      b.available,
      b.inTransit,
      b.quarantine,
      b.damaged,
      b.expired,
      `"${b.unit}"`,
      b.standardCost,
      b.totalValue,
      `"${b.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Stock_Overview_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2563EB]" />
            ตรวจสอบสินค้าคงคลังรวม (Stock Overview)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            สูตรคำนวณ: พร้อมจ่าย (Available) = คงเหลือ (On Hand) - จอง (Reserved) - กักกัน/ชำรุด/หมดอายุ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
          <Link
            href="/inventory/items/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <span>+ เพิ่มสินค้าใหม่</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAF4] shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหารหัสสินค้า, ชื่อสินค้า, ชื่อสามัญทางยา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
            />
          </div>

          {/* Warehouse filter */}
          <div>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer"
            >
              <option value="">ทุกคลังสินค้า</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer"
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E2EAF4] text-xs">
          <span className="text-[#94A3B8] font-medium mr-2">สถานะสต็อก:</span>
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'NORMAL', label: 'ปกติ' },
            { id: 'LOW_STOCK', label: 'ใกล้หมด (Low Stock)' },
            { id: 'OUT_OF_STOCK', label: 'หมดคลัง (Out of Stock)' },
            { id: 'OVER_STOCK', label: 'เกินเกณฑ์ (Over Stock)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-[#94A3B8] text-xs">
            พบ {balances.length} รายการ
          </span>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">รหัส / ชื่อสินค้า</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3">คลังสินค้า</th>
                <th className="py-3 px-3 text-right">On Hand</th>
                <th className="py-3 px-3 text-right">จอง (Reserved)</th>
                <th className="py-3 px-3 text-right text-blue-700 font-bold">พร้อมจ่าย (Available)</th>
                <th className="py-3 px-3 text-right text-indigo-600">In Transit</th>
                <th className="py-3 px-3 text-right text-purple-700">กักกัน</th>
                <th className="py-3 px-3 text-right text-red-600">ชำรุด/หมดอายุ</th>
                <th className="py-3 px-3 text-right">มูลค่ารวม (บาท)</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
                    กำลังดึงข้อมูลสินค้าคงคลัง...
                  </td>
                </tr>
              ) : balances.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-[#94A3B8]">
                    ไม่พบรายการสินค้าตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                balances.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F5F8FC] transition-colors">
                    {/* Item Name & Code */}
                    <td className="py-3 px-4">
                      <Link href={`/inventory/items/detail?id=${encodeURIComponent(b.itemId)}`} className="hover:text-[#2563EB]">
                        <div className="font-semibold text-[#14213D]">{b.itemName}</div>
                        <div className="text-[11px] text-[#94A3B8] font-mono">{b.itemCode}</div>
                      </Link>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                      {b.categoryName}
                    </td>

                    {/* Warehouse */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-[#14213D]">{b.warehouseCode}</span>
                      <div className="text-[10px] text-[#94A3B8] truncate max-w-[120px]">
                        {b.warehouseName}
                      </div>
                    </td>

                    {/* On Hand */}
                    <td className="py-3 px-3 text-right font-semibold text-[#14213D] tabular-nums">
                      {b.onHand.toLocaleString()} <span className="text-[10px] text-[#94A3B8]">{b.unit}</span>
                    </td>

                    {/* Reserved */}
                    <td className="py-3 px-3 text-right text-amber-700 font-medium tabular-nums">
                      {b.reserved > 0 ? b.reserved.toLocaleString() : '-'}
                    </td>

                    {/* Available */}
                    <td className="py-3 px-3 text-right font-bold text-blue-700 tabular-nums bg-blue-50/40">
                      {b.available.toLocaleString()} {b.unit}
                    </td>

                    {/* In Transit */}
                    <td className="py-3 px-3 text-right text-indigo-600 font-medium tabular-nums">
                      {b.inTransit > 0 ? (
                        <span className="font-semibold text-indigo-700">+{b.inTransit}</span>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Quarantine */}
                    <td className="py-3 px-3 text-right text-purple-700 font-medium tabular-nums">
                      {b.quarantine > 0 ? b.quarantine.toLocaleString() : '-'}
                    </td>

                    {/* Damaged / Expired */}
                    <td className="py-3 px-3 text-right text-red-600 font-medium tabular-nums">
                      {b.damaged + b.expired > 0 ? (b.damaged + b.expired).toLocaleString() : '-'}
                    </td>

                    {/* Total Value */}
                    <td className="py-3 px-3 text-right font-semibold text-[#14213D] tabular-nums">
                      ฿{b.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openLotsModal(b.itemId, b.warehouseId, b.itemName)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#334155] transition-colors"
                          title="ดูรายละเอียด Lot และวันหมดอายุ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/inventory/stock-card?itemId=${b.itemId}&warehouseId=${b.warehouseId}`}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#2563EB] transition-colors"
                          title="ดูประวัติความเคลื่อนไหว (Stock Card)"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Breakdown Modal - Redesigned Modern SaaS */}
      {selectedItemLots && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] max-w-3xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            {/* Clean White Header */}
            <div className="p-5 sm:px-6 bg-white border-b border-[#E2EAF4] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28] shadow-2xs">
                  <CalendarClock className="w-5 h-5 text-[#F28C28]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28] bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60">
                      FEFO Lot Sequence
                    </span>
                    <span className="text-xs text-[#94A3B8]">• เรียงลำดับวันหมดอายุก่อน</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#0F172A] mt-1">
                    {selectedItemLots.itemName}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemLots(null)}
                className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto p-6 flex-1 bg-[#F5F8FC] space-y-4 no-scrollbar">
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] text-[#475569] border-b border-[#E2EAF4] font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">ลำดับจ่าย</th>
                      <th className="py-3 px-3">Lot Number</th>
                      <th className="py-3 px-3">ตำแหน่ง (Location)</th>
                      <th className="py-3 px-3 text-right">คงเหลือในล็อต</th>
                      <th className="py-3 px-3 text-right text-blue-700 font-bold">พร้อมจ่าย</th>
                      <th className="py-3 px-3">วันหมดอายุ (EXP)</th>
                      <th className="py-3 px-4 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedItemLots.lots.map((l: any, idx: number) => {
                      const expDate = new Date(l.expiryDate);
                      const now = new Date();
                      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      const isExpired = diffDays <= 0;

                      return (
                        <tr key={l.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-3 px-4">
                            {idx === 0 ? (
                              <span className="bg-[#2563EB] text-white px-2 py-0.5 rounded-md font-bold text-[10px] inline-block shadow-2xs">
                                #1 จ่ายก่อน
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-[#475569] px-2 py-0.5 rounded-md font-semibold text-[10px] inline-block">
                                #{idx + 1}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                            {l.lotNumber}
                          </td>
                          <td className="py-3 px-3 text-[#64748B] font-mono text-[11px]">
                            {l.locationCode || '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-[#0F172A] tabular-nums">
                            {l.currentQty} {l.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-blue-700 tabular-nums">
                            {l.availableInLot} {l.unit}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`font-semibold ${isExpired ? 'text-rose-600 font-bold' : 'text-[#0F172A]'}`}>
                              {expDate.toLocaleDateString('th-TH')}
                            </span>
                            <span className="text-[10px] text-[#94A3B8] block">
                              {isExpired ? 'หมดอายุแล้ว' : `เหลืออีก ${diffDays} วัน`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={l.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sticky Clean Footer */}
            <div className="flex items-center justify-between p-4 px-6 bg-white border-t border-[#E2EAF4] shrink-0">
              <span className="text-xs text-[#64748B]">
                จำนวนล็อตทั้งหมด: <strong className="text-[#0F172A]">{selectedItemLots.lots.length}</strong> ล็อต
              </span>
              <button
                onClick={() => setSelectedItemLots(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold transition-colors"
              >
                ปิดหน้าต่าง (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
