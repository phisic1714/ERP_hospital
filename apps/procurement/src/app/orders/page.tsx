'use client';

import React, { useState, useEffect } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ArrowDownToLine,
  Building,
  RefreshCw,
  FileText,
  Eye,
  Copy,
  Printer,
  X,
  Calendar,
  DollarSign,
  CheckCircle2,
  Package,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Send,
  MapPin,
  CreditCard,
  FileSearch,
  Lock,
  Ban,
  Check,
  Paperclip,
  Percent,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';
import { useBudget } from '@erp/app-context';

export default function PurchaseOrdersPage() {
  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();
  const { commitBudget, releaseBudget } = useBudget();
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [approvedPRs, setApprovedPRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPODetail, setSelectedPODetail] = useState<any | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  type StatusFilter =
    | 'ALL'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'ORDERED'
    | 'PARTIALLY_RECEIVED'
    | 'FULLY_RECEIVED'
    | 'CLOSED'
    | 'REJECTED';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Create PO Form State
  const [selectedPRId, setSelectedPRId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  const [deliveryLocation, setConvertDeliveryLocation] = useState(
    'คลังเวชภัณฑ์กลาง อาคารเภสัชกรรม ชั้น 1 โรงพยาบาล'
  );
  const [paymentTerms, setPaymentTerms] = useState('Credit 30 วัน');
  const [creditDays, setCreditDays] = useState(30);
  const [budgetReference, setBudgetReference] = useState('');
  const [allocationId, setAllocationId] = useState('ALC-2569-001');
  const [budgetCode, setBudgetCode] = useState('BG-69-PHARM-01');
  const [departmentName, setDepartmentName] = useState('กลุ่มงานเภสัชกรรม (Pharmacy)');
  const [rfqNumber, setRfqNumber] = useState('');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [supplierQuoteRef, setSupplierQuoteRef] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [poLines, setPoLines] = useState<any[]>([
    {
      itemId: '',
      specification: '',
      orderedQty: 100,
      unitPrice: 50,
      discount: 0,
      remark: '',
    },
  ]);

  const loadPOs = () => {
    setLoading(true);
    fetch('/api/pos')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPOs();
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSuppliers(data);
          if (data.length > 0 && !supplierId) setSupplierId(data[0].id);
        }
      });
    fetch('/api/items')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
          if (data.length > 0 && (!poLines[0] || !poLines[0].itemId)) {
            setPoLines([
              {
                itemId: data[0].id,
                specification: data[0].description || '',
                orderedQty: 100,
                unitPrice: data[0].standardCost || 50,
                discount: 0,
                remark: '',
              },
            ]);
          }
        }
      });
    fetch('/api/procurement/requisitions')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const approved = data.filter((pr) => pr.status === 'APPROVED');
          setApprovedPRs(approved);
        }
      });
  }, [refreshKey]);

  // Handle PR auto-populate into PO form
  const handleSelectPR = (prId: string) => {
    setSelectedPRId(prId);
    if (!prId) return;

    const pr = approvedPRs.find((p) => p.id === prId);
    if (pr) {
      const aId = pr.allocationId || pr.plan?.allocationId || 'ALC-2569-001';
      const bCode = pr.budgetCode || pr.plan?.budgetCode || 'BG-69-PHARM-01';
      const dName = pr.departmentName || pr.department?.name || 'กลุ่มงานเภสัชกรรม (Pharmacy)';
      setAllocationId(aId);
      setBudgetCode(bCode);
      setDepartmentName(dName);
      setBudgetReference(
        `[${aId} · ${bCode}] ${pr.planNumber || pr.plan?.planNumber || (pr.isUnplanned ? 'จัดซื้อเร่งด่วน' : 'แผนจัดซื้อ')} (${dName})`
      );
      if (pr.lines && pr.lines.length > 0) {
        const mappedLines = pr.lines.map((l: any) => ({
          itemId: l.itemId,
          prLineId: l.id,
          specification: l.specification || l.item?.description || '',
          orderedQty: Math.max(1, (l.approvedQty || l.requestedQty) - (l.orderedQty || 0)),
          unitPrice: l.estimatedUnitPrice || 50,
          discount: 0,
          remark: l.remark || '',
        }));
        setPoLines(mappedLines);
      }
      setRemarks(`ออกใบสั่งซื้ออ้างอิงใบขอซื้อเลขที่ ${pr.prNumber}`);
    }
  };

  const handleAddLine = () => {
    if (items.length > 0) {
      setPoLines([
        ...poLines,
        {
          itemId: items[0].id,
          specification: items[0].description || '',
          orderedQty: 100,
          unitPrice: items[0].standardCost || 50,
          discount: 0,
          remark: '',
        },
      ]);
    }
  };

  const handleRemoveLine = (index: number) => {
    if (poLines.length > 1) {
      setPoLines(poLines.filter((_, idx) => idx !== index));
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...poLines];
    updated[index][field] = value;
    if (field === 'itemId') {
      const it = items.find((i) => i.id === value);
      if (it) {
        updated[index].unitPrice = it.standardCost || 0;
        updated[index].specification = it.description || '';
      }
    }
    setPoLines(updated);
  };

  // Financial calculations
  const calculateFinancials = (linesToCalc: any[]) => {
    let subtotal = 0;
    let totalDiscount = 0;
    linesToCalc.forEach((l) => {
      const qty = Number(l.orderedQty) || 0;
      const price = Number(l.unitPrice) || 0;
      const disc = Number(l.discount) || 0;
      subtotal += qty * price;
      totalDiscount += disc;
    });
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const vatAmount = Math.round(taxableAmount * 0.07 * 100) / 100;
    const netAmount = taxableAmount + vatAmount;
    return { subtotal, totalDiscount, taxableAmount, vatAmount, netAmount };
  };

  const formFinancials = calculateFinancials(poLines);

  const handleCreatePO = async (autoApprove: boolean = false, e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!supplierId) {
      addToast('error', 'กรุณาเลือกผู้จัดจำหน่าย (Supplier)');
      return;
    }

    try {
      const pr = approvedPRs.find((p) => p.id === selectedPRId);
      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          prId: selectedPRId || null,
          prNumber: pr ? pr.prNumber : null,
          rfqNumber: rfqNumber || null,
          quotationNumber: quotationNumber || null,
          supplierQuoteRef: supplierQuoteRef || null,
          orderDate,
          expectedDate: expectedDate || null,
          deliveryLocation,
          paymentTerms,
          creditDays: Number(creditDays) || 30,
          budgetReference,
          allocationId: allocationId || pr?.allocationId || 'ALC-2569-001',
          budgetCode: budgetCode || pr?.budgetCode || 'BG-69-PHARM-01',
          departmentName: departmentName || pr?.departmentName || 'กลุ่มงานเภสัชกรรม (Pharmacy)',
          attachmentName: attachmentName || null,
          attachmentUrl: attachmentName ? `/attachments/${attachmentName}` : null,
          remarks,
          createdBy: currentUser.name,
          lines: poLines,
          status: autoApprove ? 'APPROVED' : 'PENDING_APPROVAL',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PO');

      if (autoApprove) {
        commitBudget(
          budgetCode || pr?.budgetCode || 'BG-69-PHARM-01',
          data.totalAmount || data.netAmount || 0,
          data.poNumber,
          `บันทึกภาระผูกพัน PO ${data.poNumber} (อนุมัติทันที)`
        );
        addToast(
          'success',
          `สร้างและอนุมัติใบสั่งซื้อ ${data.poNumber} สำเร็จ (บันทึกภาระผูกพัน Commitment เรียบร้อย)`
        );
      } else {
        addToast('success', `สร้างใบสั่งซื้อ ${data.poNumber} สำเร็จ (สถานะ: รออนุมัติ)`);
      }
      setShowCreateModal(false);
      setRemarks('');
      setSelectedPRId('');
      triggerRefresh();
      loadPOs();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // PO Approvals & Workflow Actions
  const handlePOAction = async (
    poId: string,
    action: 'APPROVE' | 'SEND_TO_SUPPLIER' | 'REJECT' | 'CLOSE',
    poNumber: string
  ) => {
    try {
      const res = await fetch(`/api/pos/${poId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed action');

      // Update Budget Management commitment & release (Rules 6 & 7)
      const targetPO = pos.find((p) => p.id === poId);
      const bCode = targetPO?.budgetCode || 'BG-69-PHARM-01';
      const poAmt = targetPO?.totalAmount || targetPO?.netAmount || 0;

      if (action === 'APPROVE') {
        commitBudget(
          bCode,
          poAmt,
          poNumber,
          `บันทึกภาระผูกพัน (Commitment) จากใบสั่งซื้อที่อนุมัติ ${poNumber}`
        );
      } else if (action === 'REJECT') {
        releaseBudget(
          bCode,
          poAmt,
          poNumber,
          `คืนวงเงินกันงบประมาณเนื่องจากปฏิเสธใบสั่งซื้อ ${poNumber}`
        );
      }

      const actionText =
        action === 'APPROVE'
          ? `อนุมัติใบสั่งซื้อ ${poNumber} เรียบร้อยแล้ว (บันทึก Commitment ในระบบงบประมาณ ฿${poAmt.toLocaleString()})`
          : action === 'SEND_TO_SUPPLIER'
          ? `ส่งใบสั่งซื้อ ${poNumber} ให้ผู้ขายเรียบร้อยแล้ว (สถานะ: สั่งซื้อแล้ว)`
          : action === 'CLOSE'
          ? `ปิดใบสั่งซื้อ ${poNumber} เรียบร้อยแล้ว (Completed)`
          : `ปฏิเสธใบสั่งซื้อ ${poNumber} เรียบร้อยแล้ว (คืนวงเงินงบประมาณ)`;

      addToast('success', actionText);

      if (selectedPODetail && selectedPODetail.id === poId) {
        setShowDetailModal(false);
        setSelectedPODetail(null);
      }
      triggerRefresh();
      loadPOs();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Filter Counts
  const pendingCount = pos.filter(
    (p) => p.status === 'PENDING_APPROVAL' || p.status === 'DRAFT' || p.status === 'PENDING'
  ).length;
  const approvedCount = pos.filter((p) => p.status === 'APPROVED').length;
  const orderedCount = pos.filter((p) => p.status === 'ORDERED').length;
  const partialCount = pos.filter((p) => p.status === 'PARTIALLY_RECEIVED').length;
  const fullyReceivedCount = pos.filter(
    (p) => p.status === 'FULLY_RECEIVED' || p.status === 'COMPLETED'
  ).length;
  const closedCount = pos.filter((p) => p.status === 'CLOSED').length;
  const rejectedCount = pos.filter(
    (p) => p.status === 'REJECTED' || p.status === 'CANCELLED'
  ).length;

  const filteredPOs = pos.filter((po) => {
    if (statusFilter === 'PENDING_APPROVAL') {
      if (po.status !== 'PENDING_APPROVAL' && po.status !== 'DRAFT' && po.status !== 'PENDING')
        return false;
    } else if (statusFilter === 'APPROVED') {
      if (po.status !== 'APPROVED') return false;
    } else if (statusFilter === 'ORDERED') {
      if (po.status !== 'ORDERED') return false;
    } else if (statusFilter === 'PARTIALLY_RECEIVED') {
      if (po.status !== 'PARTIALLY_RECEIVED') return false;
    } else if (statusFilter === 'FULLY_RECEIVED') {
      if (po.status !== 'FULLY_RECEIVED' && po.status !== 'COMPLETED') return false;
    } else if (statusFilter === 'CLOSED') {
      if (po.status !== 'CLOSED') return false;
    } else if (statusFilter === 'REJECTED') {
      if (po.status !== 'REJECTED' && po.status !== 'CANCELLED') return false;
    }

    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const matchPoNumber = po.poNumber?.toLowerCase().includes(term);
    const matchPrNumber = po.prNumber?.toLowerCase().includes(term);
    const matchSupplier =
      po.supplier?.name?.toLowerCase().includes(term) ||
      po.supplier?.code?.toLowerCase().includes(term);
    const matchLines = po.lines?.some(
      (l: any) =>
        l.item?.itemName?.toLowerCase().includes(term) ||
        l.item?.itemCode?.toLowerCase().includes(term)
    );

    return matchPoNumber || matchPrNumber || matchSupplier || matchLines;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F28C28] mb-1">
            <Link href="/procurement" className="hover:underline">
              ระบบจัดซื้อจัดจ้าง
            </Link>
            <span>/</span>
            <span className="text-slate-500">ใบสั่งซื้อ (PO)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#14213D] flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-[#F28C28]" />
            <span>ใบสั่งซื้อผู้จัดจำหน่าย (Purchase Orders - PO)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ใบสั่งซื้อส่งผู้ขาย (Supplier) อ้างอิง PR/RFQ คำนวณ VAT 7% พร้อมติดตามการส่งมอบและการตรวจรับสินค้า (GR)
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
            className="flex items-center gap-2 px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างใบสั่งซื้อ (New PO)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ PO, อ้างอิง PR, หรือผู้จัดจำหน่าย (Supplier)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C28] text-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs overflow-x-auto">
            {[
              { id: 'ALL', label: 'ทั้งหมด', count: pos.length },
              { id: 'PENDING_APPROVAL', label: 'รออนุมัติ', count: pendingCount },
              { id: 'APPROVED', label: 'อนุมัติแล้ว', count: approvedCount },
              { id: 'ORDERED', label: 'สั่งซื้อแล้ว', count: orderedCount },
              { id: 'PARTIALLY_RECEIVED', label: 'รับบางส่วน', count: partialCount },
              { id: 'FULLY_RECEIVED', label: 'รับครบแล้ว', count: fullyReceivedCount },
              { id: 'CLOSED', label: 'ปิดเอกสาร', count: closedCount },
              { id: 'REJECTED', label: 'ไม่อนุมัติ', count: rejectedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as StatusFilter)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-[#F28C28] text-white font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ใบสั่งซื้อ</th>
                <th className="py-3 px-3">อ้างอิง PR</th>
                <th className="py-3 px-3">ผู้จัดจำหน่าย (Supplier)</th>
                <th className="py-3 px-3">วันที่สั่งซื้อ</th>
                <th className="py-3 px-3">กำหนดส่งมอบ</th>
                <th className="py-3 px-3 text-right">จำนวนรายการ</th>
                <th className="py-3 px-3 text-right">ยอดสุทธิ (รวม VAT)</th>
                <th className="py-3 px-3 text-center">สถานะเอกสาร</th>
                <th className="py-3 px-3 text-center">สถานะส่งมอบ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    กำลังโหลดข้อมูลใบสั่งซื้อ...
                  </td>
                </tr>
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    {search || statusFilter !== 'ALL'
                      ? 'ไม่พบใบสั่งซื้อที่ตรงกับเงื่อนไขการค้นหา'
                      : 'ยังไม่มีรายการใบสั่งซื้อ'}
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const netVal = po.netAmount || po.totalAmount || 0;
                  return (
                    <tr
                      key={po.id}
                      className="hover:bg-[#FFF7ED]/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedPODetail(po);
                        setShowDetailModal(true);
                      }}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#D97706]">
                        <span className="hover:underline text-[#D97706] bg-[#FFF7ED] border border-orange-200/60 group-hover:bg-orange-100 px-2 py-0.5 rounded-lg transition-colors">
                          {po.poNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {po.prNumber ? (
                          <div>
                            <span className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded-lg font-bold">
                              {po.prNumber}
                            </span>
                            <div className="text-[10px] text-emerald-800 font-semibold mt-1">
                              {po.allocationId || 'ALC-2569-001'} · {po.budgetCode || 'BG-69-PHARM-01'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-400">-</span>
                            {po.allocationId && (
                              <div className="text-[10px] text-emerald-800 font-semibold mt-0.5">
                                {po.allocationId}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#14213D]">{po.supplier?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {po.supplier?.code} • {po.supplier?.paymentTerm}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {new Date(po.orderDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-medium tabular-nums">
                        {po.lines?.length || 0} รายการ
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">
                        ฿{netVal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {po.status === 'COMPLETED' || po.status === 'FULLY_RECEIVED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            รับของครบแล้ว
                          </span>
                        ) : po.status === 'PARTIALLY_RECEIVED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            รับของบางส่วน
                          </span>
                        ) : po.status === 'ORDERED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            รอส่งมอบ
                          </span>
                        ) : po.status === 'APPROVED' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            พร้อมส่งผู้ขาย
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPODetail(po);
                              setShowDetailModal(true);
                            }}
                            className="px-2.5 py-1 text-slate-700 hover:text-[#14213D] hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors border border-slate-200 shadow-2xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>ดูข้อมูล</span>
                          </button>

                          {(po.status === 'PENDING_APPROVAL' || po.status === 'DRAFT') && (
                            <button
                              type="button"
                              onClick={() => handlePOAction(po.id, 'APPROVE', po.poNumber)}
                              className="px-3 py-1 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>อนุมัติ</span>
                            </button>
                          )}

                          {po.status === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => handlePOAction(po.id, 'SEND_TO_SUPPLIER', po.poNumber)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>ส่งผู้ขาย</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create PO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-4xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#14213D] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#F28C28]" />
                  <span>สร้างใบสั่งซื้ออย่างเป็นทางการ (Official Purchase Order - PO)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  เอกสารส่งถึงผู้จำหน่าย (Supplier) รองรับการดึงข้อมูลจากใบขอซื้อ (PR) ที่อนุมัติแล้ว พร้อมคำนวณ VAT 7%
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleCreatePO(false, e)} className="space-y-4 text-xs">
              {/* Optional: Auto-fill from Approved PR */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                  <FileText className="w-4 h-4 text-purple-700" />
                  <span>ดึงข้อมูลจากใบขอซื้อที่ผ่านอนุมัติ (Approved PR)</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={selectedPRId}
                    onChange={(e) => handleSelectPR(e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-lg bg-white text-xs cursor-pointer focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- สร้าง PO อิสระ / ไม่ระบุ PR ต้นทาง --</option>
                    {approvedPRs.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        [{pr.prNumber}] แผนก: {pr.department?.name || 'ไม่ระบุ'} - ฿{pr.totalAmount.toLocaleString()} ({pr.lines?.length} รายการ)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Header Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F5F8FC] p-3.5 rounded-xl border border-[#E2EAF4]">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ผู้จัดจำหน่าย (Supplier) *
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#F28C28] cursor-pointer font-medium"
                    required
                  >
                    <option value="">-- เลือกผู้จำหน่าย --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name} - เครดิต: {s.paymentTerm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    วันที่ออกใบสั่งซื้อ (PO Date)
                  </label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    กำหนดส่งมอบ (Delivery Date) *
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    สถานที่ส่งสินค้า (Delivery Location) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setConvertDeliveryLocation(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg bg-white text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เงื่อนไขชำระเงิน (Payment Terms)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เครดิตเทอม (วัน)</label>
                  <input
                    type="number"
                    value={creditDays}
                    onChange={(e) => setCreditDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    อ้างอิงงบประมาณ (Budget Ref)
                  </label>
                  <input
                    type="text"
                    value={budgetReference}
                    onChange={(e) => setBudgetReference(e.target.value)}
                    placeholder="เช่น งบดำเนินงาน รพ. ปี 68 (PP-2568-001)"
                    className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    อ้างอิงใบเสนอราคา (Quotation / RFQ)
                  </label>
                  <input
                    type="text"
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
                    placeholder="เช่น QT-2026-001 / QT-MED-88"
                    className="w-full px-3 py-2 border rounded-lg bg-white text-xs"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#F28C28]" />
                    <span>รายการสินค้าสั่งซื้อ ({poLines.length} รายการ)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-[#F28C28] hover:text-[#D97706] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการ</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto border p-2 rounded-xl bg-[#F5F8FC]">
                  {poLines.map((line, idx) => {
                    const lineSubtotal = (Number(line.orderedQty) || 0) * (Number(line.unitPrice) || 0);
                    const lineDisc = Number(line.discount) || 0;
                    const lineBase = Math.max(0, lineSubtotal - lineDisc);
                    const lineVat = Math.round(lineBase * 0.07 * 100) / 100;
                    const lineNet = lineBase + lineVat;

                    return (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
                          <select
                            value={line.itemId}
                            onChange={(e) => handleLineChange(idx, 'itemId', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs bg-slate-50 font-medium"
                          >
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                [{it.itemCode}] {it.itemName} ({it.unit})
                              </option>
                            ))}
                          </select>

                          <div className="w-20">
                            <input
                              type="number"
                              placeholder="จำนวน"
                              value={line.orderedQty}
                              onChange={(e) =>
                                handleLineChange(idx, 'orderedQty', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 border rounded-lg text-xs text-right font-medium"
                              required
                            />
                          </div>

                          <div className="w-24">
                            <input
                              type="number"
                              placeholder="ราคา/หน่วย"
                              value={line.unitPrice}
                              onChange={(e) =>
                                handleLineChange(idx, 'unitPrice', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 border rounded-lg text-xs text-right font-medium"
                              required
                            />
                          </div>

                          <div className="w-20">
                            <input
                              type="number"
                              placeholder="ส่วนลด"
                              value={line.discount}
                              onChange={(e) =>
                                handleLineChange(idx, 'discount', Number(e.target.value))
                              }
                              className="w-full px-2 py-1.5 border rounded-lg text-xs text-right text-rose-600"
                            />
                          </div>

                          <div className="w-28 text-right font-bold text-[#14213D] tabular-nums">
                            ฿{lineNet.toLocaleString()}
                          </div>

                          {poLines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-rose-500 hover:text-rose-700 px-1 font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pl-7">
                          <input
                            type="text"
                            placeholder="รายละเอียดคุณสมบัติ (Specification)..."
                            value={line.specification}
                            onChange={(e) => handleLineChange(idx, 'specification', e.target.value)}
                            className="px-2.5 py-1 border rounded text-[11px] bg-slate-50/50"
                          />
                          <input
                            type="text"
                            placeholder="หมายเหตุรายการ..."
                            value={line.remark}
                            onChange={(e) => handleLineChange(idx, 'remark', e.target.value)}
                            className="px-2.5 py-1 border rounded text-[11px] bg-slate-50/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary Box */}
                <div className="bg-[#FFF7ED]/50 border border-orange-200/80 p-3 rounded-xl mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">ยอดรวมก่อนภาษี:</span>
                    <div className="font-bold text-[#14213D]">
                      ฿{formFinancials.subtotal.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ส่วนลดรวม:</span>
                    <div className="font-bold text-rose-600">
                      -฿{formFinancials.totalDiscount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                    <div className="font-bold text-blue-700">
                      ฿{formFinancials.vatAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ยอดสุทธิรวมทั้งสิ้น:</span>
                    <div className="font-bold text-[#D97706] text-sm">
                      ฿{formFinancials.netAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หมายเหตุและเงื่อนไขเพิ่มเติมในใบสั่งซื้อ
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="เงื่อนไขการส่งมอบ เช่น ตรวจรับ ณ จุดส่งของ, แนบเอกสาร COA ของยา..."
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
                  type="button"
                  onClick={(e) => handleCreatePO(false, e)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs shadow-sm"
                >
                  บันทึกขออนุมัติ (Save & Submit)
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreatePO(true, e)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>อนุมัติทันที & ส่งต่อคลัง (GR)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen PO Detail Modal */}
      {showDetailModal && selectedPODetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28] shadow-2xs shrink-0">
                  <ShoppingCart className="w-6 h-6 text-[#F28C28]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedPODetail.poNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedPODetail.poNumber);
                          addToast('info', `คัดลอกเลขที่ ${selectedPODetail.poNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={selectedPODetail.status} />

                    {selectedPODetail.prNumber && (
                      <span className="bg-slate-100 text-[#475569] border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium font-mono">
                        PR: {selectedPODetail.prNumber}
                      </span>
                    )}

                    {selectedPODetail.quotationNumber && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-medium font-mono">
                        QT: {selectedPODetail.quotationNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      รายละเอียดใบสั่งซื้อผู้จัดจำหน่าย (Purchase Order Full Specification)
                    </h2>
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#334155] rounded-xl text-xs font-semibold border border-[#E2EAF4] shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {(selectedPODetail.status === 'PENDING_APPROVAL' ||
                  selectedPODetail.status === 'DRAFT') && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handlePOAction(selectedPODetail.id, 'APPROVE', selectedPODetail.poNumber)
                      }
                      className="px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>อนุมัติใบสั่งซื้อ (Approve PO)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePOAction(selectedPODetail.id, 'REJECT', selectedPODetail.poNumber)
                      }
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>ไม่อนุมัติ</span>
                    </button>
                  </>
                )}

                {selectedPODetail.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePOAction(selectedPODetail.id, 'SEND_TO_SUPPLIER', selectedPODetail.poNumber)
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>ส่งใบสั่งซื้อให้ผู้ขาย (Send to Supplier)</span>
                  </button>
                )}

                {selectedPODetail.status === 'FULLY_RECEIVED' && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePOAction(selectedPODetail.id, 'CLOSE', selectedPODetail.poNumber)
                    }
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>ปิดใบสั่งซื้อสมบูรณ์ (Close PO)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F8FC]">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>ผู้จัดจำหน่าย (Supplier)</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1 truncate">
                    {selectedPODetail.supplier?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    รหัส: {selectedPODetail.supplier?.code} • เครดิต: {selectedPODetail.creditDays || 30} วัน
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>วันที่สั่งซื้อและส่งมอบ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    สั่ง: {new Date(selectedPODetail.orderDate).toLocaleDateString('th-TH')}
                  </div>
                  <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                    กำหนดส่ง: {selectedPODetail.expectedDate ? new Date(selectedPODetail.expectedDate).toLocaleDateString('th-TH') : 'ตามระเบียบพัสดุ'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>สถานที่ส่งและผู้สั่งซื้อ</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1 truncate">
                    {selectedPODetail.deliveryLocation || 'คลังเวชภัณฑ์กลาง'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ผู้จัดทำ: {selectedPODetail.createdBy || 'เจ้าหน้าที่จัดซื้อ'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-2xs bg-gradient-to-br from-white to-blue-50/40">
                  <div className="text-[11px] font-medium text-[#D97706] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#F28C28]" />
                    <span>ยอดสุทธิรวมภาษี (Net Total)</span>
                  </div>
                  <div className="font-bold text-blue-900 text-xl mt-1 tabular-nums">
                    ฿{(selectedPODetail.netAmount || selectedPODetail.totalAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">รวมภาษีมูลค่าเพิ่ม 7% แล้ว</div>
                </div>
              </div>

              {/* Financial Breakdown Table Card */}
              <div className="bg-white p-4.5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-2">
                <div className="text-xs font-bold text-[#14213D] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#F28C28]" />
                  <span>สรุปยอดเงินตามระเบียบบัญชี (Financial Summary)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F8FC] p-3 rounded-xl border text-xs">
                  <div>
                    <span className="text-slate-500">มูลค่าสินค้าก่อนภาษี:</span>
                    <div className="font-bold text-[#14213D] text-sm">
                      ฿{(selectedPODetail.subtotal || selectedPODetail.totalAmount || 0).toLocaleString()} บาท
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ส่วนลดรวม:</span>
                    <div className="font-bold text-rose-600 text-sm">
                      -฿{(selectedPODetail.discount || 0).toLocaleString()} บาท
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                    <div className="font-bold text-blue-700 text-sm">
                      ฿{(selectedPODetail.vatAmount || 0).toLocaleString()} บาท
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">ยอดเงินสุทธิที่ต้องชำระ:</span>
                    <div className="font-extrabold text-[#D97706] text-base font-mono">
                      ฿{(selectedPODetail.netAmount || selectedPODetail.totalAmount || 0).toLocaleString()} บาท
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks / Delivery Instructions */}
              {selectedPODetail.remarks && (
                <div className="p-3.5 bg-[#FFF7ED]/60 border border-orange-200/80 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-blue-900">เงื่อนไขการส่งมอบและหมายเหตุ: </span>
                    <span className="text-slate-700">{selectedPODetail.remarks}</span>
                  </div>
                </div>
              )}

              {/* Linked Goods Receipt (GR) Banner */}
              {selectedPODetail.goodsReceipts && selectedPODetail.goodsReceipts.length > 0 ? (
                <div className="p-4 bg-blue-50/70 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <ArrowDownToLine className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-blue-950">เอกสารตรวจรับเข้าคลัง (Goods Receipt):</span>
                        {selectedPODetail.goodsReceipts.map((gr: any) => (
                          <div key={gr.id} className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                            <span className="font-mono font-bold text-blue-800">{gr.grNumber}</span>
                            <StatusBadge status={gr.status} />
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-blue-700 mt-1">
                        ข้อมูลเชื่อมโยงกับระบบตรวจรับเข้าคลัง (GR) เพื่อบันทึก Lot/Exp และตรวจนับจำนวนจริง
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/inventory/receiving?poNumber=${selectedPODetail.poNumber}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
                  >
                    <span>เปิดตรวจรับสินค้า (GR)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : selectedPODetail.status === 'APPROVED' || selectedPODetail.status === 'ORDERED' ? (
                <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div className="text-xs text-blue-900">
                    <span className="font-bold">ระบบตรวจรับสินค้า (GR): </span>
                    <span>สามารถนำเลขที่ใบสั่งซื้อไปตรวจรับสินค้าได้เมื่อของมาส่ง</span>
                  </div>
                  <Link
                    href={`/inventory/receiving?poNumber=${selectedPODetail.poNumber}`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    ไปหน้าตรวจรับ (GR)
                  </Link>
                </div>
              ) : null}

              {/* Items Breakdown Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#F28C28]" />
                    <h4 className="font-bold text-xs text-[#14213D]">
                      รายการสินค้าที่สั่งซื้อ ({selectedPODetail.lines?.length || 0} รายการ)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    ติดตามยอดสั่งซื้อ ยอดรับแล้ว และยอดค้างรับ (Partial Receiving Tracker)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F5F8FC] text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-[#E2EAF4]">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">รหัสพัสดุ</th>
                        <th className="py-2.5 px-3">รายการเวชภัณฑ์</th>
                        <th className="py-2.5 px-3">รายละเอียด (Specification)</th>
                        <th className="py-2.5 px-3 text-center">หน่วย</th>
                        <th className="py-2.5 px-3 text-right">จำนวนสั่ง</th>
                        <th className="py-2.5 px-3 text-right text-emerald-700">รับแล้ว</th>
                        <th className="py-2.5 px-3 text-right text-amber-700">คงค้าง</th>
                        <th className="py-2.5 px-3 text-right">ราคา/หน่วย</th>
                        <th className="py-2.5 px-3 text-right">ส่วนลด</th>
                        <th className="py-2.5 px-4 text-right">มูลค่ารวมสุทธิ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPODetail.lines?.map((line: any, idx: number) => {
                        const item = line.item || {};
                        const lineVal = line.netAmount || line.totalAmount || (line.orderedQty * line.unitPrice);
                        return (
                          <tr key={line.id || idx} className="hover:bg-[#F5F8FC] transition-colors">
                            <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#D97706]">
                              {item.itemCode || '-'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-[#14213D]">
                              {item.itemName || 'รายการพัสดุ'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                              {line.specification || item.description || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600">
                              {item.unit || 'ชิ้น'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#14213D] tabular-nums">
                              {line.orderedQty?.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                              {line.receivedQty?.toLocaleString() || 0}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-700 tabular-nums">
                              {line.remainingQty?.toLocaleString() || 0}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700 tabular-nums">
                              ฿{line.unitPrice?.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right text-rose-600 tabular-nums">
                              {line.discount ? `-฿${line.discount.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-[#14213D] tabular-nums">
                              ฿{lineVal.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Workflow Notice */}
              <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>
                  🔒 ตามระเบียบจัดซื้อ เมื่อ PO ถูกอนุมัติและส่งให้ Supplier แล้ว จะไม่สามารถแก้ไขรายการย้อนหลังโดยตรงได้ (หากเปลี่ยนแปลงให้ทำ PO Revision หรือยกเลิก)
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-white border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>
                  รวมทั้งหมด: <strong className="text-[#14213D] font-bold">{selectedPODetail.lines?.length || 0}</strong> รายการ
                </span>
                <span>•</span>
                <span>
                  ยอดสุทธิรวม VAT:{' '}
                  <strong className="text-blue-900 font-bold text-sm tabular-nums">
                    ฿{(selectedPODetail.netAmount || selectedPODetail.totalAmount || 0).toLocaleString()} บาท
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-[#14213D] font-bold rounded-xl text-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>

                {(selectedPODetail.status === 'PENDING_APPROVAL' || selectedPODetail.status === 'DRAFT') && (
                  <button
                    type="button"
                    onClick={() => handlePOAction(selectedPODetail.id, 'APPROVE', selectedPODetail.poNumber)}
                    className="px-5 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>อนุมัติใบสั่งซื้อ (Approve PO)</span>
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
