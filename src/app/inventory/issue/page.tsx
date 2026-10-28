'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowUpFromLine,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  PackageCheck,
  Package,
  ShieldAlert,
  Building,
  RefreshCw,
  Eye,
  Copy,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function StockIssuePage() {
  const { currentUser, addToast, refreshKey, triggerRefresh } = useApp();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any | null>(null);

  // Form states
  const [departments, setDepartments] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const [issueType, setIssueType] = useState('DIRECT');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [requesterName, setRequesterName] = useState(currentUser.name);
  const [remark, setRemark] = useState('');
  const [lines, setLines] = useState<any[]>([
    { itemId: '', requestedQty: 1, lotNumber: '', availableStock: 0, unit: 'Unit' },
  ]);

  const loadData = () => {
    setLoading(true);
    fetch('/api/issues')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setIssues(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    fetch('/api/departments')
      .then((r) => r.json())
      .then((depts) => {
        if (Array.isArray(depts)) {
          setDepartments(depts);
          if (depts.length > 0) setSelectedDeptId(depts[0].id);
        }
      });
    fetch('/api/warehouses')
      .then((r) => r.json())
      .then((whs) => {
        if (Array.isArray(whs)) {
          setWarehouses(whs);
          if (whs.length > 0) setSelectedWarehouseId(whs[0].id);
        }
      });
    fetch('/api/items')
      .then((r) => r.json())
      .then((its) => {
        if (Array.isArray(its)) setItems(its);
      });
  }, [refreshKey]);

  useEffect(() => {
    setRequesterName(currentUser.name);
  }, [currentUser]);

  // When an item is selected in create form, check available stock and suggest FEFO
  const handleItemChange = async (index: number, itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return;

    // Check available balance in selected warehouse
    const sb = it.stockBalances?.find((b: any) => b.warehouseId === selectedWarehouseId);
    const available = sb ? sb.available : 0;

    const updated = [...lines];
    updated[index].itemId = itemId;
    updated[index].unit = it.unit;
    updated[index].availableStock = available;

    // Try FEFO allocation suggestion
    if (available > 0) {
      try {
        const fefoRes = await fetch('/api/fefo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            warehouseId: selectedWarehouseId,
            requiredQty: updated[index].requestedQty || 1,
          }),
        });
        const fefo = await fefoRes.json();
        if (fefo.allocations && fefo.allocations.length > 0) {
          updated[index].lotNumber = fefo.allocations[0].lotNumber;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { itemId: '', requestedQty: 1, lotNumber: '', availableStock: 0, unit: 'Unit' }]);
  };

  const removeLine = (idx: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== idx));
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate available stock
    for (const l of lines) {
      if (!l.itemId) {
        addToast('error', 'กรุณาเลือกสินค้าทุกรายการ');
        return;
      }
      if (l.requestedQty <= 0) {
        addToast('error', 'จำนวนขอเบิกต้องมากกว่า 0');
        return;
      }
      if (l.requestedQty > l.availableStock) {
        addToast(
          'error',
          `สินค้าในสต็อกมีพร้อมจ่ายไม่เพียงพอ (ต้องการ ${l.requestedQty}, มีพร้อมจ่าย ${l.availableStock})`
        );
        return;
      }
    }

    try {
      const payload = {
        issueType,
        requesterName,
        departmentId: selectedDeptId,
        sourceWarehouseId: selectedWarehouseId,
        requestDate: new Date(),
        remark,
        userName: currentUser.name,
        lines: lines.map((l) => ({
          itemId: l.itemId,
          requestedQty: l.requestedQty,
          lotNumber: l.lotNumber || null,
          unit: l.unit,
        })),
      };

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create Issue');

      addToast('success', `สร้างใบขอเบิกเลขที่ ${result.issueNumber} เรียบร้อยแล้ว (ส่งรอการอนุมัติ)`);
      setShowCreateModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Department Approval Action
  const handleApprove = async (issueId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/issues/${issueId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userName: currentUser.name,
          comment: action === 'APPROVE' ? 'อนุมัติตามระเบียบการเบิกจ่าย' : 'ปฏิเสธคำขอเบิก',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');

      addToast('success', `${action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}ใบขอเบิกเรียบร้อย`);
      setShowDetailModal(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Warehouse Picking & Post Issue Action
  const handlePostIssue = async (issueId: string) => {
    if (!confirm('ยืนยันการจ่ายสินค้าจริงและตัดยอดคงคลังตามกฎ FEFO?')) return;

    try {
      const res = await fetch(`/api/issues/${issueId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser.name,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to post issue');

      addToast('success', 'บันทึกจ่ายสินค้าและตัดสต็อกเรียบร้อยแล้ว (Stock Movement บันทึกแล้ว)');
      setShowDetailModal(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const filteredIssues = issues.filter((iss) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      iss.issueNumber?.toLowerCase().includes(q) ||
      iss.department?.name?.toLowerCase().includes(q) ||
      iss.requesterName?.toLowerCase().includes(q) ||
      iss.sourceWarehouse?.name?.toLowerCase().includes(q)
    );
  });

  const totalIssues = filteredIssues.length;
  const totalPages = Math.max(1, Math.ceil(totalIssues / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <ArrowUpFromLine className="w-5 h-5 text-[#2563EB]" />
            ระบบเบิกจ่ายสินค้า (Stock Issue Management)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            รองรับทั้งเบิกใช้จริง (Direct Issue) และเบิกเติมคลังย่อย (Replenishment) • ตรวจสอบ Available Stock และจัดสรร Lot ตาม FEFO
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ สร้างใบขอเบิกใหม่</span>
        </button>
      </div>

      {/* Main Table Card with Integrated Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E2EAF4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <h2 className="text-base font-bold text-[#14213D]">
            รายการใบขอเบิกพัสดุ
          </h2>

          <div className="relative w-full sm:w-72 lg:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบเบิก, แผนก, ผู้ขอเบิก..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] placeholder-[#94A3B8] transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2EAF4] uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ใบเบิก (ISSUE NO.)</th>
                <th className="py-3 px-3">ประเภทการเบิก</th>
                <th className="py-3 px-3">แผนกผู้ขอเบิก</th>
                <th className="py-3 px-3">ผู้ขอเบิก</th>
                <th className="py-3 px-3">คลังจ่ายสินค้า</th>
                <th className="py-3 px-3 text-right">จำนวนรายการ</th>
                <th className="py-3 px-3">วันที่ขอ</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
                    กำลังดึงข้อมูลใบเบิก...
                  </td>
                </tr>
              ) : paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    ยังไม่มีรายการใบเบิกพัสดุ
                  </td>
                </tr>
              ) : (
                paginatedIssues.map((iss) => (
                  <tr
                    key={iss.id}
                    className="hover:bg-[#F5F8FC] transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setShowDetailModal(iss)}
                        className="hover:underline"
                      >
                        {iss.issueNumber}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-[#334155] border border-[#E2EAF4]">
                        {iss.issueType === 'DIRECT' ? 'เบิกใช้งานจริง' : 'เบิกเติมคลังย่อย'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-[#14213D] whitespace-nowrap">
                      {iss.department.name}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                      {iss.requesterName}
                    </td>
                    <td className="py-3 px-3 text-[#334155] whitespace-nowrap">
                      {iss.sourceWarehouse.name}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {iss.lines.length} รายการ
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[#64748B]">
                      {new Date(iss.requestDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={iss.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setShowDetailModal(iss)}
                        className="px-3 py-1 bg-blue-50/80 hover:bg-blue-100 text-[#2563EB] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-blue-200 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูข้อมูล</span>
                      </button>
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
              {totalIssues === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, totalIssues)}
            </span>{' '}
            จาก{' '}
            <span className="font-semibold text-[#14213D]">{totalIssues.toLocaleString()}</span>{' '}
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
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'border border-[#E2EAF4] hover:bg-[#F5F8FC] text-[#334155]'
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

      {/* Modal 1: Create Issue Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-4xl w-full p-6 animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">
                  สร้างใบขอเบิกพัสดุใหม่ (Create Stock Issue Request)
                </h3>
                <p className="text-xs text-[#64748B]">
                  ระบบตรวจสอบยอดคงเหลือพร้อมจ่าย (Available Stock) และจัดสรร Lot ตามเกณฑ์ FEFO
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#64748B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Issue Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    ประเภทการเบิก *
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
                  >
                    <option value="DIRECT">Direct Issue (เบิกใช้งานจริง)</option>
                    <option value="REPLENISHMENT">Replenishment (เบิกเติมคลังย่อย)</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    แผนกที่ขอเบิก *
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source Warehouse */}
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    คลังสินค้าต้นทาง *
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requester Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    ชื่อผู้ขอเบิก *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] font-medium"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-[#E2EAF4] rounded-xl overflow-hidden mt-3">
                <div className="px-4 py-2.5 bg-[#F5F8FC] border-b border-[#E2EAF4] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#334155]">รายการสินค้าที่ต้องการเบิก</span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มรายการ
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#F5F8FC] p-2.5 rounded-lg border border-[#E2EAF4]/70">
                      <div className="flex-1">
                        <select
                          required
                          value={line.itemId}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
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
                          {line.availableStock} {line.unit}
                        </div>
                      </div>

                      <div className="w-24">
                        <label className="text-[10px] text-[#94A3B8] block text-right">จำนวนเบิก:</label>
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

                      <div className="w-28">
                        <label className="text-[10px] text-[#94A3B8] block">Lot (FEFO):</label>
                        <input
                          type="text"
                          readOnly
                          value={line.lotNumber || 'Auto FEFO'}
                          className="w-full text-xs px-2 py-1 bg-slate-100 border border-slate-300 rounded text-[#64748B] font-mono text-[11px]"
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
                  เหตุผล / หมายเหตุการเบิก
                </label>
                <textarea
                  rows={2}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="ระบุวัตถุประสงค์ในการเบิกใช้งาน เช่น สำหรับคลินิกผู้ป่วยนอกประจำสัปดาห์..."
                  className="w-full text-xs p-2.5 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
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
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  ส่งขออนุมัติใบเบิก (Submit Issue)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Full-Screen Stock Issue Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-2xs shrink-0">
                  <ArrowUpFromLine className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Issue Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{showDetailModal.issueNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(showDetailModal.issueNumber);
                          addToast('info', `คัดลอกเลขที่ ${showDetailModal.issueNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่ใบเบิก"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={showDetailModal.status} />

                    <span className="bg-slate-100 text-[#475569] border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {showDetailModal.issueType === 'DIRECT' ? 'เบิกใช้งานจริง' : 'เบิกเติมคลังย่อย'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      รายละเอียดคำขอเบิกพัสดุและเวชภัณฑ์ทางการแพทย์
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Stock Issue Full Specification)
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
                  title="พิมพ์เอกสารใบเบิก"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {showDetailModal.status === 'APPROVED' && (
                  <button
                    onClick={() => handlePostIssue(showDetailModal.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>จ่ายพัสดุ & ตัดสต็อก</span>
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
                    <span>แผนกผู้ขอเบิก & คลังจ่าย</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showDetailModal.department?.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    คลังจ่าย: {showDetailModal.sourceWarehouse?.name}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>วันที่ขอเบิก & ประเภท</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {new Date(showDetailModal.requestDate).toLocaleDateString('th-TH')}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                    {showDetailModal.issueType === 'DIRECT' ? 'เบิกใช้งานจริง (Direct Issue)' : 'เบิกเติมคลังย่อย (Replenish)'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>ผู้ยื่นขอ & ผู้อนุมัติ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showDetailModal.requesterName}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ผู้อนุมัติ: {showDetailModal.approvedBy || 'รอการอนุมัติ'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs bg-gradient-to-br from-white to-blue-50/40">
                  <div className="text-[11px] font-medium text-blue-700 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>จำนวนรายการพัสดุ</span>
                  </div>
                  <div className="font-bold text-blue-900 text-xl mt-1 tabular-nums">
                    {showDetailModal.lines?.length || 0} <span className="text-xs font-normal text-blue-700">รายการ</span>
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">จัดสรร Lot ตามหลักเกณฑ์ FEFO</div>
                </div>
              </div>

              {/* Remarks Callout */}
              {showDetailModal.remark && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-blue-900">วัตถุประสงค์ / หมายเหตุการเบิก: </span>
                    <span className="text-[#334155]">{showDetailModal.remark}</span>
                  </div>
                </div>
              )}

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#2563EB]" />
                    <h4 className="font-bold text-xs text-[#14213D]">
                      รายการพัสดุที่ขอเบิกและ Lot ที่จัดสรร ({showDetailModal.lines?.length || 0} รายการ)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    ระบบจับคู่ Lot อัตโนมัติตามวันหมดอายุเร็วที่สุด (FEFO)
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
                        <th className="py-2.5 px-3 text-right">จำนวนขอเบิก</th>
                        <th className="py-2.5 px-3 text-right text-blue-700">จำนวนอนุมัติ</th>
                        <th className="py-2.5 px-3 text-right text-emerald-700">จ่ายจริง</th>
                        <th className="py-2.5 px-3 font-mono">Lot Number (FEFO)</th>
                        <th className="py-2.5 px-3 text-center">สถานะตัดสต็อก</th>
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
                                {l.unit || item.unit || 'ชิ้น'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-[#14213D] tabular-nums">
                                {l.requestedQty?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-blue-700 tabular-nums">
                                {(l.approvedQty || l.requestedQty)?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                                {l.issuedQty > 0 ? l.issuedQty.toLocaleString() : '-'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[#334155] font-semibold">
                                {l.lotNumber || 'Auto FEFO'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    l.issuedQty > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-[#64748B]'
                                  }`}
                                >
                                  {l.issuedQty > 0 ? 'ตัดจ่ายแล้ว' : 'รอดำเนินการ'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-[#94A3B8]">
                            ไม่พบรายการสินค้าในใบเบิกนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visual 4-Step Issue Workflow Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                <h4 className="text-xs font-bold text-[#14213D] mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                  <span>ขั้นตอนการเบิกจ่ายและตัดสต็อก (Stock Issue Workflow Timeline)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. ยื่นคำขอเบิก</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ตรวจสอบ Available Stock ผ่าน
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
                      <span>2. อนุมัติการเบิก</span>
                    </div>
                    <div className="text-[11px] mt-1">
                      {showDetailModal.approvedBy
                        ? `อนุมัติโดย: ${showDetailModal.approvedBy}`
                        : 'รอหัวหน้าแผนก/เภสัชกรอนุมัติ'}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status === 'ISSUED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : showDetailModal.status === 'APPROVED'
                        ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <PackageCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>3. จัดเตรียมตาม FEFO</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      หยิบพัสดุจาก Lot ที่หมดอายุเร็วสุด
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showDetailModal.status === 'ISSUED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>4. จ่ายสำเร็จ & ตัดสต็อก</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      ตัดยอด On Hand และบันทึก Card
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
                  <strong className="text-blue-900 font-bold">
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

                {/* Department Approval Action */}
                {showDetailModal.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleApprove(showDetailModal.id, 'REJECT')}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      ไม่อนุมัติ
                    </button>
                    <button
                      onClick={() => handleApprove(showDetailModal.id, 'APPROVE')}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>อนุมัติใบเบิก</span>
                    </button>
                  </>
                )}

                {/* Warehouse Picking & Post Issue Action */}
                {showDetailModal.status === 'APPROVED' && (
                  <button
                    onClick={() => handlePostIssue(showDetailModal.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>ยืนยันจ่ายพัสดุ & ตัดสต็อก (Post Issue)</span>
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
