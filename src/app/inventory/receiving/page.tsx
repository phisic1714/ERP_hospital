'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ArrowDownToLine,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  FileText,
  ShieldCheck,
  RefreshCw,
  Eye,
  Copy,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Save,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

function GoodsReceivingContent() {
  const searchParams = useSearchParams();
  const queryPoNumber = searchParams.get('poNumber');
  const hasHandledQueryPo = useRef(false);

  const { currentUser, addToast, refreshKey, triggerRefresh } = useApp();
  const [grList, setGrList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Status Filter Tabs
  type StatusTab = 'ALL' | 'PENDING' | 'DRAFT' | 'POSTED';
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState<any | null>(null);
  const [approvedPOs, setApprovedPOs] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Create form state
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('ตรวจรับเรียบร้อย บรรจุภัณฑ์สมบูรณ์ น้ำยาไม่ขุ่น ผ่านการตรวจ Lot และวันหมดอายุ');
  const [linesData, setLinesData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable Inspect Modal State (for DRAFT GR)
  const [inspectLines, setInspectLines] = useState<any[]>([]);
  const [inspectNotes, setInspectNotes] = useState('');
  const [isUpdatingInspect, setIsUpdatingInspect] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch('/api/receiving')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGrList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();

    // Fetch approved & partially received POs
    fetch('/api/pos?status=APPROVED')
      .then((r) => r.json())
      .then((pos) => {
        fetch('/api/pos?status=PARTIALLY_RECEIVED')
          .then((r2) => r2.json())
          .then((p2) => {
            const allAvailable = [...(Array.isArray(pos) ? pos : []), ...(Array.isArray(p2) ? p2 : [])];
            setApprovedPOs(allAvailable);
          });
      })
      .catch(console.error);

    fetch('/api/warehouses')
      .then((r) => r.json())
      .then((whs) => {
        if (Array.isArray(whs)) {
          setWarehouses(whs);
          if (whs.length > 0) setSelectedWarehouseId(whs[0].id);
        }
      })
      .catch(console.error);
  }, [refreshKey]);

  // Handle PO query parameter auto-selection
  useEffect(() => {
    if (queryPoNumber && !hasHandledQueryPo.current) {
      // 1. If an active draft GR already exists for this PO, open inspect modal directly
      if (grList.length > 0) {
        const existingGr = grList.find(
          (g) => g.poNumber?.toLowerCase() === queryPoNumber.toLowerCase() && g.status !== 'POSTED'
        );
        if (existingGr) {
          hasHandledQueryPo.current = true;
          openInspectModal(existingGr);
          addToast('info', `ตรวจพบใบรับสินค้า ${existingGr.grNumber} สำหรับ ${existingGr.poNumber}: เปิดหน้าบันทึกตรวจรับแล้ว`);
          return;
        }
      }

      // 2. Otherwise open create form pre-filled with this PO
      if (approvedPOs.length > 0) {
        const matched = approvedPOs.find(
          (p) => p.poNumber?.toLowerCase() === queryPoNumber.toLowerCase()
        );
        if (matched) {
          hasHandledQueryPo.current = true;
          handleSelectPO(matched.id, matched);
          setShowCreateModal(true);
          addToast('info', `ตรวจพบใบสั่งซื้อ ${matched.poNumber}: ดึงรายการเวชภัณฑ์เข้าสู่ฟอร์มตรวจรับแล้ว`);
        } else {
          // Fallback: fetch directly from api/pos
          fetch('/api/pos')
            .then((r) => r.json())
            .then((all) => {
              if (Array.isArray(all)) {
                const m = all.find((p: any) => p.poNumber?.toLowerCase() === queryPoNumber.toLowerCase());
                if (m) {
                  hasHandledQueryPo.current = true;
                  setApprovedPOs((prev) => [m, ...prev.filter((x) => x.id !== m.id)]);
                  handleSelectPO(m.id, m);
                  setShowCreateModal(true);
                  addToast('info', `ตรวจพบใบสั่งซื้อ ${m.poNumber}: ดึงรายการเวชภัณฑ์เข้าสู่ฟอร์มตรวจรับแล้ว`);
                }
              }
            })
            .catch(console.error);
        }
      }
    }
  }, [queryPoNumber, approvedPOs, grList]);

  // Handle PO selection in Create Modal
  const handleSelectPO = (poId: string, poObj?: any) => {
    const po = poObj || approvedPOs.find((p) => p.id === poId);
    setSelectedPO(po || null);
    if (po && po.lines) {
      const defaultExp = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      setLinesData(
        po.lines.map((l: any, idx: number) => {
          const remQty = l.remainingQty ?? (l.orderedQty - (l.receivedQty || 0));
          const cleanCode = (l.item?.itemCode || 'MED').replace(/[^a-zA-Z0-9]/g, '').slice(-3);
          const autoLot = `LOT-${cleanCode}-${Date.now().toString().slice(-4)}${idx + 1}`;

          return {
            poLineId: l.id,
            itemId: l.itemId,
            itemName: l.item?.itemName || l.itemName || 'รายการเวชภัณฑ์',
            itemCode: l.item?.itemCode || l.itemCode || 'MED',
            unit: l.item?.unit || l.unit || 'ชิ้น',
            orderedQty: l.orderedQty || 0,
            previouslyReceived: l.receivedQty || 0,
            remainingQty: remQty,
            receivedQty: remQty, // ยอดส่งมอบตรวจจริง
            acceptedQty: remQty, // ยอดผ่าน
            quarantineQty: 0,    // ยอดกักกัน
            rejectedQty: 0,      // ยอดปฏิเสธคืน
            lotNumber: autoLot,
            expiryDate: defaultExp,
            unitPrice: l.unitPrice || 0,
            remark: '',
          };
        })
      );
    } else {
      setLinesData([]);
    }
  };

  // Update line in Create Modal
  const updateCreateLine = (index: number, field: string, value: any) => {
    setLinesData((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'receivedQty') {
        const rec = Math.max(0, parseFloat(value) || 0);
        item.receivedQty = rec;
        item.acceptedQty = Math.max(0, rec - (item.quarantineQty || 0) - (item.rejectedQty || 0));
      } else if (field === 'acceptedQty') {
        item.acceptedQty = Math.max(0, parseFloat(value) || 0);
      } else if (field === 'quarantineQty') {
        const quar = Math.max(0, parseFloat(value) || 0);
        item.quarantineQty = quar;
        item.acceptedQty = Math.max(0, (item.receivedQty || 0) - quar - (item.rejectedQty || 0));
      } else if (field === 'rejectedQty') {
        const rej = Math.max(0, parseFloat(value) || 0);
        item.rejectedQty = rej;
        item.acceptedQty = Math.max(0, (item.receivedQty || 0) - (item.quarantineQty || 0) - rej);
      } else {
        (item as any)[field] = value;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Batch auto-generate lots in Create Modal
  const autoGenerateLotsInCreate = () => {
    const defaultExp = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    setLinesData((prev) =>
      prev.map((line, idx) => {
        const cleanCode = (line.itemCode || 'MED').replace(/[^a-zA-Z0-9]/g, '').slice(-3);
        return {
          ...line,
          lotNumber: `LOT-${cleanCode}-${Date.now().toString().slice(-4)}${idx + 1}`,
          expiryDate: line.expiryDate || defaultExp,
        };
      })
    );
    addToast('info', 'สร้างรหัส Lot และวันที่หมดอายุอัตโนมัติเรียบร้อยแล้ว');
  };

  // Submit Create GR (Draft or Post Directly)
  const handleCreateGR = async (postImmediately: boolean = false) => {
    if (!selectedPO) {
      addToast('error', 'กรุณาเลือกใบสั่งซื้อ (PO)');
      return;
    }
    if (!selectedWarehouseId) {
      addToast('error', 'กรุณาเลือกคลังรับสินค้า');
      return;
    }
    if (!linesData || linesData.length === 0) {
      addToast('error', 'ไม่พบรายการสินค้าในใบสั่งซื้อนี้');
      return;
    }

    // Validation
    for (const l of linesData) {
      if (!l.lotNumber?.trim()) {
        addToast('error', `กรุณาระบุ Lot Number สำหรับรายการ: ${l.itemName}`);
        return;
      }
      if (!l.expiryDate) {
        addToast('error', `กรุณาระบุวันหมดอายุสำหรับรายการ: ${l.itemName}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        poId: selectedPO.id,
        poNumber: selectedPO.poNumber,
        supplierId: selectedPO.supplierId,
        warehouseId: selectedWarehouseId,
        receivingDate: new Date(),
        inspectionNotes,
        userName: currentUser.name,
        lines: linesData,
      };

      const res = await fetch('/api/receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create GR');

      if (postImmediately) {
        // Direct Post to stock
        const postRes = await fetch(`/api/receiving/${result.id}/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: currentUser.name,
            inspectionNotes,
            lines: linesData,
          }),
        });
        const postResult = await postRes.json();
        if (!postRes.ok) throw new Error(postResult.error || 'Failed to post GR');

        addToast(
          'success',
          `ตรวจรับและบันทึกเข้าคลังสินค้าเลขที่ ${result.grNumber} เรียบร้อยแล้ว (อัปเดตสต็อกคงคลังแล้ว)`
        );
      } else {
        addToast('success', `สร้างใบรับสินค้าเลขที่ ${result.grNumber} เรียบร้อยแล้ว (สถานะร่าง รอตรวจรับ)`);
      }

      setShowCreateModal(false);
      setSelectedPO(null);
      setLinesData([]);
      loadData();
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Inspect / Edit Modal
  const openInspectModal = (gr: any) => {
    setShowInspectModal(gr);
    setInspectNotes(gr.inspectionNotes || '');
    setInspectLines(
      (gr.lines || []).map((l: any, idx: number) => {
        const item = l.item || {};
        const defaultExp = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
        const expStr = l.expiryDate ? new Date(l.expiryDate).toISOString().slice(0, 10) : defaultExp;
        const cleanCode = (item.itemCode || 'MED').replace(/[^a-zA-Z0-9]/g, '').slice(-3);

        return {
          id: l.id,
          itemId: l.itemId,
          itemCode: item.itemCode || '-',
          itemName: item.itemName || 'รายการเวชภัณฑ์',
          genericName: item.genericName || '',
          unit: item.unit || 'ชิ้น',
          orderedQty: l.orderedQty || 0,
          remainingQty: l.remainingQty || 0,
          receivedQty: l.receivedQty ?? (l.acceptedQty + (l.quarantineQty || 0) + (l.rejectedQty || 0)),
          acceptedQty: l.acceptedQty ?? 0,
          quarantineQty: l.quarantineQty ?? 0,
          rejectedQty: l.rejectedQty ?? 0,
          lotNumber: l.lotNumber || `LOT-${cleanCode}-${Date.now().toString().slice(-4)}${idx + 1}`,
          expiryDate: expStr,
          remark: l.remark || '',
        };
      })
    );
  };

  // Update line in Inspect Modal (Draft mode)
  const updateInspectLine = (index: number, field: string, value: any) => {
    setInspectLines((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'receivedQty') {
        const rec = Math.max(0, parseFloat(value) || 0);
        item.receivedQty = rec;
        item.acceptedQty = Math.max(0, rec - (item.quarantineQty || 0) - (item.rejectedQty || 0));
      } else if (field === 'acceptedQty') {
        item.acceptedQty = Math.max(0, parseFloat(value) || 0);
      } else if (field === 'quarantineQty') {
        const quar = Math.max(0, parseFloat(value) || 0);
        item.quarantineQty = quar;
        item.acceptedQty = Math.max(0, (item.receivedQty || 0) - quar - (item.rejectedQty || 0));
      } else if (field === 'rejectedQty') {
        const rej = Math.max(0, parseFloat(value) || 0);
        item.rejectedQty = rej;
        item.acceptedQty = Math.max(0, (item.receivedQty || 0) - (item.quarantineQty || 0) - rej);
      } else {
        (item as any)[field] = value;
      }

      updated[index] = item;
      return updated;
    });
  };

  // Save Draft Changes in Inspect Modal
  const handleSaveDraftChanges = async () => {
    if (!showInspectModal) return;
    setIsUpdatingInspect(true);

    try {
      const res = await fetch(`/api/receiving/${showInspectModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionNotes: inspectNotes,
          lines: inspectLines,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save changes');

      addToast('success', 'บันทึกผลการตรวจรับแบบร่างเรียบร้อยแล้ว');
      setShowInspectModal(result);
      loadData();
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setIsUpdatingInspect(false);
    }
  };

  // Confirm Inspection & Post to Stock
  const handleConfirmAndPost = async (grId: string) => {
    // Validate lines
    for (const l of inspectLines) {
      if (!l.lotNumber?.trim()) {
        addToast('error', `กรุณาระบุ Lot Number สำหรับรายการ ${l.itemName}`);
        return;
      }
      if (!l.expiryDate) {
        addToast('error', `กรุณาระบุวันหมดอายุสำหรับรายการ ${l.itemName}`);
        return;
      }
    }

    if (
      !confirm(
        'ยืนยันผลการตรวจรับพัสดุและตัดยอดเข้าคลังสินค้าจริง?\n\nเมื่อยืนยันแล้ว:\n1. ยอด Accepted จะถูกสร้างเป็น Lot ในคลังและพร้อมเบิกจ่าย (On Hand & Available)\n2. ยอด Quarantine จะถูกกักแยกไว้ในคลัง\n3. ระบบจะบันทึกประวัติความเคลื่อนไหว (Stock Movement) ทันที'
      )
    ) {
      return;
    }

    setIsUpdatingInspect(true);
    try {
      const res = await fetch(`/api/receiving/${grId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: currentUser.name,
          inspectionNotes: inspectNotes,
          lines: inspectLines,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to post GR');

      addToast('success', `บันทึกรับเข้าคลังเรียบร้อย ยอดสต็อกได้รับการอัปเดตและบันทึก Stock Movement แล้ว`);
      setShowInspectModal(null);
      loadData();
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setIsUpdatingInspect(false);
    }
  };

  // Live calculation for Inspect Modal
  const currentInspectAccepted = inspectLines.reduce((s, l) => s + (parseFloat(l.acceptedQty) || 0), 0);
  const currentInspectQuarantine = inspectLines.reduce((s, l) => s + (parseFloat(l.quarantineQty) || 0), 0);
  const currentInspectRejected = inspectLines.reduce((s, l) => s + (parseFloat(l.rejectedQty) || 0), 0);
  const currentInspectReceived = inspectLines.reduce((s, l) => s + (parseFloat(l.receivedQty) || 0), 0);

  // Live calculation for Create Modal
  const currentCreateAccepted = linesData.reduce((s, l) => s + (parseFloat(l.acceptedQty) || 0), 0);
  const currentCreateQuarantine = linesData.reduce((s, l) => s + (parseFloat(l.quarantineQty) || 0), 0);
  const currentCreateRejected = linesData.reduce((s, l) => s + (parseFloat(l.rejectedQty) || 0), 0);
  const currentCreateReceived = linesData.reduce((s, l) => s + (parseFloat(l.receivedQty) || 0), 0);

  // Counts for status tabs
  const countAll = grList.length;
  const countPending = grList.filter((gr) => gr.status === 'DRAFT').length;
  const countDraft = grList.filter((gr) => gr.status === 'DRAFT').length;
  const countPosted = grList.filter((gr) => gr.status === 'POSTED').length;

  const filteredGrList = grList.filter((gr) => {
    // Status Tab filtering
    if (activeTab === 'PENDING' && gr.status !== 'DRAFT') return false;
    if (activeTab === 'DRAFT' && gr.status !== 'DRAFT') return false;
    if (activeTab === 'POSTED' && gr.status !== 'POSTED') return false;

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      gr.grNumber?.toLowerCase().includes(q) ||
      gr.poNumber?.toLowerCase().includes(q) ||
      gr.supplier?.name?.toLowerCase().includes(q) ||
      gr.warehouse?.name?.toLowerCase().includes(q)
    );
  });

  const totalGr = filteredGrList.length;
  const totalPages = Math.max(1, Math.ceil(totalGr / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGrList = filteredGrList.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
            ระบบรับสินค้าเข้าคลัง (Goods Receiving - GR)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            ดึงข้อมูลจาก PO ที่อนุมัติ ➔ ตรวจรับจริง ➔ บันทึก Lot/วันหมดอายุ ➔ รับเข้าพร้อมใช้เฉพาะยอดที่ผ่านการตรวจรับ (Accepted)
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPO(null);
            setLinesData([]);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ สร้างใบรับสินค้าใหม่</span>
        </button>
      </div>

      {/* Main Table Card with Integrated Tabs & Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        {/* Status Filter Tabs (แถบแยกสถานะ: ทั้งหมด / รอรับ / ฉบับร่าง / บันทึกสำเร็จ) */}
        <div className="px-4 sm:px-5 pt-3 pb-0 border-b border-[#E2EAF4] flex items-center gap-1 sm:gap-2 overflow-x-auto bg-[#F8FAFC]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALL');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-xl'
                : 'border-transparent text-[#64748B] hover:text-[#14213D]'
            }`}
          >
            <span>ทั้งหมด (All)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'ALL'
                  ? 'bg-blue-100 text-[#2563EB]'
                  : 'bg-slate-200/80 text-[#64748B]'
              }`}
            >
              {countAll}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('PENDING');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'PENDING'
                ? 'border-amber-500 text-amber-800 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-[#64748B] hover:text-amber-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>รอรับ / รอตรวจรับ</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200/80 text-[#64748B]'
              }`}
            >
              {countPending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('DRAFT');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'DRAFT'
                ? 'border-slate-700 text-slate-800 bg-white rounded-t-xl'
                : 'border-transparent text-[#64748B] hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>ฉบับร่าง (Draft)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'DRAFT'
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-slate-200/80 text-[#64748B]'
              }`}
            >
              {countDraft}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('POSTED');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
              activeTab === 'POSTED'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-[#64748B] hover:text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>บันทึกสำเร็จ (Posted)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'POSTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200/80 text-[#64748B]'
              }`}
            >
              {countPosted}
            </span>
          </button>
        </div>

        {/* PO Quick Reception Banner (แสดงเมื่อดูแท็บ รอรับ หรือ ทั้งหมด หากมี PO รอรับ) */}
        {(activeTab === 'PENDING' || activeTab === 'ALL') && approvedPOs.length > 0 && (
          <div className="mx-4 sm:mx-5 mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#14213D] flex items-center gap-2">
                  <span>มีใบสั่งซื้อ (PO) ที่อนุมัติแล้ว พร้อมให้คลังตรวจรับเข้าพัสดุ</span>
                  <span className="bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {approvedPOs.length} ใบสั่งซื้อ
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-0.5">
                  คลิกเลือก PO ด้านขวาเพื่อเปิดหน้าต่างบันทึกผลตรวจรับและกรอก Lot สินค้าได้ทันที
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectPO(e.target.value);
                    setShowCreateModal(true);
                    e.target.value = '';
                  }
                }}
                className="w-full sm:w-64 text-xs px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-semibold text-[#14213D] shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-200"
                defaultValue=""
              >
                <option value="" disabled>
                  -- เลือก PO เพื่อกดรับสินค้าทันที --
                </option>
                {approvedPOs.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} ({po.supplier?.name}) - {po.lines?.length || 0} รายการ
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E2EAF4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-[#14213D]">
              {activeTab === 'ALL'
                ? 'รายการใบตรวจรับสินค้าทั้งหมด'
                : activeTab === 'PENDING'
                ? 'รายการรอรับ / รอตรวจรับพัสดุ (กดที่รายการเพื่อเปิดบันทึกผล)'
                : activeTab === 'DRAFT'
                ? 'รายการฉบับร่าง (Draft) รอตรวจรับ'
                : 'รายการตรวจรับเข้าคลังเรียบร้อย (Posted)'}
            </h2>
            <span className="text-xs bg-slate-100 text-[#475569] px-2.5 py-0.5 rounded-full font-semibold">
              {totalGr} รายการ
            </span>
          </div>

          <div className="relative w-full sm:w-72 lg:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ใบรับ, เลขที่ PO, ผู้จัดจำหน่าย..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-[#14213D] placeholder-[#94A3B8] transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] text-[#334155] border-b border-[#E2EAF4] uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ใบรับ (GR NO.)</th>
                <th className="py-3 px-3">อ้างอิง PO</th>
                <th className="py-3 px-3">ผู้จัดจำหน่าย (SUPPLIER)</th>
                <th className="py-3 px-3">คลังรับสินค้า</th>
                <th className="py-3 px-3 text-right">ยอดรับผ่าน (ACCEPTED)</th>
                <th className="py-3 px-3 text-right">กักกัน (QUARANTINE)</th>
                <th className="py-3 px-3">วันที่รับ</th>
                <th className="py-3 px-3">ผู้บันทึก</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
                    กำลังดึงข้อมูลใบรับสินค้า...
                  </td>
                </tr>
              ) : paginatedGrList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#94A3B8]">
                    {activeTab === 'PENDING'
                      ? 'ไม่มีรายการที่ค้างรอตรวจรับ'
                      : activeTab === 'DRAFT'
                      ? 'ไม่มีรายการฉบับร่าง'
                      : activeTab === 'POSTED'
                      ? 'ยังไม่มีรายการที่บันทึกสำเร็จ'
                      : 'ยังไม่มีรายการรับสินค้าในระบบ'}
                  </td>
                </tr>
              ) : (
                paginatedGrList.map((gr) => {
                  const acceptedVal =
                    gr.totalAccepted ||
                    (gr.lines
                      ? gr.lines.reduce((s: number, l: any) => s + (l.acceptedQty || 0), 0)
                      : 0);
                  const quarantineVal =
                    gr.totalQuarantine ||
                    (gr.lines
                      ? gr.lines.reduce((s: number, l: any) => s + (l.quarantineQty || 0), 0)
                      : 0);

                  return (
                    <tr
                      key={gr.id}
                      onClick={() => openInspectModal(gr)}
                      className="hover:bg-[#F5F8FC] transition-colors cursor-pointer group"
                      title={gr.status === 'DRAFT' ? 'คลิกเพื่อเปิดหน้าต่างตรวจรับและบันทึกผล Lot' : 'คลิกเพื่อดูรายละเอียด'}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                        <span className="group-hover:underline">{gr.grNumber}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#64748B]">
                        {gr.poNumber ? (
                          <span className="bg-slate-100 text-[#334155] px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            {gr.poNumber}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#14213D]">
                        {gr.supplier?.name || '-'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#334155]">
                        {gr.warehouse?.name || '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 tabular-nums">
                        {acceptedVal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-purple-600 tabular-nums">
                        {quarantineVal > 0 ? quarantineVal.toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[#64748B]">
                        {new Date(gr.receivingDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3 px-3 text-[#64748B]">
                        {gr.createdBy || 'เจ้าหน้าที่คลัง'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={gr.status} />
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {gr.status === 'DRAFT' ? (
                          <button
                            onClick={() => openInspectModal(gr)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 mx-auto"
                            title="กรอกเลข Lot และผลการตรวจรับจริง"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>ตรวจรับ / บันทึก Lot</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openInspectModal(gr)}
                            className="px-3 py-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#2563EB] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-blue-200 shadow-2xs mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ดูข้อมูล</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E2EAF4] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div>
            แสดง{' '}
            <span className="font-semibold text-[#14213D]">
              {totalGr === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, totalGr)}
            </span>{' '}
            จาก{' '}
            <span className="font-semibold text-[#14213D]">{totalGr.toLocaleString()}</span>{' '}
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

      {/* Modal 1: Create GR from Approved PO (With Interactive Inspection & Lot Breakdown) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] max-w-5xl w-full p-5 sm:p-6 animate-scale-up space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#14213D]">
                    บันทึกตรวจรับสินค้าเข้าคลังใหม่ (Goods Receiving Entry)
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    ดึงรายการจากใบสั่งซื้อ PO ➔ บันทึก Lot และวันหมดอายุจริง ➔ ตรวจรับเข้าคลัง
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#14213D] text-lg font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Select PO & Warehouse Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2EAF4]">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    เลือกใบสั่งซื้อที่อนุมัติแล้ว (Approved PO) *
                  </label>
                  <select
                    value={selectedPO?.id || ''}
                    onChange={(e) => handleSelectPO(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-[#14213D] font-semibold"
                  >
                    <option value="">-- เลือกใบสั่งซื้อ (PO) --</option>
                    {approvedPOs.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} - {po.supplier?.name} (ยอด ฿{po.totalAmount?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">
                    คลังสินค้าปลายทางที่รับเข้า *
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-[#14213D]"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected PO Summary Info */}
              {selectedPO && (
                <div className="bg-emerald-50/50 border border-emerald-200/80 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">ผู้จัดจำหน่าย: </span>
                    <span className="font-semibold text-[#14213D]">{selectedPO.supplier?.name}</span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="font-bold text-emerald-900">เลขที่ PO: </span>
                    <span className="font-mono font-semibold text-[#2563EB]">{selectedPO.poNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={autoGenerateLotsInCreate}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100/70 border border-emerald-200 text-emerald-700 font-semibold rounded-lg text-[11px] shadow-2xs flex items-center gap-1 transition-colors"
                      title="สุ่มเลข Lot และตั้งวันหมดอายุมาตรฐาน"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>สร้าง Lot อัตโนมัติ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Live Metric Strip for Create Modal */}
              {linesData.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-[#F8FAFC] border border-[#E2EAF4] p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-[#64748B] font-medium">ยอดส่งมอบตรวจจริง</div>
                    <div className="text-base font-bold text-[#14213D] tabular-nums mt-0.5">
                      {currentCreateReceived.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-emerald-700 font-medium">ตรวจผ่าน (Accepted)</div>
                    <div className="text-base font-bold text-emerald-700 tabular-nums mt-0.5">
                      {currentCreateAccepted.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50/70 border border-purple-200 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-purple-700 font-medium">กักกัน (Quarantine)</div>
                    <div className="text-base font-bold text-purple-700 tabular-nums mt-0.5">
                      {currentCreateQuarantine.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-rose-50/70 border border-rose-200 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] text-rose-700 font-medium">ปฏิเสธคืน (Rejected)</div>
                    <div className="text-base font-bold text-rose-700 tabular-nums mt-0.5">
                      {currentCreateRejected.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Items from selected PO */}
              {linesData.length > 0 ? (
                <div className="border border-[#E2EAF4] rounded-2xl overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2EAF4] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#14213D] flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-600" />
                      รายการเวชภัณฑ์และผลการตรวจรับราย Lot ({linesData.length} รายการ)
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      กรอก Lot Number และ วันหมดอายุ จากบรรจุภัณฑ์จริง
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F8FAFC] text-[#475569] border-b border-[#E2EAF4] font-bold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">รหัส/ชื่อสินค้า</th>
                          <th className="py-2.5 px-2 text-center">หน่วย</th>
                          <th className="py-2.5 px-2 text-right">สั่งซื้อ/ค้าง</th>
                          <th className="py-2.5 px-2 text-center">ส่งตรวจจริง</th>
                          <th className="py-2.5 px-2 text-center text-emerald-700">ผ่าน</th>
                          <th className="py-2.5 px-2 text-center text-purple-700">กักกัน</th>
                          <th className="py-2.5 px-2 text-center text-rose-700">ปฏิเสธ</th>
                          <th className="py-2.5 px-2">Lot Number *</th>
                          <th className="py-2.5 px-2">วันหมดอายุ *</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {linesData.map((line, idx) => (
                          <tr key={idx} className="hover:bg-[#F5F8FC]">
                            <td className="py-2 px-3 min-w-[180px]">
                              <div className="font-semibold text-[#14213D]">{line.itemName}</div>
                              <div className="text-[10px] text-[#2563EB] font-mono">{line.itemCode}</div>
                            </td>
                            <td className="py-2 px-2 text-center text-[#64748B]">
                              {line.unit}
                            </td>
                            <td className="py-2 px-2 text-right tabular-nums whitespace-nowrap">
                              <span className="text-[#64748B]">{line.orderedQty}</span>
                              <span className="text-[#94A3B8]"> / </span>
                              <span className="font-bold text-[#2563EB]">{line.remainingQty}</span>
                            </td>
                            {/* Received Qty */}
                            <td className="py-2 px-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max={line.remainingQty * 2}
                                value={line.receivedQty}
                                onChange={(e) => updateCreateLine(idx, 'receivedQty', e.target.value)}
                                className="w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-bold text-[#14213D] focus:ring-1 focus:ring-blue-400 focus:outline-none"
                              />
                            </td>
                            {/* Accepted Qty */}
                            <td className="py-2 px-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={line.acceptedQty}
                                onChange={(e) => updateCreateLine(idx, 'acceptedQty', e.target.value)}
                                className="w-16 text-xs px-2 py-1 bg-emerald-50/70 border border-emerald-300 rounded-lg text-right font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                              />
                            </td>
                            {/* Quarantine Qty */}
                            <td className="py-2 px-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={line.quarantineQty}
                                onChange={(e) => updateCreateLine(idx, 'quarantineQty', e.target.value)}
                                className="w-14 text-xs px-2 py-1 bg-purple-50/70 border border-purple-300 rounded-lg text-right font-bold text-purple-800 focus:ring-1 focus:ring-purple-400 focus:outline-none"
                              />
                            </td>
                            {/* Rejected Qty */}
                            <td className="py-2 px-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={line.rejectedQty}
                                onChange={(e) => updateCreateLine(idx, 'rejectedQty', e.target.value)}
                                className="w-14 text-xs px-2 py-1 bg-rose-50/70 border border-rose-300 rounded-lg text-right font-bold text-rose-800 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                              />
                            </td>
                            {/* Lot Number */}
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                required
                                value={line.lotNumber}
                                onChange={(e) => updateCreateLine(idx, 'lotNumber', e.target.value)}
                                placeholder="เช่น LOT-26A01"
                                className="w-28 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-[#14213D] focus:ring-1 focus:ring-blue-400 focus:outline-none"
                              />
                            </td>
                            {/* Expiry Date */}
                            <td className="py-2 px-2">
                              <input
                                type="date"
                                required
                                value={line.expiryDate}
                                onChange={(e) => updateCreateLine(idx, 'expiryDate', e.target.value)}
                                className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-[#14213D] focus:ring-1 focus:ring-blue-400 focus:outline-none"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedPO ? (
                <div className="p-8 text-center text-xs text-[#94A3B8] border border-dashed rounded-2xl">
                  ไม่พบรายการสินค้าที่รอตรวจรับในใบสั่งซื้อนี้
                </div>
              ) : null}

              {/* Inspection Notes */}
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">
                  บันทึกผลการตรวจสอบสภาพ (Inspection Notes)
                </label>
                <textarea
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="เช่น สภาพกล่องสมบูรณ์, มีใบ COA แนบมาครบถ้วน, ซีลปลอดเชื้อไม่ฉีกขาด, อุณหภูมิขนส่ง 2-8°C ตามเกณฑ์..."
                  className="w-full text-xs p-2.5 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-[#14213D]"
                />
              </div>
            </div>

            {/* Modal Footer with 2 Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E2EAF4] shrink-0">
              <div className="text-xs text-[#64748B]">
                {linesData.length > 0 && (
                  <span>
                    ยอดตรวจผ่าน:{' '}
                    <strong className="text-emerald-700 font-bold tabular-nums">
                      {currentCreateAccepted.toLocaleString()} ชิ้น
                    </strong>{' '}
                    (จะตัดเข้าสต็อก On Hand พร้อมจ่าย)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold transition-colors"
                >
                  ยกเลิก
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || linesData.length === 0}
                  onClick={() => handleCreateGR(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="บันทึกเป็นฉบับร่าง เพื่อรอตรวจซ้ำหรืออนุมัติในภายหลัง"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกแบบร่าง (Save Draft)</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || linesData.length === 0}
                  onClick={() => handleCreateGR(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="อนุมัติตรวจรับและนำเข้าสต็อกคงคลัง On Hand ทันที"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>ยืนยันตรวจรับ & Post เข้าสต็อก</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Full-Screen GR Detail & Interactive Inspection Modal */}
      {showInspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                  <ArrowDownToLine className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* GR Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{showInspectModal.grNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(showInspectModal.grNumber);
                          addToast('info', `คัดลอกเลขที่ ${showInspectModal.grNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่ใบรับ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <StatusBadge status={showInspectModal.status} />

                    {showInspectModal.poNumber && (
                      <span className="bg-slate-100 text-[#475569] border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium font-mono">
                        อ้างอิง PO: {showInspectModal.poNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      บันทึกผลการตรวจรับพัสดุและเวชภัณฑ์เข้าคลัง
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Goods Receiving & Inspection Full Report)
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
                  title="พิมพ์เอกสารใบรับพัสดุ"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                {showInspectModal.status === 'DRAFT' && (
                  <button
                    type="button"
                    disabled={isUpdatingInspect}
                    onClick={() => handleConfirmAndPost(showInspectModal.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ยืนยันตรวจรับ & Post เข้าคลัง</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowInspectModal(null)}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors ml-1"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#F5F8FC]">
              {/* 4 Summary Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>ผู้จัดจำหน่าย (Supplier)</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showInspectModal.supplier?.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                    รหัส: {showInspectModal.supplier?.code || 'SUP-001'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>คลังสินค้าปลายทาง</span>
                  </div>
                  <div className="font-bold text-[#14213D] text-sm mt-1">
                    {showInspectModal.warehouse?.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    รับเมื่อ: {new Date(showInspectModal.receivingDate).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <div className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-600" />
                    <span>ผลการตรวจรับพัสดุ</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-emerald-700 text-sm tabular-nums">
                      ผ่าน: {showInspectModal.status === 'DRAFT' ? currentInspectAccepted.toLocaleString() : (showInspectModal.totalAccepted || 0).toLocaleString()}
                    </span>
                    {(showInspectModal.status === 'DRAFT' ? currentInspectQuarantine : (showInspectModal.totalQuarantine || 0)) > 0 && (
                      <span className="font-semibold text-purple-600 text-xs tabular-nums">
                        กักกัน: {showInspectModal.status === 'DRAFT' ? currentInspectQuarantine.toLocaleString() : showInspectModal.totalQuarantine.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    ผู้ตรวจรับ: {showInspectModal.createdBy || 'เจ้าหน้าที่ตรวจรับ'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-gradient-to-br from-white to-emerald-50/40">
                  <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>สถานะสต็อกคงคลัง</span>
                  </div>
                  <div className="font-bold text-emerald-900 text-base mt-1">
                    {showInspectModal.status === 'POSTED' ? 'บันทึกเข้าสต็อกแล้ว' : 'ฉบับร่าง (รอตรวจรับ)'}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">
                    {showInspectModal.status === 'POSTED' ? 'สร้าง Stock Movement เรียบร้อย' : 'ยังไม่ตัดยอดเข้าสต็อกพร้อมจ่าย'}
                  </div>
                </div>
              </div>

              {/* Inspection Notes Input / Callout */}
              {showInspectModal.status === 'DRAFT' ? (
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-1.5">
                  <label className="block text-xs font-bold text-[#14213D] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>บันทึกผลการตรวจสอบสภาพ (Inspection Notes) - สามารถแก้ไขได้</span>
                  </label>
                  <textarea
                    rows={2}
                    value={inspectNotes}
                    onChange={(e) => setInspectNotes(e.target.value)}
                    placeholder="ระบุผลการตรวจสอบสภาพ: เช่น บรรจุภัณฑ์สมบูรณ์ น้ำยาไม่ขุ่น ผ่านการตรวจ Lot และวันหมดอายุ, มีใบ COA แนบ..."
                    className="w-full text-xs p-2.5 bg-[#F8FAFC] border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-[#14213D]"
                  />
                </div>
              ) : (
                showInspectModal.inspectionNotes && (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-emerald-900">บันทึกผลการตรวจสอบสภาพ: </span>
                      <span className="text-[#334155]">{showInspectModal.inspectionNotes}</span>
                    </div>
                  </div>
                )
              )}

              {/* Items Table: Editable if DRAFT, Read-only if POSTED */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-[#14213D]">
                      รายการพัสดุและผลการตรวจรับราย Lot ({inspectLines.length} รายการ)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#64748B]">
                    {showInspectModal.status === 'DRAFT'
                      ? '✏️ แก้ไขเลข Lot, วันหมดอายุ และยอดตรวจสภาพจริงได้โดยตรง'
                      : 'ควบคุม Lot Number และ วันหมดอายุ (Expiry Date) รายตัว'}
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
                        <th className="py-2.5 px-3 text-center">จำนวนที่ตรวจ</th>
                        <th className="py-2.5 px-3 text-center text-emerald-700">ผ่าน (Accepted)</th>
                        <th className="py-2.5 px-3 text-center text-purple-700">กักกัน (Quarantine)</th>
                        <th className="py-2.5 px-3 text-center text-rose-700">ปฏิเสธ (Rejected)</th>
                        <th className="py-2.5 px-3 font-mono">Lot Number</th>
                        <th className="py-2.5 px-3">วันหมดอายุ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectLines.length > 0 ? (
                        inspectLines.map((l: any, idx: number) => {
                          const isDraft = showInspectModal.status === 'DRAFT';

                          return (
                            <tr key={l.id || idx} className="hover:bg-[#F5F8FC] transition-colors">
                              <td className="py-2.5 px-4 text-center font-mono text-[#94A3B8]">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                                {l.itemCode || '-'}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-[#14213D] min-w-[200px]">
                                {l.itemName || 'รายการพัสดุ'}
                                {l.genericName && (
                                  <div className="text-[10px] text-[#94A3B8] italic">
                                    {l.genericName}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center text-[#64748B]">
                                {l.unit || 'ชิ้น'}
                              </td>

                              {/* Qty Columns: Editable if DRAFT */}
                              {isDraft ? (
                                <>
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={l.receivedQty}
                                      onChange={(e) => updateInspectLine(idx, 'receivedQty', e.target.value)}
                                      className="w-16 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-right font-bold text-[#14213D] focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={l.acceptedQty}
                                      onChange={(e) => updateInspectLine(idx, 'acceptedQty', e.target.value)}
                                      className="w-16 text-xs px-2 py-1 bg-emerald-50/70 border border-emerald-300 rounded-lg text-right font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={l.quarantineQty}
                                      onChange={(e) => updateInspectLine(idx, 'quarantineQty', e.target.value)}
                                      className="w-14 text-xs px-2 py-1 bg-purple-50/70 border border-purple-300 rounded-lg text-right font-bold text-purple-800 focus:ring-1 focus:ring-purple-400 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={l.rejectedQty}
                                      onChange={(e) => updateInspectLine(idx, 'rejectedQty', e.target.value)}
                                      className="w-14 text-xs px-2 py-1 bg-rose-50/70 border border-rose-300 rounded-lg text-right font-bold text-rose-800 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="text"
                                      value={l.lotNumber}
                                      onChange={(e) => updateInspectLine(idx, 'lotNumber', e.target.value)}
                                      placeholder="เช่น LOT-26A01"
                                      className="w-28 text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono font-bold text-[#14213D] focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                    />
                                  </td>
                                  <td className="py-2 px-2">
                                    <input
                                      type="date"
                                      value={l.expiryDate}
                                      onChange={(e) => updateInspectLine(idx, 'expiryDate', e.target.value)}
                                      className="text-xs px-2 py-1 bg-white border border-slate-300 rounded-lg text-[#14213D] focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                    />
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-2.5 px-3 text-right font-bold text-[#14213D] tabular-nums">
                                    {l.receivedQty?.toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                                    {l.acceptedQty?.toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-semibold text-purple-700 tabular-nums">
                                    {l.quarantineQty > 0 ? l.quarantineQty.toLocaleString() : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-semibold text-rose-700 tabular-nums">
                                    {l.rejectedQty > 0 ? l.rejectedQty.toLocaleString() : '-'}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[#334155] font-semibold">
                                    {l.lotNumber || '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#64748B]">
                                    {l.expiryDate ? new Date(l.expiryDate).toLocaleDateString('th-TH') : '-'}
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={10} className="py-6 text-center text-[#94A3B8]">
                            ไม่พบรายการสินค้าในใบตรวจรับนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Business Rule Notice */}
              <div className="bg-blue-50/70 border border-blue-200/90 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <div className="font-bold">นโยบายการควบคุมความปลอดภัยและสต็อก (Good Inventory Practice):</div>
                  <p className="text-[#334155]">
                    ยอดสินค้าเฉพาะในช่อง <strong className="text-emerald-700">Accepted</strong> เท่านั้นที่จะถูกนำเข้าสต็อกพร้อมจ่าย (Available Stock) สำหรับการเบิกจ่ายตามกฎ FEFO ส่วนสินค้าที่กักกัน (<strong className="text-purple-700">Quarantine</strong>) จะถูกกักไว้รอผลแล็บหรือการเคลม และระบบไม่อนุญาตให้นำไปเบิกจ่ายแก่ผู้ป่วยเด็ดขาด
                  </p>
                </div>
              </div>

              {/* Visual Workflow Steps */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                <h4 className="text-xs font-bold text-[#14213D] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>ขั้นตอนการตรวจรับและเข้าคลัง (Goods Receipt Workflow)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. บันทึกรับพัสดุ (Draft)</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ดึงข้อมูลจาก PO พร้อมใบส่งของ
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>2. ตรวจสอบคุณภาพ</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      ตรวจ COA, สภาพกล่อง, Lot, Expiry
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showInspectModal.status === 'POSTED'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {showInspectModal.status === 'POSTED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>3. Post รับเข้าคลังสต็อก</span>
                    </div>
                    <div className="text-[11px] mt-1">
                      {showInspectModal.status === 'POSTED'
                        ? 'ยอดเข้า On Hand & Available แล้ว'
                        : 'รอยืนยันการตัดรับเข้าคลัง'}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      showInspectModal.status === 'POSTED'
                        ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                        : 'bg-[#F5F8FC] border-[#E2EAF4] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>4. บันทึก Stock Card & บัญชี</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-1">
                      สร้าง Movement และอัปเดตราคาต้นทุน
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-4 text-xs text-[#64748B]">
                <span>
                  รวมรายการ:{' '}
                  <strong className="text-[#14213D] font-bold">
                    {inspectLines.length}
                  </strong>{' '}
                  รายการ
                </span>
                <span>•</span>
                <span>
                  ยอดรับผ่าน:{' '}
                  <strong className="text-emerald-700 font-bold text-sm tabular-nums">
                    {(showInspectModal.status === 'DRAFT'
                      ? currentInspectAccepted
                      : showInspectModal.totalAccepted || 0
                    ).toLocaleString()}{' '}
                    ชิ้น
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowInspectModal(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-[#334155] font-semibold rounded-xl text-xs transition-colors"
                >
                  ปิดหน้าต่าง
                </button>

                {showInspectModal.status === 'DRAFT' && (
                  <>
                    <button
                      type="button"
                      disabled={isUpdatingInspect}
                      onClick={handleSaveDraftChanges}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="บันทึกผลตรวจรับลงแบบร่าง"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>บันทึกแบบร่าง</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdatingInspect}
                      onClick={() => handleConfirmAndPost(showInspectModal.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="ยืนยันผลการตรวจรับและตัดเข้าสต็อก On Hand ทันที"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>ยืนยันตรวจรับ & Post GR เข้าคลัง</span>
                    </button>
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

export default function GoodsReceivingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#94A3B8]">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
          กำลังโหลดระบบรับสินค้าเข้าคลัง...
        </div>
      }
    >
      <GoodsReceivingContent />
    </Suspense>
  );
}
