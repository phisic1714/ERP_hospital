'use client';

import React, { useState, useEffect } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import {
  PieChart,
  Plus,
  Search,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Eye,
  Copy,
  Printer,
  X,
  Maximize2,
  FileText,
  Check,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';

export default function ProcurementPlansPage() {
  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();
  const [plans, setPlans] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // Full-screen Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<any | null>(null);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fiscalYear, setFiscalYear] = useState('2569');
  const [name, setName] = useState('');
  const [categoryCode, setCategoryCode] = useState('ALL');
  const [allocatedBudget, setAllocatedBudget] = useState('1000000');
  const [remarks, setRemarks] = useState('');
  const [planLines, setPlanLines] = useState<any[]>([
    { itemId: '', targetQuantity: 1000, estimatedUnitPrice: 50 },
  ]);

  const loadPlans = () => {
    setLoading(true);
    fetch('/api/procurement/plans')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlans(data);
          if (data.length > 0 && !selectedPlan) {
            setSelectedPlan(data[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPlans();
    fetch('/api/items')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
          if (data.length > 0) {
            setPlanLines([{ itemId: data[0].id, targetQuantity: 1000, estimatedUnitPrice: data[0].standardCost || 50 }]);
          }
        }
      });
  }, [refreshKey]);

  const handleAddLine = () => {
    if (items.length > 0) {
      setPlanLines([
        ...planLines,
        { itemId: items[0].id, targetQuantity: 500, estimatedUnitPrice: items[0].standardCost || 50 },
      ]);
    }
  };

  const handleRemoveLine = (index: number) => {
    if (planLines.length > 1) {
      setPlanLines(planLines.filter((_, idx) => idx !== index));
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...planLines];
    updated[index][field] = value;
    if (field === 'itemId') {
      const it = items.find((i) => i.id === value);
      if (it) {
        updated[index].estimatedUnitPrice = it.standardCost || 0;
      }
    }
    setPlanLines(updated);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('warning', 'กรุณาระบุชื่อแผนจัดซื้อ');
      return;
    }

    try {
      const res = await fetch('/api/procurement/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYear,
          name,
          categoryCode,
          allocatedBudget: Number(allocatedBudget),
          remarks,
          createdBy: currentUser.name,
          lines: planLines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create plan');

      addToast('success', `สร้างแผนจัดซื้อ ${data.planNumber} สำเร็จ`);
      setShowCreateModal(false);
      setName('');
      setRemarks('');
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Metrics
  const totalAllocated = plans.reduce((s, p) => s + (p.allocatedBudget || 0), 0);
  const totalCommitted = plans.reduce((s, p) => s + (p.committedBudget || 0), 0);
  const totalRemaining = plans.reduce((s, p) => s + (p.remainingBudget || 0), 0);
  const percentUsed = totalAllocated > 0 ? Math.round((totalCommitted / totalAllocated) * 100) : 0;

  const filteredPlans = plans.filter((p) => {
    if (!search) return true;
    return (
      p.planNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F28C28] mb-1">
            <Link href="/procurement" className="hover:underline">
              ระบบจัดซื้อจัดจ้าง
            </Link>
            <span>/</span>
            <span className="text-slate-500">แผนจัดซื้อ (PP)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#14213D] flex items-center gap-2">
            <PieChart className="w-7 h-7 text-[#F28C28]" />
            <span>แผนการจัดซื้อจัดจ้างและกรอบงบประมาณ (Procurement Plans - PP)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ควบคุมงบประมาณจัดซื้อยาและเวชภัณฑ์ประจำปีงบประมาณ ป้องกันการขอซื้อเกินกรอบวงเงิน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerRefresh()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเฟรช</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างแผนจัดซื้อใหม่ (PP)</span>
          </button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>งบประมาณที่ได้รับจัดสรรรวม</span>
            <DollarSign className="w-4 h-4 text-[#F28C28]" />
          </div>
          <div className="text-xl font-bold text-[#14213D] mt-2 tabular-nums">
            {totalAllocated.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">จาก {plans.length} แผนงานประจำปี</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>ยอดผูกพันจัดซื้อแล้ว (Committed)</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600 mt-2 tabular-nums">
            {totalCommitted.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">ถูกตัดยอดไปใน PR และ PO</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>งบประมาณคงเหลือ (Remaining)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-2 tabular-nums">
            {totalRemaining.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">สามารถเปิด PR ขอซื้อได้</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>สัดส่วนการใช้งบประมาณ</span>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-purple-700 mt-2 tabular-nums">{percentUsed}%</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentUsed > 90 ? 'bg-rose-500' : percentUsed > 70 ? 'bg-amber-500' : 'bg-[#F28C28]'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Plans List + Plan Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Plans List (1 col) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#14213D]">รายการแผนจัดซื้อ ({filteredPlans.length})</h2>
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="ค้นหาแผน..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-2 py-1 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F28C28]"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPlans.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">ไม่พบแผนจัดซื้อ</div>
            ) : (
              filteredPlans.map((p) => {
                const isSelected = selectedPlan?.id === p.id;
                const pPct =
                  p.allocatedBudget > 0
                    ? Math.round((p.committedBudget / p.allocatedBudget) * 100)
                    : 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#F28C28] bg-[#FFF7ED]/50 shadow-sm'
                        : 'border-[#E2EAF4] hover:bg-[#F5F8FC]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(p);
                            setSelectedPlanDetail(p);
                            setShowDetailModal(true);
                          }}
                          className="font-mono text-xs font-bold text-[#D97706] bg-blue-100/60 hover:bg-[#F28C28] hover:text-white px-2 py-0.5 rounded transition-all"
                          title="คลิกเพื่อดูรายละเอียดแผนจัดซื้อแบบเต็มจอ"
                        >
                          {p.planNumber}
                        </button>
                        <div className="font-semibold text-xs text-[#14213D] mt-1 line-clamp-1">
                          {p.name}
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>ปีงบ {p.fiscalYear}</span>
                      <span className="font-semibold text-[#14213D] tabular-nums">
                        {p.allocatedBudget.toLocaleString()} บ.
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#F28C28] rounded-full"
                        style={{ width: `${Math.min(pPct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Plan Detail (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm space-y-6">
          {selectedPlan ? (
            <>
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E2EAF4] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanDetail(selectedPlan);
                        setShowDetailModal(true);
                      }}
                      className="font-mono text-sm font-bold text-[#D97706] bg-blue-100/80 hover:bg-[#F28C28] hover:text-white px-2.5 py-1 rounded-lg transition-all"
                      title="คลิกเพื่อดูรายละเอียดแบบเต็มจอ"
                    >
                      {selectedPlan.planNumber}
                    </button>
                    <StatusBadge status={selectedPlan.status} />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanDetail(selectedPlan);
                        setShowDetailModal(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#FFF7ED] text-slate-700 hover:text-[#D97706] border border-[#E2EAF4] hover:border-blue-300 rounded-lg text-xs font-semibold transition-all"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>ขยายดูเต็มจอ</span>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-[#14213D] mt-2">{selectedPlan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedPlan.remarks || 'ไม่มีหมายเหตุเพิ่มเติม'}</p>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400">ปีงบประมาณ</div>
                  <div className="text-sm font-bold text-[#14213D]">{selectedPlan.fiscalYear}</div>
                </div>
              </div>

              {/* Progress & Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4]">
                  <div className="text-[11px] text-slate-500">กรอบงบประมาณที่ได้รับจัดสรร</div>
                  <div className="text-base font-bold text-[#14213D] mt-1 tabular-nums">
                    {selectedPlan.allocatedBudget.toLocaleString()} บาท
                  </div>
                </div>
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-[11px] text-amber-700">ใช้ไปใน PR/PO แล้ว</div>
                  <div className="text-base font-bold text-amber-700 mt-1 tabular-nums">
                    {selectedPlan.committedBudget.toLocaleString()} บาท
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-emerald-700">งบประมาณคงเหลือพร้อมขอซื้อ</div>
                  <div className="text-base font-bold text-emerald-700 mt-1 tabular-nums">
                    {selectedPlan.remainingBudget.toLocaleString()} บาท
                  </div>
                </div>
              </div>

              {/* Plan Items Table */}
              <div>
                <h4 className="text-xs font-bold text-[#14213D] uppercase tracking-wider mb-3">
                  รายการสินค้าและเป้าหมายตามแผน ({selectedPlan.lines?.length || 0} รายการ)
                </h4>
                <div className="overflow-x-auto border border-[#E2EAF4] rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F5F8FC] text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">รหัส / ชื่อสินค้า</th>
                        <th className="py-2.5 px-3 text-right">จำนวนเป้าหมาย</th>
                        <th className="py-2.5 px-3 text-right">ราคาประเมิน</th>
                        <th className="py-2.5 px-3 text-right">งบประมาณรวม</th>
                        <th className="py-2.5 px-3 text-right">จัดซื้อไปแล้ว</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPlan.lines?.map((line: any) => (
                        <tr key={line.id} className="hover:bg-[#F5F8FC]">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#14213D]">{line.item?.itemName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{line.item?.itemCode}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                            {line.targetQuantity?.toLocaleString()} {line.item?.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                            {line.estimatedUnitPrice?.toLocaleString()} บ.
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#14213D]">
                            {line.estimatedTotal?.toLocaleString()} บ.
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-amber-600 font-semibold">
                            {line.usedQuantity?.toLocaleString()} {line.item?.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Action */}
              <div className="flex items-center justify-between p-4 bg-[#FFF7ED]/60 rounded-xl border border-orange-200/60">
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-5 h-5 text-[#F28C28]" />
                  <div>
                    <div className="font-semibold text-xs text-[#14213D]">เปิดใบขอซื้อ (PR) อ้างอิงแผนนี้</div>
                    <div className="text-[11px] text-slate-500">ดึงกรอบงบประมาณและรายการสินค้าไปยังใบขอซื้อได้ทันที</div>
                  </div>
                </div>
                <Link
                  href={`/procurement/requisitions?planId=${selectedPlan.id}`}
                  className="px-3.5 py-1.5 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <span>เปิดใบขอซื้อ (PR)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">เลือกแผนจัดซื้อเพื่อดูรายละเอียด</div>
          )}
        </div>
      </div>

      {/* Modal: Create Plan */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#14213D] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F28C28]" />
                <span>สร้างแผนการจัดซื้อจัดจ้างใหม่ (Procurement Plan)</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีงบประมาณ</label>
                  <input
                    type="number"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white focus:ring-2 focus:ring-[#F28C28]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่สินค้า</label>
                  <select
                    value={categoryCode}
                    onChange={(e) => setCategoryCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white focus:ring-2 focus:ring-[#F28C28] cursor-pointer"
                  >
                    <option value="ALL">ทุกหมวดหมู่ (All Categories)</option>
                    <option value="MED">ยาและสารน้ำ (Medicine)</option>
                    <option value="SUPPLY">เวชภัณฑ์ทางการแพทย์ (Medical Supplies)</option>
                    <option value="GEN">วัสดุทั่วไปและน้ำยาฆ่าเชื้อ (General Supplies)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อแผนการจัดซื้อ</label>
                <input
                  type="text"
                  placeholder="เช่น แผนจัดซื้อยาหลักประจำปีงบประมาณ 2569"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white focus:ring-2 focus:ring-[#F28C28]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">กรอบงบประมาณที่ได้รับอนุมัติ (บาท)</label>
                <input
                  type="number"
                  value={allocatedBudget}
                  onChange={(e) => setAllocatedBudget(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white focus:ring-2 focus:ring-[#F28C28] font-bold text-[#D97706]"
                  required
                />
              </div>

              {/* Items List in Plan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700">รายการสินค้าเป้าหมายในแผน</label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-[#F28C28] hover:text-[#D97706] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการ</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded-xl bg-[#F5F8FC]">
                  {planLines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                      <select
                        value={line.itemId}
                        onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-xs"
                      >
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            [{it.itemCode}] {it.itemName} ({it.unit})
                          </option>
                        ))}
                      </select>

                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="จำนวน"
                          value={line.targetQuantity}
                          onChange={(e) =>
                            handleLineChange(idx, 'targetQuantity', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded text-xs text-right"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          placeholder="ราคา/หน่วย"
                          value={line.estimatedUnitPrice}
                          onChange={(e) =>
                            handleLineChange(idx, 'estimatedUnitPrice', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 border rounded text-xs text-right"
                        />
                      </div>

                      {planLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-rose-500 hover:text-rose-700 px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ / วัตถุประสงค์</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="รายละเอียดวัตถุประสงค์ของแผนจัดซื้อ..."
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-[#F5F8FC] font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white font-semibold rounded-xl shadow-sm"
                >
                  บันทึกแผนจัดซื้อ (Save Plan)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen PP Detail Modal */}
      {showDetailModal && selectedPlanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28] shadow-2xs shrink-0">
                  <PieChart className="w-6 h-6 text-[#F28C28]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Plan Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedPlanDetail.planNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedPlanDetail.planNumber);
                          addToast('info', `คัดลอกเลขที่แผน ${selectedPlanDetail.planNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่แผนจัดซื้อ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={selectedPlanDetail.status} />

                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      ปีงบประมาณ {selectedPlanDetail.fiscalYear}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      แผนการจัดซื้อจัดจ้างและกรอบงบประมาณพัสดุประจำปี
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Procurement Plan 360°)
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
                  title="พิมพ์เอกสารแผนจัดซื้อ"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                <Link
                  href={`/procurement/requisitions?planId=${selectedPlanDetail.id}`}
                  className="px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>เปิดใบขอซื้อ (PR)</span>
                </Link>

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
              {/* Financial Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    กรอบงบประมาณจัดสรร
                  </span>
                  <div className="text-xl font-bold text-[#14213D] mt-1 tabular-nums">
                    ฿{(selectedPlanDetail.allocatedBudget || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#F28C28] mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>งบประมาณต้นปี {selectedPlanDetail.fiscalYear}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                    ยอดผูกพันจัดซื้อ (PR + PO)
                  </span>
                  <div className="text-xl font-bold text-amber-600 mt-1 tabular-nums">
                    ฿{(selectedPlanDetail.committedBudget || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    ถูกตัดยอดไปในระบบจัดซื้อแล้ว
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    งบประมาณคงเหลือขอซื้อได้
                  </span>
                  <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                    ฿{(selectedPlanDetail.remainingBudget || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>สามารถเปิดใบขอซื้อ (PR) ได้</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                    สัดส่วนการใช้งบประมาณ
                  </span>
                  {(() => {
                    const pct =
                      selectedPlanDetail.allocatedBudget > 0
                        ? Math.round(
                            (selectedPlanDetail.committedBudget /
                              selectedPlanDetail.allocatedBudget) *
                              100
                          )
                        : 0;
                    return (
                      <>
                        <div className="text-xl font-bold text-purple-700 mt-1 tabular-nums">
                          {pct}%
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-[#F28C28]'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Plan Metadata Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2EAF4] pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#14213D]">{selectedPlanDetail.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPlanDetail.remarks || 'ไม่มีหมายเหตุเพิ่มเติม'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">หมวดหมู่จัดซื้อ:</span>
                    <span className="px-2.5 py-1 bg-slate-100 font-semibold text-slate-700 rounded-lg text-xs">
                      {selectedPlanDetail.categoryCode || 'ทุกหมวดหมู่'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">ผู้จัดทำแผน</span>
                    <span className="font-semibold text-slate-700">{selectedPlanDetail.createdBy || 'เจ้าหน้าที่จัดซื้อ'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">วันที่บันทึกระบบ</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(selectedPlanDetail.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">จำนวนรายการพัสดุ</span>
                    <span className="font-semibold text-[#14213D]">{selectedPlanDetail.lines?.length || 0} รายการ</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">สถานะแผนจัดซื้อ</span>
                    <span className="font-semibold text-emerald-600">อนุมัติกรอบวงเงินแล้ว</span>
                  </div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#F28C28]" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#14213D]">
                      รายการสินค้าและเป้าหมายตามแผนจัดซื้อ ({selectedPlanDetail.lines?.length || 0} รายการ)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    หน่วยเงิน: บาท (THB)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-3">รหัส / ชื่อพัสดุและเวชภัณฑ์</th>
                        <th className="py-3 px-3 text-right">จำนวนเป้าหมาย</th>
                        <th className="py-3 px-3 text-right">ราคาประเมิน/หน่วย</th>
                        <th className="py-3 px-3 text-right">งบประมาณรวม</th>
                        <th className="py-3 px-3 text-right text-amber-700">จัดซื้อแล้ว</th>
                        <th className="py-3 px-3 text-right text-emerald-700">คงเหลือตามแผน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPlanDetail.lines && selectedPlanDetail.lines.length > 0 ? (
                        selectedPlanDetail.lines.map((line: any, idx: number) => {
                          const remQty = Math.max(0, (line.targetQuantity || 0) - (line.usedQuantity || 0));
                          return (
                            <tr key={line.id || idx} className="hover:bg-[#F5F8FC] transition-colors">
                              <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-3">
                                <div className="font-semibold text-[#14213D]">{line.item?.itemName}</div>
                                <div className="text-[11px] font-mono text-[#F28C28]">{line.item?.itemCode}</div>
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-[#14213D] tabular-nums">
                                {line.targetQuantity?.toLocaleString()} {line.item?.unit}
                              </td>
                              <td className="py-3 px-3 text-right text-slate-600 tabular-nums">
                                ฿{line.estimatedUnitPrice?.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">
                                ฿{line.estimatedTotal?.toLocaleString()}
                              </td>
                              <td className="py-3 px-3 text-right font-semibold text-amber-600 tabular-nums">
                                {line.usedQuantity?.toLocaleString() || 0} {line.item?.unit}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-emerald-600 tabular-nums">
                                {remQty.toLocaleString()} {line.item?.unit}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            ไม่มีรายการสินค้าในแผนจัดซื้อนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Workflow Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F28C28]" />
                  <span>ขั้นตอนการควบคุมงบประมาณจัดซื้อ (Procurement Plan Workflow)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>1. เสนอแผนงบประมาณ</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 mt-1">จัดทำโดยฝ่ายเภสัชกรรม/พัสดุ</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>2. อนุมัติกรอบวงเงิน</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 mt-1">ผู้อำนวยการอนุมัติงบประมาณ</div>
                  </div>
                  <div className="p-3 bg-[#FFF7ED] rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs">
                      <FileCheck2 className="w-4 h-4" />
                      <span>3. เปิดใบขอซื้อ (PR/PO)</span>
                    </div>
                    <div className="text-[11px] text-[#F28C28] mt-1">ตัดยอดตามกรอบวงเงินคงเหลือ</div>
                  </div>
                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4]">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                      <PieChart className="w-4 h-4" />
                      <span>4. ปิดแผนสิ้นปีงบ</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">สรุปผลการจัดซื้อและเงินคงเหลือ</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-4 border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-4">
                <span>จำนวนรายการ: <strong>{selectedPlanDetail.lines?.length || 0}</strong> รายการ</span>
                <span>งบประมาณรวม: <strong>฿{(selectedPlanDetail.allocatedBudget || 0).toLocaleString()}</strong></span>
                <span>คงเหลือ: <strong className="text-emerald-700">฿{(selectedPlanDetail.remainingBudget || 0).toLocaleString()}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-[#E2EAF4] hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  ปิดหน้าต่าง (Close)
                </button>
                <Link
                  href={`/procurement/requisitions?planId=${selectedPlanDetail.id}`}
                  className="px-5 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>เปิดใบขอซื้อ (PR) อ้างอิงแผนนี้</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
