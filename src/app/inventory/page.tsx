'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Package,
  Layers,
  CircleDollarSign,
  AlertTriangle,
  AlertOctagon,
  CalendarClock,
  Clock,
  ArrowRight,
  TrendingUp,
  Building,
  RefreshCw,
  FileCheck2,
  Calendar,
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RotateCcw,
  SlidersHorizontal,
  ClipboardCheck,
  History,
  Eye,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Filter,
  Boxes,
  ShieldAlert,
  ChevronRight,
  Warehouse as WarehouseIcon,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatusBadge } from '@/components/ui/StatusBadge';

const CATEGORY_COLORS = ['#2563EB', '#60A5FA', '#0D9488', '#6366F1', '#8B5CF6', '#F28C28'];

export default function InventoryDashboardPage() {
  const { selectedWarehouse, setSelectedWarehouse, refreshKey, triggerRefresh, addToast } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Modals state
  const [selectedMovement, setSelectedMovement] = useState<any | null>(null);
  const [selectedLot, setSelectedLot] = useState<any | null>(null);
  const [selectedLowStockItem, setSelectedLowStockItem] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch warehouses list for quick selector
  useEffect(() => {
    fetch('/api/warehouses')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWarehouses(data);
      })
      .catch((err) => console.error('Error fetching warehouses:', err));
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    setLoading(true);
    const url = `/api/dashboard${selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : ''}`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedWarehouse, refreshKey]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    addToast('success', `คัดลอก ${label} (${text}) เรียบร้อยแล้ว`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4 font-sans">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] animate-pulse">
            <WarehouseIcon className="w-8 h-8" />
          </div>
          <RefreshCw className="w-5 h-5 text-[#2563EB] animate-spin absolute -top-1 -right-1" />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-bold text-[#14213D]">กำลังประมวลผลข้อมูลภาพรวมคลังสินค้า...</h3>
          <p className="text-xs text-[#64748B] mt-1">คำนวณยอดสต็อก ตรวจสอบ Lot วันหมดอายุ และวิเคราะห์ความเคลื่อนไหว</p>
        </div>
      </div>
    );
  }

  const { summary, alerts, pendingApprovals, warehouseSummary, categorySummary, recentMovements } = data;
  const currentWarehouseObj = warehouses.find((w) => w.id === selectedWarehouse);

  const kpis = [
    {
      title: 'รายการสินค้าทั้งหมด',
      subTitle: 'Total Items Active',
      value: summary.totalItems.toLocaleString(),
      unit: 'รายการ',
      sub: 'บันทึกในระบบและเปิดใช้งาน',
      icon: Package,
      color: 'text-[#2563EB] bg-[#EFF6FF] border-blue-200',
      href: '/inventory/items',
    },
    {
      title: 'ยอดสต็อกคงเหลือรวม',
      subTitle: 'Total Stock Balance',
      value: summary.totalStockQuantity.toLocaleString(),
      unit: 'หน่วยนับ',
      sub: currentWarehouseObj ? `เฉพาะคลัง ${currentWarehouseObj.name}` : 'จำนวนหน่วยรวมทุกคลังสินค้า',
      icon: Layers,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      href: '/inventory/stock',
    },
    {
      title: 'มูลค่าสต็อกรวม',
      subTitle: 'Total Inventory Value',
      value: `฿${summary.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: '',
      sub: 'คำนวณจากราคาทุนมาตรฐานเฉลี่ย',
      icon: CircleDollarSign,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      href: '/operations/reports',
    },
    {
      title: 'สินค้าใกล้หมด (Low Stock)',
      subTitle: 'Below Min Stock Point',
      value: summary.lowStockItems,
      unit: 'รายการ',
      sub: 'ต่ำกว่าเกณฑ์สต็อกความปลอดภัย',
      icon: AlertTriangle,
      color: summary.lowStockItems > 0 ? 'text-amber-600 bg-amber-50 border-amber-300' : 'text-[#64748B] bg-slate-50 border-[#E2EAF4]',
      highlight: summary.lowStockItems > 0,
      href: '/inventory/stock?status=LOW_STOCK',
    },
    {
      title: 'สินค้าหมดคลัง (Out of Stock)',
      subTitle: 'Zero Available Stock',
      value: summary.outOfStock,
      unit: 'รายการ',
      sub: 'พร้อมใช้เป็น 0 ต้องเร่งสั่งซื้อ',
      icon: AlertOctagon,
      color: summary.outOfStock > 0 ? 'text-rose-600 bg-rose-50 border-rose-300' : 'text-[#64748B] bg-slate-50 border-[#E2EAF4]',
      highlight: summary.outOfStock > 0,
      href: '/inventory/stock?status=OUT_OF_STOCK',
    },
    {
      title: 'สินค้าใกล้หมดอายุ (< 90 วัน)',
      subTitle: 'Near Expiry Control',
      value: summary.nearExpiry,
      unit: 'Lot',
      sub: 'ต้องเร่งจ่ายตามเกณฑ์ FEFO',
      icon: CalendarClock,
      color: summary.nearExpiry > 0 ? 'text-orange-600 bg-orange-50 border-orange-300' : 'text-[#64748B] bg-slate-50 border-[#E2EAF4]',
      highlight: summary.nearExpiry > 0,
      href: '/inventory/lots?filter=NEAR_EXPIRY',
    },
    {
      title: 'สินค้าหมดอายุ (Expired)',
      subTitle: 'Expired Quarantine',
      value: summary.expiredItems,
      unit: 'Lot',
      sub: 'ระงับจ่ายทันทีและรอตัดจำหน่าย',
      icon: Clock,
      color: summary.expiredItems > 0 ? 'text-red-700 bg-red-100 border-red-300' : 'text-[#64748B] bg-slate-50 border-[#E2EAF4]',
      highlight: summary.expiredItems > 0,
      href: '/inventory/lots?filter=EXPIRED',
    },
    {
      title: 'ธุรกรรมรอจัดการ (Pending)',
      subTitle: 'Awaiting Approvals',
      value: summary.pendingTransactions,
      unit: 'เอกสาร',
      sub: 'ใบรับ/เบิก/โอน/ปรับยอดรอตรวจสอบ',
      icon: FileCheck2,
      color: summary.pendingTransactions > 0 ? 'text-indigo-600 bg-indigo-50 border-indigo-300' : 'text-[#64748B] bg-slate-50 border-[#E2EAF4]',
      highlight: summary.pendingTransactions > 0,
      href: '/operations/approvals',
    },
  ];

  const quickActions = [
    { title: 'รับเข้าคลัง (GR)', desc: 'ตรวจรับสินค้าจาก PO', href: '/inventory/receiving', icon: ArrowDownToLine, color: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
    { title: 'เบิกจ่ายสินค้า (Issue)', desc: 'จ่ายยา/เวชภัณฑ์ตาม FEFO', href: '/inventory/issue', icon: ArrowUpFromLine, color: 'text-[#2563EB] bg-[#EFF6FF] hover:bg-blue-100 border-blue-200' },
    { title: 'โอนย้ายข้ามคลัง (TRF)', desc: 'ย้ายสินค้าระหว่างคลังย่อย', href: '/inventory/transfer', icon: ArrowLeftRight, color: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200' },
    { title: 'รับคืนพัสดุ (RET)', desc: 'รับคืนจากแผนก/หอผู้ป่วย', href: '/inventory/return', icon: RotateCcw, color: 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200' },
    { title: 'ปรับปรุงสต็อก (ADJ)', desc: 'นับเจอเกิน/ขาด/ชำรุด', href: '/inventory/adjustment', icon: SlidersHorizontal, color: 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200' },
    { title: 'ตรวจนับพัสดุ (Count)', desc: 'เปิดรอบนับ Cycle Count', href: '/inventory/count', icon: ClipboardCheck, color: 'text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200' },
    { title: 'บัตรสต็อก (Stock Card)', desc: 'ตรวจสอบประวัติแยกสินค้า', href: '/inventory/stock-card', icon: History, color: 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200' },
    { title: 'ผังคลังและตำแหน่ง', desc: 'คลังหลัก/ห้องผ่าตัด/ER', href: '/inventory/warehouses', icon: Building, color: 'text-[#64748B] bg-[#F5F8FC] hover:bg-slate-100 border-[#E2EAF4]' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans pb-12">
      {/* 1. Header Banner with Modern Airy SaaS Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-white border border-[#E2EAF4] p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Hospital ERP Inventory Command Center</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#059669] border border-emerald-200">
                FEFO Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14213D] flex items-center gap-3">
              <span>แดชบอร์ดภาพรวมระบบคลังสินค้า</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              ศูนย์รวมการควบคุมสินค้าคงคลังโรงพยาบาล บริหารจัดการ Lot และวันหมดอายุ (FEFO) ติดตามสถานะสต็อกแบบเรียลไทม์ และตรวจสอบความเคลื่อนไหวทางบัญชี
            </p>
          </div>

          {/* Right Controls: Warehouse Filter & Refresh */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 bg-white p-3 rounded-2xl border border-[#E2EAF4] shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#2563EB]" />
              <select
                aria-label="เลือกคลังสินค้าสำหรับกรองข้อมูล"
                value={selectedWarehouse || ''}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="bg-[#F5F8FC] text-[#14213D] text-xs font-semibold rounded-xl px-3 py-2 border border-[#E2EAF4] focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="">🏢 ทุกคลังสินค้า (รวมทั้งโรงพยาบาล)</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    📦 {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => triggerRefresh()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Operations Quick Dock (ศูนย์ปฏิบัติการคลังด่วน) */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
              ศูนย์ปฏิบัติการและคลังพัสดุด่วน (Quick Operations Dock)
            </h2>
          </div>
          <span className="text-[11px] text-[#94A3B8] font-medium">คลิกเพื่อเปิดหน้าทำรายการ</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs ${action.color}`}
              >
                <Icon className="w-5 h-5 mb-1.5 shrink-0" />
                <span className="text-xs font-bold leading-tight line-clamp-1">{action.title}</span>
                <span className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{action.desc}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Pending Approvals Executive Alert Banner */}
      {summary.pendingTransactions > 0 && (
        <div className="bg-[#EEF2FF] rounded-2xl border border-[#C7D2FE] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6366F1] text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#14213D]">
                  มีรายการรอตรวจสอบและอนุมัติทั้งหมด {summary.pendingTransactions} รายการ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#6366F1] border border-[#C7D2FE]">
                  Action Required
                </span>
              </div>
              <div className="text-xs text-[#64748B] flex flex-wrap items-center gap-3 mt-1">
                {pendingApprovals.goodsReceipts > 0 && (
                  <span>• ใบรับเข้า (GR) รอตรวจ: <b>{pendingApprovals.goodsReceipts}</b></span>
                )}
                {pendingApprovals.issues > 0 && (
                  <span>• ใบเบิกจ่าย รออนุมัติ: <b>{pendingApprovals.issues}</b></span>
                )}
                {pendingApprovals.transfers > 0 && (
                  <span>• ใบโอนย้าย อยู่ระหว่างส่ง: <b>{pendingApprovals.transfers}</b></span>
                )}
                {pendingApprovals.adjustments > 0 && (
                  <span>• ใบปรับยอด รออนุมัติ: <b>{pendingApprovals.adjustments}</b></span>
                )}
                {pendingApprovals.returns > 0 && (
                  <span>• ใบคืนพัสดุ รอตรวจ: <b>{pendingApprovals.returns}</b></span>
                )}
              </div>
            </div>
          </div>

          <Link
            href="/operations/approvals"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>เปิดศูนย์อนุมัติเอกสาร</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4. 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              href={kpi.href}
              className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between group ${
                kpi.highlight ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-[#E2EAF4] shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#14213D] block group-hover:text-[#2563EB] transition-colors">
                      {kpi.title}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-mono block">
                      {kpi.subTitle}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border shrink-0 ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#14213D] tracking-tight tabular-nums">
                    {kpi.value}
                  </span>
                  {kpi.unit && <span className="text-xs text-[#64748B] font-medium">{kpi.unit}</span>}
                </div>
              </div>

              <div className="text-[11px] text-[#94A3B8] mt-2.5 pt-2.5 border-t border-[#E2EAF4] flex items-center justify-between">
                <span className="truncate max-w-[150px]">{kpi.sub}</span>
                <span className="text-[#2563EB] font-bold group-hover:translate-x-0.5 transition-transform flex items-center">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 5. Charts Section: Warehouse Distribution & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouse Stock Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#2563EB]" />
                  <h2 className="text-sm font-bold text-[#14213D]">
                    ปริมาณสินค้าคงคลังแยกตามคลัง (Warehouse Stock Distribution)
                  </h2>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  จำนวนหน่วยคงคลังและมูลค่าสต็อกในแต่ละคลังย่อยของโรงพยาบาล
                </p>
              </div>
              <span className="text-xs px-3 py-1 bg-blue-50 text-[#2563EB] rounded-full font-bold border border-blue-200">
                {warehouseSummary.length} คลังสินค้า
              </span>
            </div>

            <div className="h-68 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseSummary} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#14213D', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      name === 'totalQty' ? `${Number(val).toLocaleString()} หน่วย` : `฿${Number(val).toLocaleString()}`,
                      name === 'totalQty' ? 'จำนวนคงคลัง' : 'มูลค่ารวม (บาท)',
                    ]}
                  />
                  <Bar dataKey="totalQty" fill="#2563EB" radius={[6, 6, 0, 0]} name="totalQty" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#E2EAF4] pt-4 mt-2">
            {warehouseSummary.slice(0, 6).map((w: any) => (
              <div key={w.id} className="p-2.5 rounded-xl bg-[#F5F8FC] border border-[#E2EAF4] text-xs">
                <div className="flex items-center justify-between font-bold text-[#14213D]">
                  <span className="truncate max-w-[110px]">{w.name}</span>
                  <span className="text-[#2563EB] font-mono text-[11px]">{w.code}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B] mt-1">
                  <span>{w.totalQty.toLocaleString()} ชิ้น</span>
                  <span className="font-semibold text-[#14213D]">฿{(w.totalValue / 1000).toFixed(1)}k</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Value Pie Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#8B5CF6]" />
                  <h2 className="text-sm font-bold text-[#14213D]">สัดส่วนมูลค่าตามหมวดหมู่</h2>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">Medicine, Supplies & Medical Goods</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySummary}
                    dataKey="totalValue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={4}
                  >
                    {categorySummary.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#14213D', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => `฿${Number(val).toLocaleString()}`}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-[#E2EAF4] pt-3 space-y-2">
            {categorySummary.map((c: any, i: number) => (
              <div key={c.id} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 truncate max-w-[160px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-[#64748B] truncate">{c.name}</span>
                </div>
                <span className="font-bold text-[#14213D] tabular-nums">
                  ฿{c.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Critical Operational Tables: Expiry Control (FEFO) & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Control Table (FEFO) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                    <span>การควบคุมวันหมดอายุ (FEFO & Expiry)</span>
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-bold border border-orange-200">
                      คลิกดู Lot 360°
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">ลำดับการจ่ายตามวันหมดอายุเพื่อป้องกันของเสีย</p>
                </div>
              </div>
              <Link href="/inventory/lots" className="text-xs text-[#2563EB] font-bold hover:underline flex items-center gap-1">
                <span>ดู Lot ทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2EAF4]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Lot Number</th>
                    <th className="py-2.5 px-3">สินค้า</th>
                    <th className="py-2.5 px-3 text-right">จำนวน</th>
                    <th className="py-2.5 px-3">วันหมดอายุ</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAF4]">
                  {/* Expired Lots */}
                  {alerts.expiredLots.map((l: any) => (
                    <tr
                      key={l.lotId}
                      onClick={() => setSelectedLot(l)}
                      className="bg-rose-50/40 hover:bg-rose-100/50 cursor-pointer transition-colors group"
                      title="คลิกเพื่อเปิดดูรายละเอียด Lot และดำเนินการตัดทำลาย"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                        {l.lotNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#14213D] truncate max-w-[140px]">
                        <div>{l.itemName}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{l.warehouseName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#14213D] tabular-nums">
                        {l.currentQty.toLocaleString()} {l.unit}
                      </td>
                      <td className="py-2.5 px-3 text-red-700 font-semibold whitespace-nowrap">
                        {new Date(l.expiryDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                          หมดอายุ (-{l.daysExpired} วัน)
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Near Expiry Lots */}
                  {alerts.nearExpiryLots.map((l: any) => (
                    <tr
                      key={l.lotId}
                      onClick={() => setSelectedLot(l)}
                      className="hover:bg-[#F5F8FC] cursor-pointer transition-colors group"
                      title="คลิกเพื่อเปิดดูรายละเอียด Lot แบบเต็มจอ"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-[#2563EB]">
                        {l.lotNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#14213D] truncate max-w-[140px]">
                        <div>{l.itemName}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{l.warehouseName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#14213D] tabular-nums">
                        {l.currentQty.toLocaleString()} {l.unit}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">
                        {new Date(l.expiryDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          เหลือ {l.daysRemaining} วัน
                        </span>
                      </td>
                    </tr>
                  ))}

                  {alerts.expiredLots.length === 0 && alerts.nearExpiryLots.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                        <div className="flex flex-col items-center gap-1.5">
                          <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                          <span className="text-xs font-semibold text-[#14213D]">ไม่มี Lot ใกล้หมดอายุในเกณฑ์ 90 วัน</span>
                          <span className="text-[11px] text-[#94A3B8]">พัสดุและยาในคลังมีอายุการใช้งานอยู่ในเกณฑ์ปลอดภัย</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#94A3B8] flex items-center justify-between pt-2 border-t border-[#E2EAF4]">
            <span>เกณฑ์แจ้งเตือน FEFO: หมดอายุภายใน 90 วัน</span>
            <span className="text-[#64748B] font-medium">รวม {alerts.expiredLots.length + alerts.nearExpiryLots.length} รายการ</span>
          </div>
        </div>

        {/* Low Stock Alerts Table */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                    <span>สินค้าใกล้หมด / ขาดสต็อก (Low Stock)</span>
                    <span className="text-[10px] text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                      คลิกดู 360°
                    </span>
                  </h2>
                  <p className="text-xs text-[#64748B]">ยอดพร้อมจ่ายต่ำกว่าระดับความปลอดภัย (Min Stock)</p>
                </div>
              </div>
              <Link href="/inventory/stock?status=LOW_STOCK" className="text-xs text-[#2563EB] font-bold hover:underline flex items-center gap-1">
                <span>ดูสต็อกทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2EAF4]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">รหัส / สินค้า</th>
                    <th className="py-2.5 px-3">คลังจัดเก็บ</th>
                    <th className="py-2.5 px-3 text-right">พร้อมจ่าย</th>
                    <th className="py-2.5 px-3 text-right">เกณฑ์ Min</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EAF4]">
                  {alerts.lowStockItems.map((item: any) => (
                    <tr
                      key={`${item.itemId}-${item.warehouseName}`}
                      onClick={() => setSelectedLowStockItem(item)}
                      className="hover:bg-[#F5F8FC] cursor-pointer transition-colors group"
                      title="คลิกเพื่อดูข้อมูลสินค้า 360° และเปิดใบขอซื้อ PR"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#2563EB] group-hover:underline">
                          {item.itemCode}
                        </div>
                        <div className="font-medium text-[#14213D] truncate max-w-[140px]">{item.itemName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">{item.warehouseName}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#14213D] tabular-nums">
                        {item.available.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#64748B] tabular-nums">
                        {item.minStock.toLocaleString()} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}

                  {alerts.lowStockItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#94A3B8]">
                        <div className="flex flex-col items-center gap-1.5">
                          <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                          <span className="text-xs font-semibold text-[#14213D]">สต็อกสินค้าอยู่ในเกณฑ์ปลอดภัยทุกรายการ</span>
                          <span className="text-[11px] text-[#94A3B8]">ไม่มีรายการสินค้าที่ต่ำกว่าระดับ Min Safety Stock</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-[#94A3B8] flex items-center justify-between pt-2 border-t border-[#E2EAF4]">
            <span>คำนวณจาก On Hand หักลบยอดจอง (Reserved)</span>
            <span className="text-[#64748B] font-medium">รวม {alerts.lowStockItems.length} รายการเตือน</span>
          </div>
        </div>
      </div>

      {/* 7. Recent Movements Audit Feed with Clickable Detail Modals */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2EAF4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <span>บันทึกความเคลื่อนไหวล่าสุด (Recent Stock Movements Audit)</span>
                <span className="text-[10px] text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  คลิกเลขที่เอกสารเพื่อดูข้อมูลเต็มจอ
                </span>
              </h2>
              <p className="text-xs text-[#64748B]">
                ประวัติการรับเข้า เบิกจ่าย โอนย้าย และปรับปรุงยอดตามมาตรฐานบัญชีคลังสินค้า
              </p>
            </div>
          </div>
          <Link
            href="/inventory/stock-card"
            className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#164EAB] hover:underline shrink-0"
          >
            <span>เปิดบัตรสต็อกทั้งหมด (Stock Card)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E2EAF4]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#64748B] border-b border-[#E2EAF4] font-semibold">
              <tr>
                <th className="py-3 px-3">วัน/เวลา</th>
                <th className="py-3 px-3">เลขที่เอกสาร</th>
                <th className="py-3 px-3">ประเภท</th>
                <th className="py-3 px-3">สินค้า</th>
                <th className="py-3 px-3 text-right">จำนวน (+/-)</th>
                <th className="py-3 px-3 text-right">คงเหลือหลังทำ</th>
                <th className="py-3 px-3">ผู้ทำรายการ</th>
                <th className="py-3 px-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EAF4]">
              {recentMovements.map((m: any) => (
                <tr key={m.id} className="hover:bg-[#F5F8FC] transition-colors">
                  <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap font-mono text-[11px]">
                    {new Date(m.createdAt).toLocaleString('th-TH', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMovement(m)}
                      className="font-mono font-bold text-[#2563EB] hover:text-[#164EAB] hover:underline"
                      title="คลิกเพื่อดูรายละเอียดเอกสารและไทม์ไลน์แบบเต็มจอ"
                    >
                      {m.documentNumber}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F8FC] text-[#64748B] border border-[#E2EAF4]">
                      {m.movementType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#14213D] truncate max-w-[200px]">
                    <div>{m.item?.itemName}</div>
                    <div className="text-[10px] text-[#94A3B8] font-mono">{m.item?.itemCode}</div>
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                      m.quantity > 0 ? 'text-[#059669]' : 'text-[#E11D48]'
                    }`}
                  >
                    {m.quantity > 0 ? `+${m.quantity.toLocaleString()}` : m.quantity.toLocaleString()} {m.item?.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#14213D] tabular-nums whitespace-nowrap">
                    {m.balanceAfter?.toLocaleString()} {m.item?.unit}
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">{m.createdBy}</td>
                  <td className="py-2.5 px-3 text-[#94A3B8] text-[11px] truncate max-w-[200px]">
                    {m.remark || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Full-Screen Stock Movement & Document Detail Modal               */}
      {/* ========================================================================= */}
      {selectedMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-2xs shrink-0">
                  <TrendingUp className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Doc Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedMovement.documentNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedMovement.documentNumber, 'เลขที่เอกสาร')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่เอกสาร"
                      >
                        {copiedId === selectedMovement.documentNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {selectedMovement.movementType}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      รายละเอียดธุรกรรมความเคลื่อนไหวสต็อก
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Stock Movement Audit)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#334155] rounded-xl text-xs font-semibold border border-[#E2EAF4] shadow-2xs transition-all"
                  title="พิมพ์บัตรตรวจสต็อก"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMovement(null)}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors ml-1"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F5F8FC]">
              {/* 4 Financial & Balance Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    จำนวนในธุรกรรม (Qty In/Out)
                  </span>
                  <div className={`text-xl font-bold mt-1 tabular-nums ${selectedMovement.quantity >= 0 ? 'text-[#059669]' : 'text-[#E11D48]'}`}>
                    {selectedMovement.quantity > 0 ? `+${selectedMovement.quantity.toLocaleString()}` : selectedMovement.quantity.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedMovement.item?.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    {selectedMovement.quantity >= 0 ? 'รับเข้าคลังสินค้า' : 'ตัดจ่ายออกจากคลัง'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    ยอดคงเหลือก่อนหน้า (Before)
                  </span>
                  <div className="text-xl font-bold text-[#14213D] mt-1 tabular-nums">
                    {selectedMovement.balanceBefore?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedMovement.item?.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">ยอดสต็อกเดิมในระบบ</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider block">
                    ยอดคงเหลือสุทธิ (After)
                  </span>
                  <div className="text-xl font-bold text-[#2563EB] mt-1 tabular-nums">
                    {selectedMovement.balanceAfter?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedMovement.item?.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#059669] mt-1 flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    <span>อัปเดตยอดคงเหลือเรียลไทม์</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#8B5CF6] uppercase tracking-wider block">
                    มูลค่าธุรกรรมประเมิน
                  </span>
                  <div className="text-xl font-bold text-[#8B5CF6] mt-1 tabular-nums">
                    ฿{Math.abs(selectedMovement.quantity * (selectedMovement.item?.standardCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-[#8B5CF6] mt-1">
                    ทุนมาตรฐาน: ฿{(selectedMovement.item?.standardCost || 0).toLocaleString()} / {selectedMovement.item?.unit}
                  </div>
                </div>
              </div>

              {/* Transaction Metadata Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#2563EB]" />
                    <span>ข้อมูลสินค้าและบันทึกการทำธุรกรรม (Transaction Details)</span>
                  </h4>
                  <span className="font-mono text-xs text-[#94A3B8]">ID: {selectedMovement.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">รายการสินค้า</span>
                    <span className="font-bold text-[#14213D] text-sm block">{selectedMovement.item?.itemName}</span>
                    <span className="font-mono text-[#2563EB] block text-[11px] font-semibold">{selectedMovement.item?.itemCode}</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">ผู้ทำรายการ (Operator)</span>
                    <span className="font-bold text-[#14213D] text-sm block">{selectedMovement.createdBy}</span>
                    <span className="text-[#64748B] block text-[11px]">บันทึกผ่านระบบคลังสินค้า</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">วันและเวลาบันทึก</span>
                    <span className="font-mono font-bold text-[#14213D] text-sm block">
                      {new Date(selectedMovement.createdAt).toLocaleString('th-TH')}
                    </span>
                    <span className="text-[#94A3B8] block text-[11px]">เวลามาตรฐานระบบ</span>
                  </div>
                </div>

                {selectedMovement.remark && (
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-[#164EAB]">
                    <span className="font-bold text-[#2563EB]">หมายเหตุเพิ่มเติม: </span>
                    {selectedMovement.remark}
                  </div>
                )}
              </div>

              {/* Traceability & Audit Step Pipeline */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>เส้นทางการตรวจสอบธุรกรรมทางบัญชี (Audit Provenance Timeline)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#059669] font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px]">1</span>
                      <span>สร้างธุรกรรม</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">ออกเอกสาร {selectedMovement.movementType}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#059669] font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px]">2</span>
                      <span>ตรวจสอบ Lot/FEFO</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">ตรวจสอบวันหมดอายุและสต็อก</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#059669] font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px]">3</span>
                      <span>การรับ/จ่ายพัสดุ</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">ส่งมอบสินค้าเรียบร้อย</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#059669] font-bold">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-[10px]">4</span>
                      <span>ลงบัญชี Stock Card</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">บันทึกยอดคงเหลือสุทธิ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#E2EAF4] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-[#94A3B8]">
                เอกสารบันทึกในระบบโรงพยาบาล • การตรวจสอบข้อมูลแบบสองทาง (Two-Way Traceability)
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/inventory/stock-card?search=${selectedMovement.documentNumber}`}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  เปิดตรวจสอบในหน้าบัตรสต็อก (Stock Card)
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedMovement(null)}
                  className="px-4 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#14213D] rounded-xl text-xs font-semibold transition-colors border border-[#E2EAF4]"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Full-Screen Lot 360° & Expiry Inspection Modal                  */}
      {/* ========================================================================= */}
      {selectedLot && (
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
                      <span>{selectedLot.lotNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedLot.lotNumber, 'หมายเลข Lot')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอก Lot Number"
                      >
                        {copiedId === selectedLot.lotNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedLot.daysExpired > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {selectedLot.daysExpired > 0 ? 'หมดอายุแล้ว (Expired)' : 'ใกล้หมดอายุ (Near Expiry)'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      ควบคุม Lot & วันหมดอายุ (FEFO)
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (FEFO Lot Management)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#334155] rounded-xl text-xs font-semibold border border-[#E2EAF4] shadow-2xs transition-all"
                  title="พิมพ์สติ๊กเกอร์ Lot"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLot(null)}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors ml-1"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F5F8FC]">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    ยอดคงคลังใน Lot
                  </span>
                  <div className="text-xl font-bold text-[#14213D] mt-1 tabular-nums">
                    {selectedLot.currentQty?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedLot.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">คงเหลือจริงในคลังสินค้า</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    สถานะระยะเวลาคงเหลือ
                  </span>
                  <div className={`text-xl font-bold mt-1 tabular-nums ${
                    selectedLot.daysExpired > 0 ? 'text-[#E11D48]' : 'text-[#D97706]'
                  }`}>
                    {selectedLot.daysExpired > 0
                      ? `หมดอายุแล้ว ${selectedLot.daysExpired} วัน`
                      : `เหลืออีก ${selectedLot.daysRemaining} วัน`}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    เกณฑ์ควบคุม FEFO ของโรงพยาบาล
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    วันหมดอายุ (EXP Date)
                  </span>
                  <div className="text-xl font-bold text-[#14213D] mt-1">
                    {new Date(selectedLot.expiryDate).toLocaleDateString('th-TH')}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">วันที่ระบุบนบรรจุภัณฑ์</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider block">
                    คลังสินค้าที่จัดเก็บ
                  </span>
                  <div className="text-lg font-bold text-[#2563EB] mt-1 truncate">
                    {selectedLot.warehouseName}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">ตำแหน่งเก็บปัจจุบัน</div>
                </div>
              </div>

              {/* Lot Profile Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F28C28]" />
                  <span>ข้อมูลสินค้าประจำ Lot (Item Information)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">ชื่อสินค้า / ยา</span>
                    <span className="font-bold text-[#14213D] text-sm block">{selectedLot.itemName}</span>
                  </div>
                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">รหัสสินค้า (Item Code)</span>
                    <span className="font-mono font-bold text-[#2563EB] text-sm block">{selectedLot.itemCode}</span>
                  </div>
                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-[#94A3B8] block text-[11px]">เกณฑ์ FEFO Priority</span>
                    <span className="font-bold text-[#D97706] text-sm block">เร่งจ่ายลำดับแรก (High Priority)</span>
                  </div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">คำแนะนำการจัดการ Lot: </span>
                    {selectedLot.daysExpired > 0
                      ? 'สินค้าหมดอายุแล้ว ให้ระงับการจ่ายทันที และสร้างใบปรับยอดตัดทำลาย (Scrap Adjustment)'
                      : 'สินค้าใกล้หมดอายุในเกณฑ์ 90 วัน ควรเร่งเบิกจ่ายตามหลัก First-Expired, First-Out (FEFO)'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedLot.daysExpired > 0 ? (
                    <Link
                      href="/inventory/adjustment"
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      เปิดใบปรับยอดตัดทำลาย
                    </Link>
                  ) : (
                    <Link
                      href="/inventory/issue"
                      className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      เบิกจ่ายพัสดุด่วน (FEFO)
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-[#E2EAF4] flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-[#94A3B8]">
                ระบบควบคุมความปลอดภัยด้านเวชภัณฑ์และมาตรฐานกระทรวงสาธารณสุข
              </span>
              <button
                type="button"
                onClick={() => setSelectedLot(null)}
                className="px-4 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#14213D] rounded-xl text-xs font-semibold transition-colors border border-[#E2EAF4]"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Full-Screen 360° Item & Low Stock Inspection Modal              */}
      {/* ========================================================================= */}
      {selectedLowStockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
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
                      <span>{selectedLowStockItem.itemCode}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedLowStockItem.itemCode, 'รหัสสินค้า')}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกรหัสสินค้า"
                      >
                        {copiedId === selectedLowStockItem.itemCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <StatusBadge status={selectedLowStockItem.status} />
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      {selectedLowStockItem.itemName}
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (ตรวจสอบสต็อกพัสดุ 360°)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/procurement/requisitions"
                  className="px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-[#D97706] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>เปิดใบขอซื้อ (PR)</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedLowStockItem(null)}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors ml-1"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F5F8FC]">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                    ยอดพร้อมจ่าย (Available)
                  </span>
                  <div className="text-2xl font-extrabold text-[#E11D48] mt-1 tabular-nums">
                    {selectedLowStockItem.available?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedLowStockItem.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">หักลบยอดจองแล้ว</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    ยอดคงคลังรวม (On Hand)
                  </span>
                  <div className="text-2xl font-bold text-[#14213D] mt-1 tabular-nums">
                    {selectedLowStockItem.onHand?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedLowStockItem.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">ปริมาณที่อยู่ในคลัง</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                    ระดับปลอดภัยขั้นต่ำ (Min Stock)
                  </span>
                  <div className="text-2xl font-bold text-[#D97706] mt-1 tabular-nums">
                    {selectedLowStockItem.minStock?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedLowStockItem.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">เกณฑ์แจ้งเตือนสั่งซื้อ</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider block">
                    จุดสั่งซื้อซ้ำ (Reorder Point)
                  </span>
                  <div className="text-2xl font-bold text-[#2563EB] mt-1 tabular-nums">
                    {selectedLowStockItem.reorderPoint?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">{selectedLowStockItem.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">แนะนำออกใบขอซื้อ PR ทันที</div>
                </div>
              </div>

              {/* Deficit Alert Banner */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                  <div className="text-xs text-rose-900">
                    <span className="font-bold">วิเคราะห์สถานะสต็อก: </span>
                    ยอดพร้อมจ่ายขาดแคลนจากเกณฑ์ขั้นต่ำจำนวน{' '}
                    <b className="underline">
                      {(selectedLowStockItem.minStock - selectedLowStockItem.available).toLocaleString()}{' '}
                      {selectedLowStockItem.unit}
                    </b>{' '}
                    ในคลัง <b>{selectedLowStockItem.warehouseName}</b> แนะนำให้ออกใบขอซื้อ PR หรือโอนย้ายจากคลังสำรอง
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/inventory/transfer`}
                    className="px-3.5 py-2 bg-white hover:bg-[#F5F8FC] text-[#14213D] rounded-xl text-xs font-bold transition-all shadow-xs border border-[#E2EAF4]"
                  >
                    โอนย้ายพัสดุ
                  </Link>
                  <Link
                    href={`/procurement/requisitions`}
                    className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    สร้างใบขอซื้อทันที (PR)
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-[#E2EAF4] flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-[#94A3B8]">
                ระบบจัดการระดับสต็อกอัตโนมัติ • ป้องกันความเสี่ยงสินค้าขาดคลัง (Stockout Prevention)
              </span>
              <button
                type="button"
                onClick={() => setSelectedLowStockItem(null)}
                className="px-4 py-2 bg-[#F5F8FC] hover:bg-slate-200 text-[#14213D] rounded-xl text-xs font-semibold transition-colors border border-[#E2EAF4]"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
