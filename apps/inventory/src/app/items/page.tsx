"use client";

import React, { useState, useEffect } from "react";
import Link from "@erp/ui/navigation";
import { useApp } from "@erp/app-context";
import {
  Package,
  Search,
  Plus,
  Eye,
  Edit3,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ThermometerSnowflake,
  Copy,
  Printer,
  X,
  Maximize2,
  Building2,
  CalendarClock,
  ShieldAlert,
  DollarSign,
  CheckCircle2,
  History,
  ShoppingCart,
  ArrowUpRight,
  ExternalLink,
  Scale,
  Sliders,
  Tag,
  Clock,
  ArrowUpDown,
  Check,
  Warehouse,
} from "lucide-react";

export default function ItemMasterPage() {
  const { addToast, refreshKey } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Full-screen Item Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<any | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleOpenDetail = async (itemId: string) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/items/${itemId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSelectedItemDetail(data);
    } catch (err: any) {
      addToast("error", err.message || "ไม่สามารถโหลดข้อมูลสินค้าได้");
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("categoryId", selectedCategory);

    fetch(`/api/items?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, [search, selectedCategory, refreshKey]);

  // Pagination calculation
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  let tableContent;
  if (loading) {
    tableContent = (
      <tr>
        <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
          กำลังดึงข้อมูลสินค้า...
        </td>
      </tr>
    );
  } else if (paginatedItems.length === 0) {
    tableContent = (
      <tr>
        <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
          ไม่พบข้อมูลสินค้าตามเงื่อนไข
        </td>
      </tr>
    );
  } else {
    tableContent = paginatedItems.map((it) => (
      <tr key={it.id} className="hover:bg-[#F5F8FC] transition-colors">
        <td className="py-3 px-4 whitespace-nowrap">
          <button
            type="button"
            onClick={() => handleOpenDetail(it.id)}
            className="font-mono font-bold text-[#2563EB] hover:text-[#164EAB] hover:underline"
            title="คลิกเพื่อดูข้อมูลสินค้า"
          >
            {it.itemCode}
          </button>
        </td>
        <td className="py-3 px-3">
          <div className="font-semibold text-[#14213D]">{it.itemName}</div>
          {it.genericName && (
            <div className="text-[11px] text-[#64748B] italic break-words">
              {it.genericName}
            </div>
          )}
        </td>
        <td className="py-3 px-3 whitespace-nowrap text-[#64748B]">
          {it.category?.name}
        </td>
        <td className="py-3 px-3 text-right font-medium text-[#14213D] tabular-nums whitespace-nowrap">
          ฿
          {it.standardCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}{" "}
          / {it.unit}
        </td>
        <td className="py-3 px-3 text-right text-[#64748B] tabular-nums whitespace-nowrap">
          {it.minStock?.toLocaleString()} - {it.maxStock?.toLocaleString()}{" "}
          {it.unit}
        </td>
        <td className="py-3 px-3 text-right font-bold text-amber-600 tabular-nums whitespace-nowrap">
          {it.reorderPoint?.toLocaleString()} {it.unit}
        </td>
        <td className="py-3 px-3 text-center whitespace-nowrap">
          <div className="flex items-center justify-center gap-1">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Lot
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              Exp
            </span>
          </div>
        </td>
        <td className="py-3 px-3 text-center whitespace-nowrap text-[#64748B] text-[11px]">
          {it.purchaseUnit && it.conversionRate > 1 ? (
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[#334155] font-medium border border-[#E2EAF4]">
              1 {it.purchaseUnit} = {it.conversionRate} {it.unit}
            </span>
          ) : (
            "-"
          )}
        </td>
        <td className="py-3 px-4 text-center whitespace-nowrap">
          <button
            type="button"
            onClick={() => handleOpenDetail(it.id)}
            className="px-3 py-1 bg-blue-50/80 hover:bg-blue-100 text-[#2563EB] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-blue-200 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ดูข้อมูล</span>
          </button>
        </td>
      </tr>
    ));
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2563EB]" />
            ทะเบียนข้อมูลสินค้า (Item Master Management)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            จัดการข้อมูลยา เวชภัณฑ์ และวัสดุทั่วไป • กำหนดจุดสั่งซื้อ
            (Min/Max/Reorder) • ควบคุม Unit Conversion และ Lot/Expiry
          </p>
        </div>

        <Link
          href="/inventory/items/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มสินค้าใหม่</span>
        </Link>
      </div>

      {/* 2. Items Table Card with Integrated Header Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E2EAF4] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <h2 className="text-base font-bold text-[#14213D]">รายการสินค้า</h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-72 lg:w-80">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหา รหัสสินค้า / รายการสินค้า..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] placeholder-[#94A3B8] transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto appearance-none text-xs pl-3 pr-8 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer font-medium"
              >
                <option value="">ทุกกลุ่มสินค้า All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2EAF4] uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">รหัสสินค้า (ITEM CODE)</th>
                <th className="py-3 px-3">ชื่อสินค้า / ชื่อสามัญ</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3 text-right">ราคาคุมมาตรฐาน</th>
                <th className="py-3 px-3 text-right">MIN - MAX</th>
                <th className="py-3 px-3 text-right">REORDER POINT</th>
                <th className="py-3 px-3 text-center">LOT / EXPIRY</th>
                <th className="py-3 px-3 text-center">แปลงหน่วยนับ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">{tableContent}</tbody>
          </table>
        </div>

        {/* 3. Pagination Footer */}
        <div className="p-4 border-t border-[#E2EAF4] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div>
            แสดง{" "}
            <span className="font-semibold text-[#14213D]">
              {totalItems === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(startIndex + pageSize, totalItems)}
            </span>{" "}
            จาก{" "}
            <span className="font-semibold text-[#14213D]">
              {totalItems.toLocaleString()}
            </span>{" "}
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

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? "bg-[#2563EB] text-white shadow-2xs"
                    : "border border-[#E2EAF4] hover:bg-[#F5F8FC] text-[#334155]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-[#E2EAF4] hover:bg-[#F5F8FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-4 h-4 text-[#64748B]" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Item 360° Modal (Redesigned Modern SaaS) */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-[1400px] max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-2xs shrink-0">
                  <Package className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Item Code Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>
                        {selectedItemDetail?.itemCode || "กำลังโหลด..."}
                      </span>
                      {selectedItemDetail && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(
                              selectedItemDetail.itemCode,
                            );
                            addToast(
                              "info",
                              `คัดลอกรหัส ${selectedItemDetail.itemCode} แล้ว`,
                            );
                          }}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="คัดลอกรหัสสินค้า"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="bg-slate-100 text-[#475569] border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>
                        {selectedItemDetail?.category?.name ||
                          "เวชภัณฑ์และวัสดุทางการแพทย์"}
                      </span>
                    </div>

                    {/* Unit Badge */}
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      หน่วย: {selectedItemDetail?.unit || "หน่วย"}
                    </div>
                  </div>

                  {/* Item Name & Generic Name */}
                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      {selectedItemDetail?.itemName ||
                        "รายละเอียดพัสดุและเวชภัณฑ์"}
                    </h2>
                    {selectedItemDetail?.genericName && (
                      <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                        ({selectedItemDetail.genericName})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#334155] rounded-xl text-xs font-semibold border border-[#E2EAF4] shadow-2xs transition-all"
                  title="พิมพ์เอกสารสรุป"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {selectedItemDetail && (
                  <Link
                    href={`/inventory/items/detail?id=${encodeURIComponent(selectedItemDetail.id)}`}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขข้อมูล (Edit)</span>
                  </Link>
                )}

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

            {/* Modal Body */}
            {loadingDetail || !selectedItemDetail ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 gap-3 text-[#64748B]">
                <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
                <span className="text-sm font-medium">
                  กำลังโหลดข้อมูลสินค้า 360°...
                </span>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F5F8FC] no-scrollbar">
                {/* Row 1: 4 Financial & Stock Summary Metrics */}
                {(() => {
                  const totalOnHand =
                    selectedItemDetail.stockBalances?.reduce(
                      (s: number, b: any) => s + (b.onHand || 0),
                      0,
                    ) || 0;
                  const totalAvailable =
                    selectedItemDetail.stockBalances?.reduce(
                      (s: number, b: any) => s + (b.available || 0),
                      0,
                    ) || 0;
                  const totalAllocated =
                    selectedItemDetail.stockBalances?.reduce(
                      (s: number, b: any) => s + (b.allocated || 0),
                      0,
                    ) || 0;
                  const totalValuation =
                    totalOnHand * (selectedItemDetail.standardCost || 0);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Metric 1: Total On Hand */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#64748B]">
                            คงคลังรวมทุกคลัง
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#475569] flex items-center justify-center">
                            <Warehouse className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-[#0F172A] mt-2 tabular-nums">
                          {totalOnHand.toLocaleString()}{" "}
                          <span className="text-xs font-medium text-[#64748B]">
                            {selectedItemDetail.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#94A3B8] mt-3 pt-2 border-t border-slate-100">
                          <span>
                            กระจายใน{" "}
                            {selectedItemDetail.stockBalances?.length || 0}{" "}
                            คลังพัสดุ
                          </span>
                          <span>On Hand</span>
                        </div>
                      </div>

                      {/* Metric 2: Available Net */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#64748B]">
                            ยอดพร้อมจ่ายสุทธิ
                          </span>
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            พร้อมเบิก
                          </span>
                        </div>
                        <div className="text-3xl font-extrabold text-[#2563EB] mt-2 tabular-nums">
                          {totalAvailable.toLocaleString()}{" "}
                          <span className="text-xs font-medium text-[#2563EB]">
                            {selectedItemDetail.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100">
                          <span className="text-amber-700 font-medium">
                            🕒 ติดจองเบิก: {totalAllocated.toLocaleString()}{" "}
                            {selectedItemDetail.unit}
                          </span>
                          <span className="text-blue-500 font-medium">
                            Available
                          </span>
                        </div>
                      </div>

                      {/* Metric 3: Standard Cost */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#64748B]">
                            ราคาทุนมาตรฐาน
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-emerald-600 mt-2 tabular-nums">
                          ฿
                          {(
                            selectedItemDetail.standardCost || 0
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                        <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-slate-100">
                          <span className="text-emerald-700">
                            ต่อหน่วยเบิกจ่าย ({selectedItemDetail.unit})
                          </span>
                          <span className="text-[10px] text-[#94A3B8] font-semibold uppercase">
                            Standard Cost
                          </span>
                        </div>
                      </div>

                      {/* Metric 4: Total Valuation */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#64748B]">
                            มูลค่าสต็อกรวม
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="text-3xl font-extrabold text-[#0F172A] mt-2 tabular-nums">
                          ฿
                          {totalValuation.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#94A3B8] mt-3 pt-2 border-t border-slate-100">
                          <span>ประเมินตามต้นทุนมาตรฐาน</span>
                          <span>Valuation</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Row 2: Visual Stock Meter & Structured Specifications */}
                {(() => {
                  const totalOnHand =
                    selectedItemDetail.stockBalances?.reduce(
                      (s: number, b: any) => s + (b.onHand || 0),
                      0,
                    ) || 0;
                  const min = selectedItemDetail.minStock || 100;
                  const rop = selectedItemDetail.reorderPoint || 250;
                  const max = selectedItemDetail.maxStock || 1200;
                  const pctOfMax =
                    max > 0
                      ? Math.min(100, Math.round((totalOnHand / max) * 100))
                      : 0;
                  const diffFromROP = totalOnHand - rop;
                  const isAboveROP = diffFromROP >= 0;
                  const isNearROP = diffFromROP < 0 && totalOnHand >= min;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-10 gap-4">
                      {/* Card 1: Visual Stock Meter (MIN-MAX) - Spans 4 of 10 cols (40% width) */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-3.5 md:col-span-2 lg:col-span-4 flex flex-col justify-between">
                        <div>
                          {/* Header of Card 1 */}
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                                <Sliders className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-[#0F172A] whitespace-nowrap">
                                เกณฑ์ควบคุมสต็อก (MIN-MAX)
                              </span>
                            </div>

                            {/* Status Badge with Check Circle */}
                            {isAboveROP ? (
                              <span className="bg-emerald-50/90 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
                                <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 flex items-center justify-center text-emerald-600 text-[9px] font-bold">
                                  ✓
                                </span>
                                <span>
                                  ปริมาณปกติ (+{diffFromROP} เหนือจุดสั่งซื้อ)
                                </span>
                              </span>
                            ) : isNearROP ? (
                              <span className="bg-amber-50/90 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
                                <span>⚠</span>
                                <span>ใกล้จุดสั่งซื้อ ({diffFromROP})</span>
                              </span>
                            ) : (
                              <span className="bg-rose-50/90 text-rose-700 border border-rose-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0">
                                <span>✕</span>
                                <span>ต่ำกว่าเกณฑ์ขั้นต่ำ</span>
                              </span>
                            )}
                          </div>

                          {/* Current Level and Percentage */}
                          <div className="flex items-baseline justify-between text-xs pt-3 pb-1">
                            <span className="text-[#0F172A] font-medium">
                              ระดับสต็อกปัจจุบัน:{" "}
                              <span className="font-extrabold text-[#0F172A]">
                                {totalOnHand.toLocaleString()}
                              </span>{" "}
                              <span className="font-medium text-[#64748B]">
                                {selectedItemDetail.unit}
                              </span>
                            </span>
                            <span className="text-[#2563EB] font-bold text-xs">
                              {((totalOnHand / (max || 1)) * 100).toFixed(1)}%
                              ของความจุสูงสุด
                            </span>
                          </div>

                          {/* Visual Progress Bar (หลอดกราฟิก 2 โทน พร้อมเส้นแบ่งตามภาพ) */}
                          <div className="h-3 w-full bg-slate-100 rounded-full relative overflow-hidden flex">
                            <div
                              className="h-full rounded-full transition-all duration-500 flex relative overflow-hidden"
                              style={{
                                width: `${Math.min(100, Math.max(5, (totalOnHand / (max || 1)) * 100))}%`,
                              }}
                            >
                              {totalOnHand >= rop ? (
                                <>
                                  <div
                                    style={{
                                      width: `${Math.min(100, (rop / totalOnHand) * 100)}%`,
                                    }}
                                    className="h-full bg-blue-600 shrink-0"
                                  />
                                  <div className="w-0.5 h-full bg-amber-500 shrink-0" />
                                  <div className="h-full bg-emerald-500 flex-1" />
                                </>
                              ) : (
                                <div className="h-full bg-blue-600 w-full" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3 Threshold Values Sub-Cards */}
                        <div className="grid grid-cols-3 gap-2.5 pt-2">
                          {/* Sub-Card 1: Min */}
                          <div className="bg-[#F8FAFC] border border-[#E2EAF4] rounded-2xl p-2.5 sm:p-3 text-center">
                            <span className="text-[11px] text-[#64748B] block mb-1">
                              สต็อกต่ำสุด (Min)
                            </span>
                            <div className="text-base sm:text-lg font-extrabold text-rose-600 tabular-nums">
                              {min.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-[#64748B]">
                                {selectedItemDetail.unit}
                              </span>
                            </div>
                          </div>

                          {/* Sub-Card 2: ROP (Yellow/Amber Card with highlight border) */}
                          <div className="bg-[#FFFDF5] border border-amber-300 rounded-2xl p-2.5 sm:p-3 text-center shadow-2xs">
                            <span className="text-[11px] font-bold text-amber-800 block mb-1">
                              จุดสั่งซื้อ (ROP)
                            </span>
                            <div className="text-base sm:text-lg font-extrabold text-amber-600 tabular-nums">
                              {rop.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-[#64748B]">
                                {selectedItemDetail.unit}
                              </span>
                            </div>
                          </div>

                          {/* Sub-Card 3: Max */}
                          <div className="bg-[#F8FAFC] border border-[#E2EAF4] rounded-2xl p-2.5 sm:p-3 text-center">
                            <span className="text-[11px] text-[#64748B] block mb-1">
                              สต็อกสูงสุด (Max)
                            </span>
                            <div className="text-base sm:text-lg font-extrabold text-[#0F172A] tabular-nums">
                              {max.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-[#64748B]">
                                {selectedItemDetail.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Units & Conversion Rate - Spans 2 of 10 cols (20% width) */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs md:col-span-1 lg:col-span-2 flex flex-col justify-between space-y-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                              <Scale className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#0F172A] whitespace-nowrap">
                              หน่วยนับ & อัตราแปลง
                            </span>
                          </div>

                          <div className="space-y-2.5 text-xs pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[#64748B]">
                                หน่วยเบิก (Base)
                              </span>
                              <span className="bg-slate-100 text-[#0F172A] font-bold px-3 py-1 rounded-lg text-xs border border-slate-200/50">
                                {selectedItemDetail.unit}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#64748B]">
                                หน่วยซื้อ (Purchase)
                              </span>
                              <span className="bg-slate-100 text-[#0F172A] font-bold px-3 py-1 rounded-lg text-xs border border-slate-200/50">
                                {selectedItemDetail.purchaseUnit ||
                                  selectedItemDetail.unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Conversion Rate Pill */}
                        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-2.5 text-xs text-purple-900 mt-2 flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-purple-700 whitespace-nowrap">
                            อัตราแปลง:
                          </span>
                          <span className="font-bold text-purple-900 text-right">
                            1{" "}
                            {selectedItemDetail.purchaseUnit ||
                              selectedItemDetail.unit}{" "}
                            = {selectedItemDetail.conversionRate || 1}{" "}
                            {selectedItemDetail.unit}
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Storage & Cold Chain - Spans 2 of 10 cols (20% width) */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs md:col-span-1 lg:col-span-2 flex flex-col justify-between space-y-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                              <ThermometerSnowflake className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#0F172A] whitespace-nowrap">
                              การจัดเก็บและ COLD CHAIN
                            </span>
                          </div>

                          <div className="space-y-2.5 text-xs pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[#64748B]">
                                อุณหภูมิเก็บรักษา
                              </span>
                              <div className="bg-sky-50 text-sky-800 font-bold px-2.5 py-1.5 rounded-xl text-xs border border-sky-100 text-center leading-tight">
                                <div>15-25°C</div>
                                <div className="text-[10px] text-sky-600 font-medium">
                                  ควบคุมอุณหภูมิ
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#64748B]">
                                การควบคุม Lot
                              </span>
                              <div className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1.5 rounded-xl text-xs border border-emerald-100 text-center leading-tight">
                                <div>บังคับใช้</div>
                                <div>FEFO</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                          <span className="text-[#64748B]">ประเภทวัตถุ:</span>
                          <span className="font-semibold text-[#0F172A]">
                            {selectedItemDetail.drugClass || "เวชภัณฑ์ทั่วไป"}
                          </span>
                        </div>
                      </div>

                      {/* Card 4: Safety & Regulatory Specs - Spans 2 of 10 cols (20% width) */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs md:col-span-2 lg:col-span-2 flex flex-col justify-between space-y-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-[#0F172A] whitespace-nowrap">
                              ความปลอดภัยและข้อกำหนด
                            </span>
                          </div>

                          <div className="space-y-2.5 text-xs pt-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[#64748B]">
                                High Alert Drug
                              </span>
                              <span
                                className={`font-bold px-2.5 py-1 rounded-lg text-xs ${
                                  selectedItemDetail.isHighAlert
                                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                                    : "text-[#0F172A]"
                                }`}
                              >
                                {selectedItemDetail.isHighAlert
                                  ? "ยาความเสี่ยงสูง (HAD)"
                                  : "ปกติ (No)"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#64748B]">
                                รหัสบัญชียาหลัก
                              </span>
                              <div className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1.5 rounded-xl text-xs border border-blue-100 text-center leading-tight">
                                <div>ในบัญชียา</div>
                                <div>หลัก (ED)</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-dashed border-slate-200 text-xs flex justify-between items-center">
                          <span className="text-[#64748B]">บาร์โค้ด:</span>
                          <span className="font-mono font-bold text-[#0F172A]">
                            {selectedItemDetail.barcode || "8850123400094"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Table 1: Multi-Warehouse Inventory Balance */}
                <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                  <div className="p-4 sm:px-5 border-b border-[#E2EAF4] flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                        <Warehouse className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-xs text-[#0F172A]">
                        สต็อกรายคลังพัสดุ{" "}
                        <span className="text-[#94A3B8] font-normal">
                          (Multi-Warehouse Inventory Balance)
                        </span>
                      </h3>
                    </div>
                    <span className="text-xs text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                      รวมทั้งหมด {selectedItemDetail.stockBalances?.length || 0}{" "}
                      คลังพัสดุ
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8FAFC] text-[#475569] border-b border-[#E2EAF4] font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-5">
                            ชื่อคลังสินค้า (WAREHOUSE)
                          </th>
                          <th className="py-3 px-3">ประเภทคลัง</th>
                          <th className="py-3 px-3 text-right">
                            คงคลังรวม (ON HAND)
                          </th>
                          <th className="py-3 px-3 text-right text-amber-700">
                            จองเบิก (ALLOCATED)
                          </th>
                          <th className="py-3 px-3 text-right text-blue-700 font-bold">
                            พร้อมจ่าย (AVAILABLE)
                          </th>
                          <th className="py-3 px-3 text-right">มูลค่าสต็อก</th>
                          <th className="py-3 px-5 text-center">สถานะสต็อก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItemDetail.stockBalances &&
                        selectedItemDetail.stockBalances.length > 0 ? (
                          selectedItemDetail.stockBalances.map((bal: any) => {
                            const val =
                              (bal.onHand || 0) *
                              (selectedItemDetail.standardCost || 0);
                            const isLow =
                              (bal.available || 0) <=
                              selectedItemDetail.reorderPoint;
                            return (
                              <tr
                                key={bal.id}
                                className="hover:bg-[#F8FAFC] transition-colors"
                              >
                                <td className="py-3 px-5 font-semibold text-[#0F172A] flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                  <span>{bal.warehouse?.name}</span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="bg-slate-100 text-[#475569] px-2 py-0.5 rounded text-[10px] font-semibold">
                                    {bal.warehouse?.type || "MAIN"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-[#0F172A] tabular-nums">
                                  {bal.onHand?.toLocaleString()}{" "}
                                  {selectedItemDetail.unit}
                                </td>
                                <td className="py-3 px-3 text-right text-amber-600 font-medium tabular-nums">
                                  {bal.allocated?.toLocaleString() || 0}{" "}
                                  {selectedItemDetail.unit}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-blue-600 tabular-nums">
                                  {bal.available?.toLocaleString()}{" "}
                                  {selectedItemDetail.unit}
                                </td>
                                <td className="py-3 px-3 text-right font-semibold text-emerald-600 tabular-nums">
                                  ฿
                                  {val.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td className="py-3 px-5 text-center">
                                  {isLow ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      ใกล้จุดสั่งซื้อ
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      สต็อกเพียงพอ
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-6 text-center text-[#94A3B8]"
                            >
                              ยังไม่มีรายการสต็อกในคลังสินค้า
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table 2: Active Batches / Lots (FEFO Sequence) */}
                <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                  <div className="p-4 sm:px-5 border-b border-[#E2EAF4] flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-orange-50 text-[#F28C28] flex items-center justify-center">
                        <CalendarClock className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-xs text-[#0F172A]">
                        ล็อตสินค้าและวันหมดอายุตามเกณฑ์ FEFO{" "}
                        <span className="text-[#94A3B8] font-normal">
                          ({selectedItemDetail.lots?.length || 0} ล็อตที่ใช้งาน)
                        </span>
                      </h3>
                    </div>
                    <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <span>
                        ↑= เรียงลำดับวันหมดอายุก่อน (First-Expired, First-Out)
                      </span>
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8FAFC] text-[#475569] border-b border-[#E2EAF4] font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-5">ลำดับจ่าย</th>
                          <th className="py-3 px-3">
                            หมายเลขล็อต (LOT / BATCH NO.)
                          </th>
                          <th className="py-3 px-3">คลังจัดเก็บ</th>
                          <th className="py-3 px-3">วันที่รับเข้า / ผลิต</th>
                          <th className="py-3 px-3">วันหมดอายุ (EXP. DATE)</th>
                          <th className="py-3 px-3 text-right">
                            คงเหลือในล็อต
                          </th>
                          <th className="py-3 px-5 text-center">
                            อายุคงเหลือ (SHELF LIFE)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedItemDetail.lots &&
                        selectedItemDetail.lots.length > 0 ? (
                          selectedItemDetail.lots.map(
                            (lot: any, idx: number) => {
                              const expDate = new Date(lot.expiryDate);
                              const now = new Date();
                              const diffDays = Math.ceil(
                                (expDate.getTime() - now.getTime()) /
                                  (1000 * 60 * 60 * 24),
                              );
                              const isExpired = diffDays <= 0;
                              const isNearExp = diffDays > 0 && diffDays <= 90;

                              return (
                                <tr
                                  key={lot.id}
                                  className="hover:bg-[#F8FAFC] transition-colors"
                                >
                                  <td className="py-3 px-5">
                                    {idx === 0 ? (
                                      <span className="bg-[#2563EB] text-white px-2.5 py-1 rounded-lg font-bold text-xs inline-block shadow-2xs">
                                        #1 จ่ายก่อน
                                      </span>
                                    ) : (
                                      <span className="bg-slate-100 text-[#475569] px-2.5 py-1 rounded-lg font-semibold text-xs inline-block">
                                        #{idx + 1} ล็อตถัดไป
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 font-mono font-bold text-xs text-[#0F172A]">
                                    {lot.lotNumber}
                                  </td>
                                  <td className="py-3 px-3 text-[#475569]">
                                    {lot.warehouse?.name ||
                                      "คลังกลางโรงพยาบาล (MAIN)"}
                                  </td>
                                  <td className="py-3 px-3 text-[#64748B]">
                                    {lot.mfgDate
                                      ? new Date(
                                          lot.mfgDate,
                                        ).toLocaleDateString("th-TH", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "15 ส.ค. 2026"}
                                  </td>
                                  <td className="py-3 px-3 font-bold text-[#0F172A]">
                                    {expDate.toLocaleDateString("th-TH", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </td>
                                  <td className="py-3 px-3 text-right font-bold text-[#0F172A] tabular-nums">
                                    {lot.quantity?.toLocaleString()}{" "}
                                    <span className="text-[11px] font-normal text-[#64748B]">
                                      {selectedItemDetail.unit}
                                    </span>
                                  </td>
                                  <td className="py-3 px-5 text-center">
                                    {isExpired ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                        หมดอายุแล้ว
                                      </span>
                                    ) : isNearExp ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        เหลือ {diffDays} วัน (ใกล้หมดอายุ)
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        เหลือ {diffDays > 0 ? diffDays : 665}{" "}
                                        วัน (ปกติ)
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            },
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-6 text-center text-[#94A3B8]"
                            >
                              ยังไม่มีประวัติ Lot สำหรับสินค้านี้
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer: Sticky Clean Actions */}
            <div className="bg-white px-6 py-4 border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#64748B] flex items-center gap-4">
                <span>
                  รหัสสินค้า:{" "}
                  <strong className="font-mono text-[#0F172A]">
                    {selectedItemDetail?.itemCode || "-"}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  คลังที่จัดเก็บ:{" "}
                  <strong className="text-[#0F172A]">
                    {selectedItemDetail?.stockBalances?.length || 0}
                  </strong>{" "}
                  คลัง
                </span>
                <span>•</span>
                <span>
                  จำนวนล็อตที่ใช้งาน:{" "}
                  <strong className="text-[#0F172A]">
                    {selectedItemDetail?.lots?.length || 0}
                  </strong>{" "}
                  ล็อต
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-[#E2EAF4] hover:bg-slate-50 text-[#334155] rounded-xl text-xs font-semibold transition-all shadow-2xs"
                >
                  ปิดหน้าต่าง (Close)
                </button>
                {selectedItemDetail && (
                  <>
                    <Link
                      href={`/inventory/stock-card?itemId=${selectedItemDetail.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <History className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>บัตรสต็อก (Stock Card)</span>
                    </Link>
                    <Link
                      href={`/inventory/items/detail?id=${encodeURIComponent(selectedItemDetail.id)}`}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>เปิดหน้ารายละเอียดและแก้ไข</span>
                    </Link>
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
