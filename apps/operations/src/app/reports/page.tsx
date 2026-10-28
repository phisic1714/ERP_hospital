'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@erp/app-context';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building,
  Layers,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';

export default function ReportsPage() {
  const { selectedWarehouse, refreshKey } = useApp();
  const [reportType, setReportType] = useState('VALUATION'); // VALUATION, LOW_STOCK, EXPIRY, MOVEMENTS
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('type', reportType);
    if (selectedWarehouse) params.set('warehouseId', selectedWarehouse);

    fetch(`/api/reports?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setReportData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReport();
  }, [reportType, selectedWarehouse, refreshKey]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.rows) return;
    let csv = '';

    if (reportType === 'VALUATION') {
      csv =
        '\uFEFF' +
        [
          'รหัสสินค้า,ชื่อสินค้า,หมวดหมู่,คลังสินค้า,คงเหลือ (On Hand),หน่วยนับ,ราคาทุน,มูลค่ารวม (บาท)',
          ...reportData.rows.map(
            (r: any) =>
              `"${r.itemCode}","${r.itemName}","${r.categoryName}","${r.warehouseName}",${r.onHand},"${r.unit}",${r.unitCost},${r.totalValue}`
          ),
        ].join('\n');
    } else if (reportType === 'LOW_STOCK') {
      csv =
        '\uFEFF' +
        [
          'รหัสสินค้า,ชื่อสินค้า,หมวดหมู่,คลังสินค้า,พร้อมจ่าย,ขั้นต่ำ (Min),จุดสั่งซื้อ,แนะนำสั่งซื้อ,สถานะ',
          ...reportData.rows.map(
            (r: any) =>
              `"${r.itemCode}","${r.itemName}","${r.categoryName}","${r.warehouseName}",${r.available},${r.minStock},${r.reorderPoint},${r.suggestedOrderQty},"${r.status}"`
          ),
        ].join('\n');
    } else if (reportType === 'EXPIRY') {
      csv =
        '\uFEFF' +
        [
          'Lot Number,รหัสสินค้า,ชื่อสินค้า,หมวดหมู่,คลังสินค้า,จำนวน,หน่วย,วันหมดอายุ,ระยะเวลาคงเหลือ,สถานะ',
          ...reportData.rows.map(
            (r: any) =>
              `"${r.lotNumber}","${r.itemCode}","${r.itemName}","${r.categoryName}","${r.warehouseName}",${r.currentQty},"${r.unit}","${new Date(r.expiryDate).toLocaleDateString('th-TH')}",${r.daysRemaining},"${r.status}"`
          ),
        ].join('\n');
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_Report_${Date.now()}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm print:hidden">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#8B5CF6]" />
            ระบบรายงานและการประเมินมูลค่าสินค้าคงคลัง (Reports & Valuation)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            รายงานมาตรฐาน ERP โรงพยาบาล • การประเมินมูลค่าตามราคาทุน • ติดตามสินค้าจุดสั่งซื้อซ้ำและล็อตหมดอายุ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน (Print)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        {[
          { id: 'VALUATION', label: '1. รายงานมูลค่าสินค้าคงคลัง (Inventory Valuation)' },
          { id: 'LOW_STOCK', label: '2. รายงานสินค้าใกล้หมด / ต่ำกว่าเกณฑ์ (Low Stock)' },
          { id: 'EXPIRY', label: '3. รายงานควบคุมวันหมดอายุ (Lot & Expiry)' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              reportType === t.id
                ? 'bg-[#8B5CF6] text-white shadow-xs font-bold'
                : 'bg-white hover:bg-slate-100 text-[#334155] border border-[#E2EAF4]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Printable Report Header */}
      {reportData && (
        <div className="bg-white p-6 rounded-2xl border border-[#E2EAF4] shadow-sm space-y-4">
          <div className="border-b border-[#E2EAF4] pb-4 flex justify-between items-start">
            <div>
              <div className="text-xs uppercase font-bold text-blue-700 tracking-wider">
                โรงพยาบาล • รายงานระบบบริหารจัดการคลังสินค้า (HIMS Inventory Report)
              </div>
              <h2 className="text-base font-bold text-[#14213D] mt-1">{reportData.title}</h2>
              <div className="text-xs text-[#64748B] mt-0.5">
                พิมพ์เมื่อ: {new Date(reportData.generatedAt).toLocaleString('th-TH')}
              </div>
            </div>

            {reportData.summary && (
              <div className="text-right">
                {reportData.summary.totalValuation !== undefined && (
                  <div>
                    <span className="text-xs text-[#94A3B8] block">มูลค่าคงเหลือรวมทั้งหมด:</span>
                    <span className="text-xl font-bold text-emerald-700 tabular-nums">
                      ฿{reportData.summary.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {reportData.summary.totalLowItems !== undefined && (
                  <div>
                    <span className="text-xs text-[#94A3B8] block">จำนวนรายการที่ต้องสั่งซื้อ:</span>
                    <span className="text-xl font-bold text-amber-600 tabular-nums">
                      {reportData.summary.totalLowItems} รายการ
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              {reportType === 'VALUATION' && (
                <>
                  <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">รหัสสินค้า</th>
                      <th className="py-2.5 px-3">ชื่อสินค้า</th>
                      <th className="py-2.5 px-3">กลุ่มสินค้า</th>
                      <th className="py-2.5 px-3">คลังสินค้า</th>
                      <th className="py-2.5 px-3 text-right">จำนวนคงคลัง (On Hand)</th>
                      <th className="py-2.5 px-3 text-right">ราคาทุนมาตรฐาน</th>
                      <th className="py-2.5 px-3 text-right font-bold text-[#14213D]">มูลค่ารวม (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.rows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F5F8FC]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB]">{r.itemCode}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#14213D]">{r.itemName}</td>
                        <td className="py-2.5 px-3 text-[#64748B]">{r.categoryName}</td>
                        <td className="py-2.5 px-3 text-[#334155]">{r.warehouseName}</td>
                        <td className="py-2.5 px-3 text-right font-medium tabular-nums">{r.onHand.toLocaleString()} {r.unit}</td>
                        <td className="py-2.5 px-3 text-right text-[#64748B] tabular-nums">฿{r.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#14213D] tabular-nums">฿{r.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'LOW_STOCK' && (
                <>
                  <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">รหัสสินค้า</th>
                      <th className="py-2.5 px-3">ชื่อสินค้า</th>
                      <th className="py-2.5 px-3">คลังสินค้า</th>
                      <th className="py-2.5 px-3 text-right text-blue-700 font-bold">พร้อมจ่าย (Available)</th>
                      <th className="py-2.5 px-3 text-right">เกณฑ์ขั้นต่ำ (Min)</th>
                      <th className="py-2.5 px-3 text-right">จุดสั่งซื้อ (Reorder)</th>
                      <th className="py-2.5 px-3 text-right font-bold text-emerald-700">แนะนำสั่งซื้อ</th>
                      <th className="py-2.5 px-3 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.rows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F5F8FC]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB]">{r.itemCode}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#14213D]">{r.itemName}</td>
                        <td className="py-2.5 px-3 text-[#334155]">{r.warehouseName}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-700 tabular-nums">{r.available} {r.unit}</td>
                        <td className="py-2.5 px-3 text-right text-[#64748B] tabular-nums">{r.minStock} {r.unit}</td>
                        <td className="py-2.5 px-3 text-right text-[#64748B] tabular-nums">{r.reorderPoint} {r.unit}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">{r.suggestedOrderQty} {r.unit}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.available === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {reportType === 'EXPIRY' && (
                <>
                  <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Lot Number</th>
                      <th className="py-2.5 px-3">รายการสินค้า</th>
                      <th className="py-2.5 px-3">คลังสินค้า</th>
                      <th className="py-2.5 px-3 text-right">จำนวนคงคลัง</th>
                      <th className="py-2.5 px-3">วันหมดอายุ</th>
                      <th className="py-2.5 px-3 text-center">ระยะเวลาคงเหลือ</th>
                      <th className="py-2.5 px-3 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.rows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F5F8FC]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#14213D]">{r.lotNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#14213D]">{r.itemName}</td>
                        <td className="py-2.5 px-3 text-[#334155]">{r.warehouseName}</td>
                        <td className="py-2.5 px-3 text-right font-semibold tabular-nums">{r.currentQty} {r.unit}</td>
                        <td className="py-2.5 px-3 text-[#334155] font-medium">{new Date(r.expiryDate).toLocaleDateString('th-TH')}</td>
                        <td className="py-2.5 px-3 text-center tabular-nums">
                          {r.daysRemaining < 0 ? (
                            <span className="text-red-700 font-bold">หมดอายุ {Math.abs(r.daysRemaining)} วันที่แล้ว</span>
                          ) : (
                            <span>เหลือ {r.daysRemaining} วัน</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'หมดอายุแล้ว' ? 'bg-red-100 text-red-800 border border-red-300' : r.status.includes('ใกล้หมดอายุ') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
