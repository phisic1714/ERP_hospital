'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from '@erp/ui/navigation';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@erp/app-context';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Building,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Send,
  Eye,
  Printer,
  Copy,
  X,
  Calendar,
  User,
  PieChart,
  Tag,
  ArrowUpRight,
  Check,
  Ban,
  Package,
  FileSearch,
  RotateCcw,
  Edit3,
  Layers,
  Paperclip,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';
import { useBudget } from '@erp/app-context';

function RequisitionsContent() {
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get('planId') || '';

  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();
  const { allocations, getAllocationBudgetInfo, reserveBudget } = useBudget();
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedPRToConvert, setSelectedPRToConvert] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPRDetail, setSelectedPRDetail] = useState<any | null>(null);
  const [showReviseModal, setShowReviseModal] = useState(false);

  // Return / Reject prompt state
  const [showActionReasonModal, setShowActionReasonModal] = useState(false);
  const [actionType, setActionType] = useState<'RETURN' | 'REJECT'>('RETURN');
  const [actionReason, setActionReason] = useState('');

  // New PR Form State
  const [departmentId, setDepartmentId] = useState('');
  const [isUnplanned, setIsUnplanned] = useState(false);
  const [unplannedReason, setUnplannedReason] = useState('');
  const [unplannedDept, setUnplannedDept] = useState('กลุ่มงานเภสัชกรรม (Pharmacy)');
  const [unplannedAllocNo, setUnplannedAllocNo] = useState('ALC-2569-001');
  const [planId, setPlanId] = useState(initialPlanId);
  const [budgetYear, setBudgetYear] = useState('2569');
  const [purchaseType, setPurchaseType] = useState('MEDICAL_SUPPLY');
  const [urgency, setUrgency] = useState('NORMAL');
  const [requiredDate, setRequiredDate] = useState('');
  const [justification, setJustification] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [lines, setLines] = useState<any[]>([
    {
      itemId: '',
      specification: '',
      requestedQty: 100,
      estimatedUnitPrice: 50,
      remark: '',
      currentStock: 0,
      reorderPoint: 0,
    },
  ]);

  // Convert to PO Form State (Supports Multi-PO splitting)
  const [convertSupplierId, setConvertSupplierId] = useState('');
  const [convertExpectedDate, setConvertExpectedDate] = useState('');
  const [convertDeliveryLocation, setConvertDeliveryLocation] = useState('คลังเวชภัณฑ์กลาง อาคารเภสัชกรรม ชั้น 1');
  const [convertPaymentTerms, setConvertPaymentTerms] = useState('Credit 30 วัน');
  const [convertCreditDays, setConvertCreditDays] = useState(30);
  const [convertRemarks, setConvertRemarks] = useState('');
  const [selectedLineIdsToConvert, setSelectedLineIdsToConvert] = useState<string[]>([]);

  // Revision Form State
  const [revisionLines, setRevisionLines] = useState<any[]>([]);
  const [revisionJustification, setRevisionJustification] = useState('');
  const [revisionUrgency, setRevisionUrgency] = useState('NORMAL');
  const [revisionRequiredDate, setRevisionRequiredDate] = useState('');
  const [revisionPurchaseType, setRevisionPurchaseType] = useState('MEDICAL_SUPPLY');
  const [revisionDepartmentId, setRevisionDepartmentId] = useState('');

  const loadRequisitions = () => {
    setLoading(true);
    fetch('/api/procurement/requisitions')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRequisitions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRequisitions();
    fetch('/api/procurement/plans')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlans(data);
      });
    fetch('/api/departments')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartments(data);
          if (data.length > 0 && !departmentId) {
            setDepartmentId(data[0].id);
          }
        }
      });
    fetch('/api/items')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
          if (data.length > 0 && lines[0].itemId === '') {
            setLines([
              {
                itemId: data[0].id,
                specification: data[0].description || '',
                requestedQty: 100,
                estimatedUnitPrice: data[0].standardCost || 50,
                remark: '',
                currentStock: 0,
                reorderPoint: data[0].reorderPoint || 0,
              },
            ]);
          }
        }
      });
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSuppliers(data);
          if (data.length > 0) setConvertSupplierId(data[0].id);
        }
      });
  }, [refreshKey]);

  useEffect(() => {
    if (initialPlanId) {
      setPlanId(initialPlanId);
      setIsUnplanned(false);
      const matched = plans.find((p) => p.id === initialPlanId);
      if (matched?.budgetYear) setBudgetYear(matched.budgetYear);
      setShowCreateModal(true);
    }
  }, [initialPlanId, plans]);

  // Handle plan change to sync budget year
  const handlePlanChange = (selectedId: string) => {
    setPlanId(selectedId);
    if (selectedId) {
      const p = plans.find((x) => x.id === selectedId);
      if (p?.budgetYear) setBudgetYear(p.budgetYear);
    }
  };

  // Auto-fill from low stock
  const handleAutoFillLowStock = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.balances && Array.isArray(data.balances)) {
        const lowItems = data.balances.filter(
          (b: any) => b.available <= (b.item.reorderPoint || 100)
        );

        if (lowItems.length === 0) {
          addToast('info', 'ขณะนี้ไม่มีสินค้าที่สต็อกต่ำกว่าจุดสั่งซื้อ (ROP)');
          return;
        }

        const autoLines = lowItems.slice(0, 5).map((b: any) => {
          const neededQty = Math.max((b.item.maxStock || 500) - b.available, 50);
          return {
            itemId: b.item.id,
            specification: b.item.description || '',
            requestedQty: neededQty,
            estimatedUnitPrice: b.item.standardCost || 50,
            remark: 'เติมสต็อกตามเกณฑ์ ROP',
            currentStock: b.available,
            reorderPoint: b.item.reorderPoint || 0,
          };
        });

        setLines(autoLines);
        setUrgency('URGENT');
        setJustification('ขอจัดซื้อด่วนเนื่องจากสินค้าในคลังลดลงต่ำกว่าจุดสั่งซื้อ (ROP Alert)');
        addToast('success', `ดึงรายการสินค้าสต็อกต่ำอัตโนมัติสำเร็จ (${autoLines.length} รายการ)`);
      }
    } catch (err: any) {
      addToast('error', 'ไม่สามารถดึงข้อมูลสต็อกต่ำได้');
    }
  };

  const handleAddLine = () => {
    if (items.length > 0) {
      setLines([
        ...lines,
        {
          itemId: items[0].id,
          specification: items[0].description || '',
          requestedQty: 100,
          estimatedUnitPrice: items[0].standardCost || 50,
          remark: '',
          currentStock: 0,
          reorderPoint: items[0].reorderPoint || 0,
        },
      ]);
    }
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, idx) => idx !== index));
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index][field] = value;
    if (field === 'itemId') {
      const it = items.find((i) => i.id === value);
      if (it) {
        updated[index].estimatedUnitPrice = it.standardCost || 0;
        updated[index].reorderPoint = it.reorderPoint || 0;
        updated[index].specification = it.description || '';
      }
    }
    setLines(updated);
  };

  const calculateFormTotal = () => {
    return lines.reduce(
      (sum, l) => sum + (Number(l.requestedQty) || 0) * (Number(l.estimatedUnitPrice) || 0),
      0
    );
  };

  const selectedPlan = plans.find((p) => p.id === planId);
  const formTotal = calculateFormTotal();

  // For unplanned emergency purchase:
  const unplannedAlloc =
    allocations.find((a) => a.allocNo === unplannedAllocNo) ||
    allocations.find((a) => a.departmentName === unplannedDept) ||
    allocations[0];
  const unplannedBudgetInfo = unplannedAlloc ? getAllocationBudgetInfo(unplannedAlloc.allocNo) : null;

  const currentAvailableBudget = isUnplanned
    ? unplannedBudgetInfo?.remainingBudget || 0
    : selectedPlan?.remainingBudget || 0;

  const isBudgetExceeded = formTotal > currentAvailableBudget;

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUnplanned && !unplannedReason.trim()) {
      addToast('error', 'กรุณาระบุเหตุผลความจำเป็นสำหรับคำขอนอกแผนงบประมาณ');
      return;
    }

    if (isBudgetExceeded) {
      addToast(
        'error',
        `ยอดเงินขอซื้อ (฿${formTotal.toLocaleString()}) เกินงบประมาณคงเหลือ (฿${currentAvailableBudget.toLocaleString()}) กรุณาปรับลดจำนวน หรือขอโอน/เพิ่มกรอบงบประมาณก่อน (ตามกฎข้อ 4 ห้ามใช้วงเงินเกินยอดที่ใช้ได้)`
      );
      return;
    }

    try {
      const effectiveDeptName = isUnplanned
        ? unplannedDept
        : selectedPlan?.departmentName || 'กลุ่มงานเภสัชกรรม (Pharmacy)';
      const effectiveAllocId = isUnplanned
        ? unplannedAlloc?.allocNo
        : selectedPlan?.allocationId || 'ALC-2569-001';
      const effectiveBudgetCode = isUnplanned
        ? unplannedAlloc?.budgetCode
        : selectedPlan?.budgetCode || 'BG-69-PHARM-01';

      const res = await fetch('/api/procurement/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: departmentId || null,
          departmentName: effectiveDeptName,
          planId: isUnplanned ? null : planId || null,
          planNumber: isUnplanned ? null : selectedPlan?.planNumber || null,
          allocationId: effectiveAllocId,
          budgetCode: effectiveBudgetCode,
          budgetYear: isUnplanned ? budgetYear : selectedPlan?.fiscalYear || selectedPlan?.budgetYear || budgetYear,
          purchaseType,
          isUnplanned,
          unplannedReason: isUnplanned ? unplannedReason : null,
          urgency,
          requiredDate: requiredDate || null,
          justification,
          attachmentName: attachmentName || null,
          attachmentUrl: attachmentName ? `/attachments/${attachmentName}` : null,
          requesterName: currentUser.name,
          lines,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PR');

      // Update Budget Management Reservation in real-time
      if (effectiveBudgetCode) {
        reserveBudget(
          effectiveBudgetCode,
          formTotal,
          data.prNumber,
          `กันงบประมาณสำหรับใบขอซื้อ ${data.prNumber} (${effectiveDeptName})`
        );
      }

      addToast(
        'success',
        `สร้างใบขอซื้อ ${data.prNumber} สำเร็จ (กันงบประมาณในระบบ Budget ฿${formTotal.toLocaleString()} เรียบร้อย)`
      );
      setShowCreateModal(false);
      setJustification('');
      setUnplannedReason('');
      setAttachmentName('');
      triggerRefresh();
      loadRequisitions();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Convert to PO Modal openers
  const handleOpenConvertModal = (pr: any) => {
    setSelectedPRToConvert(pr);
    // Auto-select all lines that haven't been fully ordered yet
    const availableLineIds = (pr.lines || [])
      .filter((l: any) => (l.approvedQty || l.requestedQty) > (l.orderedQty || 0))
      .map((l: any) => l.id);
    setSelectedLineIdsToConvert(availableLineIds);
    setConvertRemarks(`สร้างใบสั่งซื้ออ้างอิงใบขอซื้อเลขที่ ${pr.prNumber}`);
    setShowConvertModal(true);
  };

  const handleToggleLineSelection = (lineId: string) => {
    if (selectedLineIdsToConvert.includes(lineId)) {
      setSelectedLineIdsToConvert(selectedLineIdsToConvert.filter((id) => id !== lineId));
    } else {
      setSelectedLineIdsToConvert([...selectedLineIdsToConvert, lineId]);
    }
  };

  const handleConvertPRToPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPRToConvert) return;

    if (selectedLineIdsToConvert.length === 0) {
      addToast('error', 'กรุณาเลือกรายการสินค้าที่ต้องการสั่งซื้ออย่างน้อย 1 รายการ');
      return;
    }

    try {
      const res = await fetch(`/api/procurement/requisitions/${selectedPRToConvert.id}/convert-po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: convertSupplierId,
          expectedDate: convertExpectedDate || null,
          deliveryLocation: convertDeliveryLocation,
          paymentTerms: convertPaymentTerms,
          creditDays: Number(convertCreditDays) || 30,
          remarks: convertRemarks,
          selectedLineIds: selectedLineIdsToConvert,
          createdBy: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to convert to PO');

      addToast(
        'success',
        `แปลงใบขอซื้อเป็นใบสั่งซื้อ ${data.po.poNumber} สำเร็จ (${selectedLineIdsToConvert.length} รายการ)`
      );
      setShowConvertModal(false);
      setSelectedPRToConvert(null);
      triggerRefresh();
      loadRequisitions();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Approver Actions
  const handleOpenActionModal = (type: 'RETURN' | 'REJECT') => {
    setActionType(type);
    setActionReason('');
    setShowActionReasonModal(true);
  };

  const handleSubmitActionWithReason = async () => {
    if (!selectedPRDetail) return;
    if (!actionReason.trim()) {
      addToast('error', `กรุณาระบุเหตุผลในการ${actionType === 'RETURN' ? 'ส่งกลับแก้ไข' : 'ปฏิเสธ'}`);
      return;
    }

    try {
      const res = await fetch(`/api/procurement/requisitions/${selectedPRDetail.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          approvedBy: currentUser.name,
          returnReason: actionType === 'RETURN' ? actionReason : undefined,
          rejectReason: actionType === 'REJECT' ? actionReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast(
        'success',
        actionType === 'RETURN'
          ? `ส่งกลับคำขอซื้อ ${selectedPRDetail.prNumber} เพื่อแก้ไขเรียบร้อยแล้ว`
          : `ปฏิเสธคำขอซื้อ ${selectedPRDetail.prNumber} เรียบร้อยแล้ว`
      );
      setShowActionReasonModal(false);
      setShowDetailModal(false);
      setSelectedPRDetail(null);
      triggerRefresh();
      loadRequisitions();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleApproveFromDetail = async () => {
    if (!selectedPRDetail) return;
    try {
      const res = await fetch(`/api/procurement/requisitions/${selectedPRDetail.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'APPROVE',
          approvedBy: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', `อนุมัติคำขอซื้อ ${selectedPRDetail.prNumber} เรียบร้อยแล้ว (พร้อมออก PO/RFQ)`);
      setShowDetailModal(false);
      setSelectedPRDetail(null);
      triggerRefresh();
      loadRequisitions();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Open Revision Modal for RETURNED PR
  const handleOpenReviseModal = (pr: any) => {
    setSelectedPRDetail(pr);
    setRevisionDepartmentId(pr.departmentId || departments[0]?.id || '');
    setRevisionJustification(pr.justification || '');
    setRevisionUrgency(pr.urgency || 'NORMAL');
    setRevisionPurchaseType(pr.purchaseType || 'MEDICAL_SUPPLY');
    setRevisionRequiredDate(pr.requiredDate ? pr.requiredDate.split('T')[0] : '');
    setRevisionLines(
      pr.lines.map((l: any) => ({
        itemId: l.itemId,
        specification: l.specification || '',
        requestedQty: l.requestedQty,
        estimatedUnitPrice: l.estimatedUnitPrice,
        remark: l.remark || '',
        currentStock: l.currentStock,
        reorderPoint: l.reorderPoint,
      }))
    );
    setShowReviseModal(true);
  };

  const handleReviseLineChange = (index: number, field: string, value: any) => {
    const updated = [...revisionLines];
    updated[index][field] = value;
    if (field === 'itemId') {
      const it = items.find((i) => i.id === value);
      if (it) {
        updated[index].estimatedUnitPrice = it.standardCost || 0;
        updated[index].specification = it.description || '';
      }
    }
    setRevisionLines(updated);
  };

  const handleSaveAndResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPRDetail) return;

    try {
      const res = await fetch(`/api/procurement/requisitions/${selectedPRDetail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: revisionDepartmentId,
          urgency: revisionUrgency,
          purchaseType: revisionPurchaseType,
          requiredDate: revisionRequiredDate || null,
          justification: revisionJustification,
          lines: revisionLines,
          resubmit: true,
          userName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resubmit PR');

      addToast('success', `แก้ไขและส่งอนุมัติใบขอซื้อ ${selectedPRDetail.prNumber} ใหม่อีกครั้งเรียบร้อยแล้ว`);
      setShowReviseModal(false);
      setShowDetailModal(false);
      setSelectedPRDetail(null);
      triggerRefresh();
      loadRequisitions();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Filtering
  const filteredRequisitions = requisitions.filter((pr) => {
    const matchesSearch =
      !search ||
      pr.prNumber?.toLowerCase().includes(search.toLowerCase()) ||
      pr.requesterName?.toLowerCase().includes(search.toLowerCase()) ||
      (pr.department?.name && pr.department.name.toLowerCase().includes(search.toLowerCase())) ||
      (pr.plan?.name && pr.plan.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPurchaseTypeBadge = (type: string) => {
    switch (type) {
      case 'DRUG':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">ยาและเวชภัณฑ์</span>;
      case 'EQUIPMENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">ครุภัณฑ์ทางการแพทย์</span>;
      case 'MEDICAL_SUPPLY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">วัสดุการแพทย์</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">จัดซื้อทั่วไป</span>;
    }
  };

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
            <span className="text-slate-500">ใบขอซื้อ (PR)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#14213D] flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#F28C28]" />
            <span>ใบขอซื้อพัสดุและเวชภัณฑ์ (Purchase Requisition - PR)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ใบขอซื้อภายในองค์กร ตรวจสอบงบประมาณตามแผนจัดซื้อ (PP) รองรับการแบ่งออกหลาย PO และกระบวนการขอใบเสนอราคา (RFQ)
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
            <span>สร้างใบขอซื้อ (New PR)</span>
          </button>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAF4] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ PR, ผู้ขอซื้อ, แผนก, หรือชื่อแผนจัดซื้อ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C28] text-slate-700"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'ALL', label: 'ทั้งหมด', count: requisitions.length },
              { id: 'PENDING_APPROVAL', label: 'รออนุมัติ', count: requisitions.filter((r) => r.status === 'PENDING_APPROVAL').length },
              { id: 'RETURNED', label: 'ส่งกลับแก้ไข', count: requisitions.filter((r) => r.status === 'RETURNED').length },
              { id: 'APPROVED', label: 'อนุมัติแล้ว', count: requisitions.filter((r) => r.status === 'APPROVED').length },
              { id: 'PO_CREATED', label: 'ออก PO แล้ว', count: requisitions.filter((r) => r.status === 'PO_CREATED').length },
              { id: 'REJECTED', label: 'ไม่อนุมัติ', count: requisitions.filter((r) => r.status === 'REJECTED').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-[#F28C28] text-white font-semibold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PR Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ใบขอซื้อ</th>
                <th className="py-3 px-3">วันที่ขอซื้อ</th>
                <th className="py-3 px-3">แผนกที่ขอซื้อ</th>
                <th className="py-3 px-3">ประเภทจัดซื้อ</th>
                <th className="py-3 px-3">แผนจัดซื้อ (PP) / งบประมาณ</th>
                <th className="py-3 px-3 text-right">จำนวนรายการ</th>
                <th className="py-3 px-3 text-right">ยอดเงินประเมินรวม</th>
                <th className="py-3 px-3 text-center">ความเร่งด่วน</th>
                <th className="py-3 px-3 text-center">สถานะเอกสาร</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    กำลังโหลดข้อมูลใบขอซื้อ...
                  </td>
                </tr>
              ) : filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    {search || statusFilter !== 'ALL'
                      ? 'ไม่พบใบขอซื้อที่ตรงกับเงื่อนไขการค้นหา'
                      : 'ยังไม่มีรายการใบขอซื้อ'}
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((pr) => (
                  <tr
                    key={pr.id}
                    className="hover:bg-[#FFF7ED]/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedPRDetail(pr);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#D97706]">
                      <span className="hover:underline text-[#D97706] bg-[#FFF7ED] border border-orange-200/60 group-hover:bg-orange-100 px-2 py-0.5 rounded-lg transition-colors">
                        {pr.prNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(pr.requestDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{pr.departmentName || pr.department?.name || 'กลุ่มงานเภสัชกรรม (Pharmacy)'}</span>
                      </div>
                      {(pr.allocationId || pr.plan?.allocationId) && (
                        <div className="text-[10px] font-mono text-emerald-800 font-semibold mt-0.5">
                          {pr.allocationId || pr.plan?.allocationId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getPurchaseTypeBadge(pr.purchaseType || 'GENERAL')}
                    </td>
                    <td className="py-3 px-3">
                      {pr.isUnplanned ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            จัดซื้อเร่งด่วนนอกแผน (ปี {pr.budgetYear || '2569'})
                          </span>
                          <div className="text-[10px] font-mono text-emerald-700">
                            [{pr.allocationId || 'ALC-2569-001'} · {pr.budgetCode || 'BG-69-PHARM-01'}]
                          </div>
                        </div>
                      ) : pr.plan || pr.planNumber ? (
                        <div className="space-y-0.5">
                          <div className="font-semibold text-purple-900 truncate max-w-[200px]">
                            {pr.plan?.name || 'แผนจัดซื้อเวชภัณฑ์ประจำปี'}
                          </div>
                          <div className="text-[10px] font-mono text-purple-700 flex items-center gap-1">
                            <span className="font-bold">[{pr.planNumber || pr.plan?.planNumber}]</span>
                            <span className="text-emerald-700 font-semibold">
                              · {pr.allocationId || pr.plan?.allocationId || 'ALC-2569-001'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium tabular-nums">
                      {pr.lines?.length || 0} รายการ
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">
                      ฿{pr.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          pr.urgency === 'EMERGENCY'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                            : pr.urgency === 'URGENT'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pr.urgency === 'EMERGENCY' ? 'ฉุกเฉิน' : pr.urgency === 'URGENT' ? 'ด่วน' : 'ปกติ'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={pr.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPRDetail(pr);
                            setShowDetailModal(true);
                          }}
                          className="px-2.5 py-1 text-slate-700 hover:text-[#14213D] hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors border border-slate-200 shadow-2xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>ดูข้อมูล</span>
                        </button>

                        {pr.status === 'RETURNED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviseModal(pr)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                            title="แก้ไขข้อมูลตามที่ผู้บังคับบัญชาส่งกลับและส่งใหม่"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>แก้ไขส่งใหม่</span>
                          </button>
                        )}

                        {pr.status === 'APPROVED' && (
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/procurement/rfq?prId=${pr.id}`}
                              className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                              title="ส่งขอใบเสนอราคาจากผู้จำหน่าย (RFQ)"
                            >
                              <FileSearch className="w-3.5 h-3.5" />
                              <span>RFQ</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenConvertModal(pr)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1"
                              title="ออกใบสั่งซื้อ (PO) สู่ผู้ขาย"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>ออก PO</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create PR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-4xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#14213D] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#F28C28]" />
                  <span>สร้างใบขอซื้อพัสดุและเวชภัณฑ์ (Purchase Requisition - PR)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  เอกสารขอซื้อภายในองค์กร ไม่บังคับระบุผู้ขาย ระบบจะตรวจสอบงบประมาณและบันทึกประวัติการขอซื้อ
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-4 text-xs">
              {/* Header Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#F5F8FC] p-3.5 rounded-xl border border-[#E2EAF4]">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    แผนกที่ขอซื้อ (Department) *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#F28C28] cursor-pointer"
                    required
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.code}] {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ประเภทการจัดซื้อ (Purchase Type) *
                  </label>
                  <select
                    value={purchaseType}
                    onChange={(e) => setPurchaseType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#F28C28] cursor-pointer"
                    required
                  >
                    <option value="GENERAL">จัดซื้อทั่วไป</option>
                    <option value="DRUG">ยาและเวชภัณฑ์ทางการแพทย์</option>
                    <option value="MEDICAL_SUPPLY">วัสดุการแพทย์และอุปกรณ์สิ้นเปลือง</option>
                    <option value="EQUIPMENT">เครื่องมือแพทย์ / ครุภัณฑ์</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ระดับความเร่งด่วน</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#F28C28] cursor-pointer"
                  >
                    <option value="NORMAL">ปกติ (Normal)</option>
                    <option value="URGENT">ด่วน (Urgent - ใกล้ถึง ROP)</option>
                    <option value="EMERGENCY">ฉุกเฉิน (Emergency - ขาดแคลนวิกฤต)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    วันที่ต้องการใช้สินค้า (Required Date)
                  </label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีงบประมาณ</label>
                  <input
                    type="text"
                    value={budgetYear}
                    onChange={(e) => setBudgetYear(e.target.value)}
                    placeholder="2568"
                    className="w-full px-3 py-2 border rounded-lg bg-white font-mono"
                    disabled={!isUnplanned && !!selectedPlan}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เอกสารแนบอ้างอิง</label>
                  <div className="relative">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="เช่น บันทึกข้อความขออนุมัติ_2568.pdf"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Procurement Plan vs Unplanned Purchase Toggle (Budget Integration) */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-purple-700" />
                    <span className="font-bold text-slate-800 text-xs">
                      การอ้างอิงแผนจัดซื้อ (PP) และการดึงงบประมาณอัตโนมัติ
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isUnplanned}
                      onChange={(e) => {
                        setIsUnplanned(e.target.checked);
                        if (e.target.checked) setPlanId('');
                      }}
                      className="rounded text-[#F28C28] focus:ring-[#F28C28]"
                    />
                    <span className={isUnplanned ? 'font-bold text-rose-700' : ''}>
                      จัดซื้อเร่งด่วนไม่มี PP อ้างอิง (Emergency Special Workflow)
                    </span>
                  </label>
                </div>

                {!isUnplanned ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        เลือกแผนการจัดซื้อจัดจ้าง (Procurement Plan - PP) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={planId}
                        onChange={(e) => handlePlanChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500 cursor-pointer font-medium text-xs"
                        required={!isUnplanned}
                      >
                        <option value="">-- กรุณาเลือกแผนจัดซื้อ (PP) เพื่อดึงงบประมาณอัตโนมัติ --</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.planNumber}] {p.name} — คงเหลือ ฿{p.remainingBudget?.toLocaleString()} บ.
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedPlan ? (
                      <div className="p-3.5 bg-white rounded-xl border border-purple-200 space-y-2.5 shadow-2xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">
                              หน่วยงาน / กลุ่มงาน (ดึงจาก PP อัตโนมัติ)
                            </span>
                            <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                              {selectedPlan.departmentName || 'กลุ่มงานเภสัชกรรม (Pharmacy)'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">
                              รหัสจัดสรรงบประมาณ (ดึงจาก PP อัตโนมัติ)
                            </span>
                            <span className="font-mono font-bold text-emerald-800 text-xs mt-0.5 block">
                              {selectedPlan.allocationId || 'ALC-2569-001'} · {selectedPlan.budgetCode || 'BG-69-PHARM-01'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                          <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                            <span className="text-[10px] text-purple-700 block">วงเงินจัดสรรของแผน</span>
                            <span className="font-extrabold text-[#14213D] text-xs tabular-nums mt-0.5 block">
                              ฿{(selectedPlan.targetBudget || selectedPlan.allocatedBudget)?.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 block font-semibold">วงเงินคงเหลือของแผน</span>
                            <span className="font-extrabold text-emerald-700 text-xs tabular-nums mt-0.5 block">
                              ฿{selectedPlan.remainingBudget?.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="text-[10px] text-amber-800 block font-semibold">มูลค่ารวม PR ที่ขอซื้อ</span>
                            <span className="font-extrabold text-amber-700 text-xs tabular-nums mt-0.5 block">
                              ฿{formTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Real-time Budget Check Alert */}
                        {isBudgetExceeded ? (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <div>ยอดเงินขอซื้อเกินงบประมาณคงเหลือของแผน!</div>
                              <div className="text-[11px] font-normal text-rose-600">
                                ขอซื้อ ฿{formTotal.toLocaleString()} เกินงบคงเหลือ (฿{selectedPlan.remainingBudget?.toLocaleString()}) อยู่ ฿{(formTotal - selectedPlan.remainingBudget).toLocaleString()} บาท (ตามกฎข้อ 4 ห้ามใช้วงเงินเกินยอดที่ใช้ได้)
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>ยอดขอซื้ออยู่ในกรอบงบประมาณของแผนจัดซื้อ</span>
                            </span>
                            <span className="text-emerald-700 font-bold">
                              คงเหลือหลังขอซื้อ: ฿{(selectedPlan.remainingBudget - formTotal).toLocaleString()} บ.
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-white/70 border border-dashed border-purple-200 rounded-xl text-center text-slate-400 text-xs">
                        กรุณาเลือกแผนจัดซื้อ (PP) เพื่อดึงกลุ่มงานและรหัสจัดสรรงบประมาณอัตโนมัติ
                      </div>
                    )}
                  </div>
                ) : (
                  /* Emergency / Unplanned Purchase: Direct Budget Selection with Special Workflow */
                  <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>การจัดซื้อเร่งด่วนไม่มี PP อ้างอิง (Special Workflow): เลือกงบประมาณโดยตรง</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          กลุ่มงานเจ้าของงบประมาณ <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={unplannedDept}
                          onChange={(e) => {
                            setUnplannedDept(e.target.value);
                            const matched = allocations.find((a) => a.departmentName === e.target.value);
                            if (matched) setUnplannedAllocNo(matched.allocNo);
                          }}
                          className="w-full px-3 py-2 border rounded-xl bg-white font-semibold text-slate-800 cursor-pointer"
                        >
                          {Array.from(new Set(allocations.map((a) => a.departmentName))).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          รายการจัดสรรงบประมาณ <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={unplannedAllocNo}
                          onChange={(e) => setUnplannedAllocNo(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl bg-white font-mono font-bold text-emerald-800 cursor-pointer"
                        >
                          {allocations
                            .filter((a) => a.departmentName === unplannedDept)
                            .map((a) => (
                              <option key={a.id} value={a.allocNo}>
                                {a.allocNo} · {a.budgetCode} (คงเหลือ ฿{getAllocationBudgetInfo(a.allocNo).remainingBudget.toLocaleString()})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs p-2.5 bg-white rounded-lg border border-rose-200">
                      <span>
                        วงเงินคงเหลือของงบประมาณ: <strong className="text-emerald-700">฿{unplannedBudgetInfo?.remainingBudget.toLocaleString()} บาท</strong>
                      </span>
                      <span>
                        มูลค่ารวม PR: <strong className={isBudgetExceeded ? 'text-rose-600' : 'text-slate-800'}>฿{formTotal.toLocaleString()} บาท</strong>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-rose-800 font-semibold text-[11px]">
                        ระบุเหตุผลความจำเป็นเร่งด่วนสำหรับการจัดซื้อกรณีพิเศษ *
                      </label>
                      <textarea
                        rows={2}
                        value={unplannedReason}
                        onChange={(e) => setUnplannedReason(e.target.value)}
                        placeholder="ระบุเหตุผลความจำเป็น เช่น กรณีฉุกเฉินทางระบาดวิทยา, ผู้ป่วยวิกฤตเพิ่มขึ้นกะทันหัน..."
                        className="w-full px-3 py-2 border border-rose-300 rounded-lg bg-white text-xs text-rose-950 focus:ring-2 focus:ring-rose-500"
                        required={isUnplanned}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#F28C28]" />
                    <span>รายการสินค้าขอซื้อ ({lines.length} รายการ)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFillLowStock}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ดึงสินค้าสต็อกต่ำอัตโนมัติ</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLine}
                      className="text-[#F28C28] hover:text-[#D97706] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มรายการ</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded-xl bg-[#F5F8FC]">
                  {lines.map((line, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 w-5">{idx + 1}.</span>
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

                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="จำนวน"
                            value={line.requestedQty}
                            onChange={(e) =>
                              handleLineChange(idx, 'requestedQty', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 border rounded-lg text-xs text-right font-medium"
                            required
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="number"
                            placeholder="ราคาประมาณ"
                            value={line.estimatedUnitPrice}
                            onChange={(e) =>
                              handleLineChange(idx, 'estimatedUnitPrice', Number(e.target.value))
                            }
                            className="w-full px-2 py-1.5 border rounded-lg text-xs text-right font-medium"
                            required
                          />
                        </div>

                        <div className="w-28 text-right font-bold text-[#14213D] tabular-nums">
                          ฿{((line.requestedQty || 0) * (line.estimatedUnitPrice || 0)).toLocaleString()}
                        </div>

                        {lines.length > 1 && (
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
                          placeholder="หมายเหตุเพิ่มเติมสำหรับรายการนี้..."
                          value={line.remark}
                          onChange={(e) => handleLineChange(idx, 'remark', e.target.value)}
                          className="px-2.5 py-1 border rounded text-[11px] bg-slate-50/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-slate-500">
                    * ไม่ต้องเลือก Supplier ในขั้นตอนนี้ สามารถเลือกผู้ขายในขั้นตอน RFQ หรือตอนออก PO
                  </span>
                  <div className="font-bold text-[#14213D]">
                    ยอดรวมประเมินทั้งสิ้น:{' '}
                    <span className="text-[#D97706] ml-2 font-mono text-base">
                      ฿{calculateFormTotal().toLocaleString()} บาท
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เหตุผลความจำเป็นในการขอซื้อ</label>
                <textarea
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="ระบุเหตุผลความจำเป็น เช่น สำรองใช้งานตามรอบปกติ, เติมสต็อกหอผู้ป่วย..."
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                  required
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
                  disabled={isBudgetExceeded}
                  className={`px-5 py-2 font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-all ${
                    isBudgetExceeded
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#F28C28] hover:bg-[#D97706] text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งใบขอซื้อ (Submit PR)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Convert PR to PO (With Line Splitting Support) */}
      {showConvertModal && selectedPRToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-2xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#14213D] flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <span>แปลงใบขอซื้อเป็นใบสั่งซื้อ (Convert PR to PO)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  รองรับการเลือกเฉพาะบางรายการเพื่อแบ่งสั่งซื้อกับ Supplier หลายราย (PR Splitting)
                </p>
              </div>
              <button
                onClick={() => setShowConvertModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#F5F8FC] rounded-xl border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">เลขที่ใบขอซื้อ:</span>
                <span className="font-mono font-bold text-[#D97706]">
                  {selectedPRToConvert.prNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">แผนกต้นทาง:</span>
                <span className="font-medium text-slate-700">
                  {selectedPRToConvert.department?.name || 'ไม่ระบุ'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">งบประมาณอ้างอิง:</span>
                <span className="font-medium text-slate-700">
                  {selectedPRToConvert.plan ? selectedPRToConvert.plan.name : 'นอกแผนงบประมาณ'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConvertPRToPO} className="space-y-4 text-xs">
              {/* Select Line Items for this PO */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    เลือกรายการสินค้าที่จะสั่งซื้อใน PO นี้ ({selectedLineIdsToConvert.length}/
                    {selectedPRToConvert.lines?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedLineIdsToConvert.length === selectedPRToConvert.lines?.length) {
                        setSelectedLineIdsToConvert([]);
                      } else {
                        setSelectedLineIdsToConvert(selectedPRToConvert.lines?.map((l: any) => l.id) || []);
                      }
                    }}
                    className="text-[#F28C28] hover:underline font-semibold text-[11px]"
                  >
                    {selectedLineIdsToConvert.length === selectedPRToConvert.lines?.length
                      ? 'ยกเลิกเลือกทั้งหมด'
                      : 'เลือกทั้งหมด'}
                  </button>
                </div>

                <div className="border rounded-xl divide-y bg-[#F5F8FC] max-h-48 overflow-y-auto">
                  {selectedPRToConvert.lines?.map((l: any) => {
                    const isSelected = selectedLineIdsToConvert.includes(l.id);
                    const alreadyOrdered = l.orderedQty || 0;
                    const maxQty = l.approvedQty || l.requestedQty;
                    const remaining = Math.max(0, maxQty - alreadyOrdered);
                    return (
                      <div
                        key={l.id}
                        onClick={() => handleToggleLineSelection(l.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-orange-50/70' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-[#F28C28] focus:ring-[#F28C28]"
                          />
                          <div>
                            <div className="font-semibold text-slate-800">
                              {l.item?.itemName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              รหัส: {l.item?.itemCode} • ขอ: {maxQty} {l.item?.unit} (สั่งแล้ว: {alreadyOrdered})
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-slate-800 tabular-nums">
                            {remaining} {l.item?.unit}
                          </div>
                          <div className="text-[10px] text-slate-500 tabular-nums">
                            ฿{(remaining * l.estimatedUnitPrice).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลือกผู้จัดจำหน่าย (Supplier) *
                </label>
                <select
                  value={convertSupplierId}
                  onChange={(e) => setConvertSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white focus:ring-2 focus:ring-[#F28C28] cursor-pointer font-medium"
                  required
                >
                  <option value="">-- เลือกผู้จัดจำหน่าย --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name} - เครดิต: {s.paymentTerm}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    สถานที่ส่งมอบพัสดุ (Delivery Location)
                  </label>
                  <input
                    type="text"
                    value={convertDeliveryLocation}
                    onChange={(e) => setConvertDeliveryLocation(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    กำหนดส่งมอบ (Expected Date)
                  </label>
                  <input
                    type="date"
                    value={convertExpectedDate}
                    onChange={(e) => setConvertExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เงื่อนไขการชำระเงิน</label>
                  <input
                    type="text"
                    value={convertPaymentTerms}
                    onChange={(e) => setConvertPaymentTerms(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เครดิตเทอม (วัน)</label>
                  <input
                    type="number"
                    value={convertCreditDays}
                    onChange={(e) => setConvertCreditDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={convertRemarks}
                  onChange={(e) => setConvertRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-[#F5F8FC] font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>ยืนยันสร้างใบสั่งซื้อ (Create PO)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full-Screen PR Detail View */}
      {showDetailModal && selectedPRDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28] shadow-2xs shrink-0">
                  <FileText className="w-6 h-6 text-[#F28C28]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedPRDetail.prNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedPRDetail.prNumber);
                          addToast('info', `คัดลอกเลขที่ ${selectedPRDetail.prNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={selectedPRDetail.status} />

                    {getPurchaseTypeBadge(selectedPRDetail.purchaseType || 'GENERAL')}

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        selectedPRDetail.urgency === 'EMERGENCY'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : selectedPRDetail.urgency === 'URGENT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-[#475569] border border-slate-200/80'
                      }`}
                    >
                      {selectedPRDetail.urgency === 'EMERGENCY'
                        ? 'ด่วนฉุกเฉิน'
                        : selectedPRDetail.urgency === 'URGENT'
                        ? 'ด่วน'
                        : 'ความเร่งด่วนปกติ'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      รายละเอียดใบขอซื้อพัสดุและเวชภัณฑ์ (Purchase Requisition Specification)
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

                {selectedPRDetail.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      type="button"
                      onClick={handleApproveFromDetail}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติคำขอ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal('RETURN')}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-semibold shadow-xs transition-all"
                      title="ส่งกลับให้ผู้ขอดำเนินการแก้ไข"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ส่งกลับแก้ไข</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal('REJECT')}
                      className="flex items-center gap-1 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>ไม่อนุมัติ</span>
                    </button>
                  </>
                )}

                {selectedPRDetail.status === 'RETURNED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenReviseModal(selectedPRDetail);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>แก้ไขและส่งอนุมัติใหม่</span>
                  </button>
                )}

                {selectedPRDetail.status === 'APPROVED' && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/procurement/rfq?prId=${selectedPRDetail.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>ขอใบเสนอราคา (RFQ)</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleOpenConvertModal(selectedPRDetail);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>ออก PO ตรง</span>
                    </button>
                  </div>
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F5F8FC]/60">
              {/* Returned Alert Banner */}
              {selectedPRDetail.status === 'RETURNED' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-amber-700 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs">
                        เอกสารถูกส่งกลับเพื่อแก้ไข (Return for Revision)
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        ส่งกลับโดย: <strong>{selectedPRDetail.returnedBy || 'ผู้อนุมัติ'}</strong> เมื่อ{' '}
                        {selectedPRDetail.returnedAt
                          ? new Date(selectedPRDetail.returnedAt).toLocaleString('th-TH')
                          : '-'}
                      </p>
                      <p className="text-xs text-amber-950 font-medium mt-1 bg-amber-100/70 p-2 rounded-lg border border-amber-200">
                        เหตุผล: {selectedPRDetail.returnReason || 'โปรดตรวจสอบและแก้ไขข้อมูล'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenReviseModal(selectedPRDetail);
                    }}
                    className="px-3.5 py-1.5 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shrink-0"
                  >
                    แก้ไขและส่งใหม่
                  </button>
                </div>
              )}

              {/* 4 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4.5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>ยอดเงินประเมินรวม</span>
                    <DollarSign className="w-4 h-4 text-[#F28C28]" />
                  </div>
                  <div className="text-2xl font-bold text-[#14213D] tabular-nums">
                    ฿{selectedPRDetail.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedPRDetail.lines?.length || 0} รายการสินค้า
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>แผนจัดซื้ออ้างอิง (PP)</span>
                    <PieChart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="font-bold text-sm text-[#14213D] truncate">
                    {selectedPRDetail.isUnplanned
                      ? 'จัดซื้อเร่งด่วนนอกแผน'
                      : selectedPRDetail.planNumber || selectedPRDetail.plan?.planNumber || 'ไม่ระบุแผน'}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-800 font-bold truncate">
                    {selectedPRDetail.allocationId || selectedPRDetail.plan?.allocationId || 'ALC-2569-001'} ·{' '}
                    {selectedPRDetail.budgetCode || selectedPRDetail.plan?.budgetCode || 'BG-69-PHARM-01'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {selectedPRDetail.departmentName || selectedPRDetail.department?.name || 'กลุ่มงานเภสัชกรรม (Pharmacy)'}
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>ผู้ขอซื้อ & แผนก</span>
                    <User className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-bold text-sm text-[#14213D] truncate">
                    {selectedPRDetail.requesterName}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    แผนก: {selectedPRDetail.department?.name || 'ไม่ระบุ'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ขอเมื่อ: {new Date(selectedPRDetail.requestDate).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>สถานะการอนุมัติ</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-bold text-sm text-[#14213D]">
                    {selectedPRDetail.approvedBy || (selectedPRDetail.status === 'RETURNED' ? 'ส่งกลับแก้ไข' : 'รอการอนุมัติ')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedPRDetail.approvedAt
                      ? `อนุมัติ: ${new Date(selectedPRDetail.approvedAt).toLocaleDateString('th-TH')}`
                      : selectedPRDetail.status}
                  </div>
                  {selectedPRDetail.purchaseOrders && selectedPRDetail.purchaseOrders.length > 0 && (
                    <div className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 pt-0.5">
                      <span>PO: {selectedPRDetail.purchaseOrders.map((p: any) => p.poNumber).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Justification & Attachments */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#14213D] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#F28C28]" />
                    <span>วัตถุประสงค์และเหตุผลความจำเป็นในการขอซื้อ</span>
                  </div>
                  {selectedPRDetail.attachmentName && (
                    <div className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{selectedPRDetail.attachmentName}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-700 bg-[#F5F8FC] p-3.5 rounded-xl border border-[#E2EAF4] leading-relaxed">
                  {selectedPRDetail.justification || 'ขอจัดซื้อตามรอบปกติเพื่อสำรองใช้งานในโรงพยาบาล'}
                </div>

                {selectedPRDetail.isUnplanned && selectedPRDetail.unplannedReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <span className="font-bold">เหตุผลความจำเป็นนอกแผนงบประมาณ: </span>
                    <span>{selectedPRDetail.unplannedReason}</span>
                  </div>
                )}

                {selectedPRDetail.status === 'REJECTED' && selectedPRDetail.rejectReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <span className="font-bold">เหตุผลที่ไม่อนุมัติ: </span>
                    <span>{selectedPRDetail.rejectReason}</span>
                  </div>
                )}

                {selectedPRDetail.status === 'APPROVED' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                    <span>
                      🔒 คำขอซื้อนี้ได้รับการอนุมัติแล้ว ตามระเบียบจัดซื้อจะไม่สามารถแก้ไขรายการโดยตรงได้ (หากจำเป็นต้องเปลี่ยน ให้ทำบันทึกยกเลิก)
                    </span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#F28C28]" />
                    <h3 className="font-bold text-xs text-[#14213D] uppercase tracking-wider">
                      รายการพัสดุและเวชภัณฑ์ที่ขอซื้อ ({selectedPRDetail.lines?.length || 0} รายการ)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    กำหนดส่งมอบ: {selectedPRDetail.requiredDate ? new Date(selectedPRDetail.requiredDate).toLocaleDateString('th-TH') : 'ตามรอบปกติ'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F5F8FC] text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-3 text-center w-10">#</th>
                        <th className="py-3 px-4">รหัส / รายการสินค้า</th>
                        <th className="py-3 px-3">คุณสมบัติเฉพาะ (Specification)</th>
                        <th className="py-3 px-3 text-center">หน่วย</th>
                        <th className="py-3 px-3 text-right">จำนวนขอซื้อ</th>
                        <th className="py-3 px-3 text-right">จำนวนอนุมัติ</th>
                        <th className="py-3 px-3 text-right text-purple-700">สั่งแล้ว (PO)</th>
                        <th className="py-3 px-3 text-right">ราคาประเมิน</th>
                        <th className="py-3 px-4 text-right">มูลค่ารวม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPRDetail.lines?.map((line: any, idx: number) => {
                        return (
                          <tr key={line.id} className="hover:bg-[#F5F8FC] transition-colors">
                            <td className="py-3 px-3 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#14213D]">{line.item?.itemName}</div>
                              <div className="text-[11px] font-mono text-[#D97706]">{line.item?.itemCode}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-600 max-w-xs">
                              {line.specification || line.item?.description || '-'}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-600">
                              {line.item?.unit || 'ชิ้น'}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">
                              {line.requestedQty?.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">
                              {line.approvedQty > 0 ? line.approvedQty.toLocaleString() : line.requestedQty?.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-purple-700 tabular-nums">
                              {line.orderedQty?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                              ฿{line.estimatedUnitPrice?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-[#14213D] tabular-nums">
                              ฿{line.estimatedTotal?.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-[#F5F8FC] border-t border-[#E2EAF4]">
                      <tr>
                        <td colSpan={8} className="py-3 px-4 text-right font-bold text-slate-700">
                          ยอดรวมทั้งสิ้น (Grand Total):
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-[#D97706] text-sm tabular-nums">
                          ฿{selectedPRDetail.totalAmount.toLocaleString()} บาท
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="text-xs text-slate-500">
                <span>จำนวน: <strong>{selectedPRDetail.lines?.length || 0}</strong> รายการ | </span>
                <span>ยอดเงินรวม: <strong className="font-mono text-[#D97706] text-sm font-bold">฿{selectedPRDetail.totalAmount.toLocaleString()} บาท</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 border rounded-xl hover:bg-[#F5F8FC] text-xs font-semibold text-slate-700"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Prompt for Return / Reject Reason */}
      {showActionReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-[#14213D] flex items-center gap-2">
              {actionType === 'RETURN' ? (
                <>
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span>ส่งกลับคำขอซื้อเพื่อแก้ไข (Return for Revision)</span>
                </>
              ) : (
                <>
                  <Ban className="w-5 h-5 text-rose-600" />
                  <span>ไม่อนุมัติคำขอซื้อ (Reject PR)</span>
                </>
              )}
            </h3>

            <p className="text-xs text-slate-600">
              {actionType === 'RETURN'
                ? 'โปรดระบุจุดที่ต้องการให้ผู้ขอดำเนินการแก้ไข เช่น ปรับลดจำนวน, แก้ไขรายละเอียดคุณสมบัติ หรือปรับงบประมาณ'
                : 'โปรดระบุเหตุผลที่ไม่อนุมัติคำขอซื้อนี้ เพื่อบันทึกในประวัติการตรวจสอบ'}
            </p>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">
                เหตุผลความจำเป็น *
              </label>
              <textarea
                rows={3}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="ระบุเหตุผล..."
                className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowActionReasonModal(false)}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50 text-xs font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSubmitActionWithReason}
                className={`px-4 py-2 text-white font-semibold rounded-xl text-xs ${
                  actionType === 'RETURN'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                ยืนยัน{actionType === 'RETURN' ? 'ส่งกลับแก้ไข' : 'ไม่อนุมัติ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit and Resubmit (Revision for RETURNED PR) */}
      {showReviseModal && selectedPRDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-4xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#14213D] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#F28C28]" />
                  <span>แก้ไขข้อมูลและส่งอนุมัติใหม่ ({selectedPRDetail.prNumber})</span>
                </h3>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  เหตุผลส่งกลับ: {selectedPRDetail.returnReason || 'โปรดแก้ไขตามข้อสังเกตของผู้อนุมัติ'}
                </p>
              </div>
              <button
                onClick={() => setShowReviseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAndResubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">แผนกที่ขอซื้อ</label>
                  <select
                    value={revisionDepartmentId}
                    onChange={(e) => setRevisionDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ความเร่งด่วน</label>
                  <select
                    value={revisionUrgency}
                    onChange={(e) => setRevisionUrgency(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC]"
                  >
                    <option value="NORMAL">ปกติ</option>
                    <option value="URGENT">ด่วน</option>
                    <option value="EMERGENCY">ฉุกเฉิน</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่ต้องการ</label>
                  <input
                    type="date"
                    value={revisionRequiredDate}
                    onChange={(e) => setRevisionRequiredDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-2">แก้ไขรายการพัสดุและราคา</label>
                <div className="space-y-2 border p-2 rounded-xl bg-[#F5F8FC] max-h-56 overflow-y-auto">
                  {revisionLines.map((line, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 w-5">{idx + 1}.</span>
                        <select
                          value={line.itemId}
                          onChange={(e) => handleReviseLineChange(idx, 'itemId', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs"
                        >
                          {items.map((it) => (
                            <option key={it.id} value={it.id}>
                              [{it.itemCode}] {it.itemName} ({it.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="จำนวน"
                          value={line.requestedQty}
                          onChange={(e) => handleReviseLineChange(idx, 'requestedQty', Number(e.target.value))}
                          className="w-24 px-2 py-1.5 border rounded-lg text-right"
                        />
                        <input
                          type="number"
                          placeholder="ราคา"
                          value={line.estimatedUnitPrice}
                          onChange={(e) => handleReviseLineChange(idx, 'estimatedUnitPrice', Number(e.target.value))}
                          className="w-28 px-2 py-1.5 border rounded-lg text-right"
                        />
                        <div className="w-28 text-right font-bold text-slate-800">
                          ฿{((line.requestedQty || 0) * (line.estimatedUnitPrice || 0)).toLocaleString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pl-7">
                        <input
                          type="text"
                          placeholder="คุณสมบัติ (Specification)..."
                          value={line.specification}
                          onChange={(e) => handleReviseLineChange(idx, 'specification', e.target.value)}
                          className="px-2 py-1 border rounded text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="หมายเหตุ..."
                          value={line.remark}
                          onChange={(e) => handleReviseLineChange(idx, 'remark', e.target.value)}
                          className="px-2 py-1 border rounded text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เหตุผลความจำเป็นเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={revisionJustification}
                  onChange={(e) => setRevisionJustification(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowReviseModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white font-semibold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>บันทึกและส่งอนุมัติใหม่ (Resubmit)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcurementRequisitionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลดใบขอซื้อ...</div>}>
      <RequisitionsContent />
    </Suspense>
  );
}
