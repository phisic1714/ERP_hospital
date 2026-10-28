'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from '@erp/ui/navigation';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@erp/app-context';
import { StatusBadge } from '@erp/ui';
import {
  SourcingHeader,
  StatCard,
  FilterTabs,
  ModalShell,
  SectionCard,
  inputCls,
  btnPrimary,
  btnSecondary,
  btnSuccess,
  fmtDate,
  fmtMoney,
} from '@erp/ui/procurement/SourcingUI';
import {
  FileSearch,
  Plus,
  Search,
  Send,
  Eye,
  Users,
  Package,
  Inbox,
  Trophy,
  FileEdit,
  Receipt,
  Scale,
  Ban,
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  Trash2,
} from 'lucide-react';

type Tab = 'ALL' | 'DRAFT' | 'OPEN' | 'AWARDED' | 'CANCELLED';

function RFQContent() {
  const searchParams = useSearchParams();
  const prIdParam = searchParams.get('prId') || '';
  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('ALL');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [source, setSource] = useState<'PR' | 'MANUAL'>('PR');
  const [formPrId, setFormPrId] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [supplierIds, setSupplierIds] = useState<string[]>([]);
  const [manualLines, setManualLines] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Detail
  const [detail, setDetail] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/procurement/rfqs').then((r) => r.json()),
      fetch('/api/procurement/requisitions').then((r) => r.json()),
    ])
      .then(([rfqData, prData]) => {
        if (Array.isArray(rfqData)) setRfqs(rfqData);
        if (Array.isArray(prData)) setPrs(prData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSuppliers(d.filter((s: any) => s.active !== false)));
    fetch('/api/items')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setItems(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // PRs eligible for RFQ: APPROVED and no active RFQ
  const eligiblePRs = useMemo(
    () =>
      prs.filter(
        (p) => p.status === 'APPROVED' && !(p.rfqs || []).some((r: any) => r.status !== 'CANCELLED')
      ),
    [prs]
  );

  // Open create modal when coming from PR page (?prId=)
  useEffect(() => {
    if (prIdParam && prs.length > 0) {
      openCreate(prIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prIdParam, prs.length]);

  const openCreate = (presetPrId?: string) => {
    const pr = presetPrId ? eligiblePRs.find((p) => p.id === presetPrId) : eligiblePRs[0];
    setSource(pr || eligiblePRs.length > 0 ? 'PR' : 'MANUAL');
    setFormPrId(pr?.id || '');
    setTitle(pr ? `ขอใบเสนอราคาตามใบขอซื้อ ${pr.prNumber}` : '');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setRemarks('');
    setSupplierIds([]);
    setManualLines(
      items.length > 0 ? [{ itemId: items[0].id, quantity: 100, estimatedUnitPrice: items[0].standardCost || 0 }] : []
    );
    setShowCreate(true);
  };

  const selectedPR = prs.find((p) => p.id === formPrId);

  const previewLines =
    source === 'PR'
      ? (selectedPR?.lines || []).map((l: any) => ({
          item: l.item,
          quantity: l.approvedQty || l.requestedQty,
          estimatedUnitPrice: l.estimatedUnitPrice,
        }))
      : manualLines.map((l) => ({ ...l, item: items.find((i) => i.id === l.itemId) }));

  const previewTotal = previewLines.reduce(
    (s: number, l: any) => s + (Number(l.quantity) || 0) * (Number(l.estimatedUnitPrice) || 0),
    0
  );

  const toggleSupplier = (id: string) =>
    setSupplierIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleCreate = async (send: boolean) => {
    if (source === 'PR' && !formPrId) return addToast('error', 'กรุณาเลือกใบขอซื้อ (PR)');
    if (supplierIds.length === 0) return addToast('error', 'กรุณาเลือกผู้จำหน่ายอย่างน้อย 1 ราย');
    if (supplierIds.length < 3)
      addToast('info', 'ข้อแนะนำ: ควรขอใบเสนอราคาอย่างน้อย 3 ราย เพื่อความโปร่งใสในการเปรียบเทียบ');
    setSubmitting(true);
    try {
      const res = await fetch('/api/procurement/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prId: source === 'PR' ? formPrId : null,
          title,
          dueDate,
          remarks,
          supplierIds,
          lines: source === 'MANUAL' ? manualLines : undefined,
          createdBy: currentUser.name,
          send,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สร้าง RFQ ไม่สำเร็จ');
      addToast(
        'success',
        send
          ? `สร้างและส่งคำขอใบเสนอราคา ${data.rfqNumber} ถึงผู้จำหน่าย ${supplierIds.length} รายแล้ว`
          : `บันทึกร่างคำขอใบเสนอราคา ${data.rfqNumber} เรียบร้อย`
      );
      setShowCreate(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (rfq: any, action: 'SEND' | 'CANCEL') => {
    let reason = '';
    if (action === 'CANCEL') {
      const input = window.prompt(`ระบุเหตุผลการยกเลิก ${rfq.rfqNumber}`);
      if (input === null) return;
      reason = input;
    }
    try {
      const res = await fetch(`/api/procurement/rfqs/${rfq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userName: currentUser.name, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ดำเนินการไม่สำเร็จ');
      addToast(
        'success',
        action === 'SEND' ? `ส่งคำขอใบเสนอราคา ${rfq.rfqNumber} แล้ว` : `ยกเลิก ${rfq.rfqNumber} แล้ว`
      );
      setDetail(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  // Stats & filtering
  const counts = {
    ALL: rfqs.length,
    DRAFT: rfqs.filter((r) => r.status === 'DRAFT').length,
    OPEN: rfqs.filter((r) => ['SENT', 'QUOTING'].includes(r.status)).length,
    AWARDED: rfqs.filter((r) => ['AWARDED', 'PO_CREATED'].includes(r.status)).length,
    CANCELLED: rfqs.filter((r) => r.status === 'CANCELLED').length,
  };

  const filtered = rfqs.filter((r) => {
    if (tab === 'DRAFT' && r.status !== 'DRAFT') return false;
    if (tab === 'OPEN' && !['SENT', 'QUOTING'].includes(r.status)) return false;
    if (tab === 'AWARDED' && !['AWARDED', 'PO_CREATED'].includes(r.status)) return false;
    if (tab === 'CANCELLED' && r.status !== 'CANCELLED') return false;
    if (!search.trim()) return true;
    const t = search.toLowerCase();
    return (
      r.rfqNumber?.toLowerCase().includes(t) ||
      r.prNumber?.toLowerCase().includes(t) ||
      r.title?.toLowerCase().includes(t) ||
      r.suppliers?.some((s: any) => s.supplier?.name?.toLowerCase().includes(t))
    );
  });

  const totalQuotes = rfqs.reduce((s, r) => s + (r.quotations?.filter((q: any) => q.status !== 'CANCELLED').length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SourcingHeader
        crumb="ขอใบเสนอราคา (RFQ)"
        title="ขอใบเสนอราคา (Request for Quotation - RFQ)"
        subtitle="ส่งคำขอใบเสนอราคาจากใบขอซื้อที่อนุมัติแล้วไปยังผู้จำหน่ายหลายราย เพื่อนำไปเปรียบเทียบราคาก่อนออกใบสั่งซื้อ"
        icon={FileSearch}
        onRefresh={triggerRefresh}
        actions={
          <button type="button" id="btn-create-rfq" onClick={() => openCreate()} className={btnPrimary}>
            <Plus className="w-4 h-4" />
            <span>สร้างคำขอใบเสนอราคา</span>
          </button>
        }
      />

      {/* Flow ribbon */}
      <div className="bg-gradient-to-r from-[#14213D] to-[#1E3A5F] rounded-2xl p-4 text-white shadow-sm flex flex-wrap items-center gap-2 text-[11px] font-semibold">
        {[
          { label: 'PR อนุมัติแล้ว', href: '/procurement/requisitions' },
          { label: 'RFQ ขอใบเสนอราคา', href: '/procurement/rfq', active: true },
          { label: 'บันทึกใบเสนอราคา', href: '/procurement/quotations' },
          { label: 'เปรียบเทียบ & คัดเลือก', href: '/procurement/comparison' },
          { label: 'ใบสั่งซื้อ (รออนุมัติ PO)', href: '/procurement/orders' },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <Link
              href={s.href}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                s.active ? 'bg-[#F28C28] shadow-md' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {i + 1}. {s.label}
            </Link>
            {i < arr.length - 1 && <span className="text-white/40">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="PR รอขอใบเสนอราคา" value={eligiblePRs.length} hint="อนุมัติแล้ว ยังไม่เปิด RFQ" icon={FileText} tone="orange" />
        <StatCard label="RFQ เปิดรับราคา" value={counts.OPEN} hint="ส่งแล้ว / กำลังรับใบเสนอราคา" icon={Send} tone="sky" />
        <StatCard label="ใบเสนอราคาที่ได้รับ" value={totalQuotes} hint="รวมทุก RFQ" icon={Inbox} tone="violet" />
        <StatCard label="คัดเลือกผู้ชนะแล้ว" value={counts.AWARDED} hint="พร้อม/ออก PO แล้ว" icon={Trophy} tone="emerald" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="rfq-search"
            type="text"
            placeholder="ค้นหาเลขที่ RFQ, PR, หัวข้อ หรือผู้จำหน่าย..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
          />
        </div>
        <FilterTabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'ALL', label: 'ทั้งหมด', count: counts.ALL },
            { id: 'DRAFT', label: 'ฉบับร่าง', count: counts.DRAFT },
            { id: 'OPEN', label: 'รอใบเสนอราคา', count: counts.OPEN },
            { id: 'AWARDED', label: 'คัดเลือกแล้ว', count: counts.AWARDED },
            { id: 'CANCELLED', label: 'ยกเลิก', count: counts.CANCELLED },
          ]}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ RFQ</th>
                <th className="py-3 px-3">อ้างอิง PR</th>
                <th className="py-3 px-3">หัวข้อ</th>
                <th className="py-3 px-3">กำหนดยื่นราคา</th>
                <th className="py-3 px-3 text-center">ผู้จำหน่าย (ตอบ/เชิญ)</th>
                <th className="py-3 px-3 text-right">รายการ</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <FileSearch className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    ยังไม่มีคำขอใบเสนอราคาตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const responded = r.suppliers?.filter((s: any) => s.status === 'RESPONDED').length || 0;
                  const invited = r.suppliers?.length || 0;
                  const overdue =
                    r.dueDate && ['SENT', 'QUOTING'].includes(r.status) && new Date(r.dueDate) < new Date();
                  return (
                    <tr key={r.id} className="hover:bg-[#FFF7ED]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold">
                        <button
                          type="button"
                          onClick={() => setDetail(r)}
                          className="text-[#D97706] hover:underline"
                        >
                          {r.rfqNumber}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {r.prNumber ? (
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">{r.prNumber}</span>
                        ) : (
                          <span className="text-slate-400 italic">ไม่อ้างอิง PR</span>
                        )}
                      </td>
                      <td className="py-3 px-3 max-w-[240px]">
                        <div className="font-semibold text-[#14213D] truncate">{r.title}</div>
                        <div className="text-[11px] text-slate-400">โดย {r.createdBy}</div>
                      </td>
                      <td className={`py-3 px-3 ${overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                        {fmtDate(r.dueDate)}
                        {overdue && <div className="text-[10px]">เลยกำหนด</div>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#F28C28] to-emerald-500"
                              style={{ width: `${invited ? (responded / invited) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-semibold tabular-nums">
                            {responded}/{invited}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">{r.lines?.length || 0} รายการ</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetail(r)}
                            className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>ดูข้อมูล</span>
                          </button>
                          {r.status === 'DRAFT' && (
                            <button
                              type="button"
                              onClick={() => handleAction(r, 'SEND')}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>ส่ง RFQ</span>
                            </button>
                          )}
                          {['SENT', 'QUOTING'].includes(r.status) && (
                            <Link
                              href={`/procurement/quotations?rfqId=${r.id}`}
                              className="px-2.5 py-1 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>บันทึกราคา</span>
                            </Link>
                          )}
                          {(r.quotations?.length || 0) > 0 && r.status !== 'CANCELLED' && (
                            <Link
                              href={`/procurement/comparison?rfqId=${r.id}`}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Scale className="w-3.5 h-3.5" />
                              <span>เปรียบเทียบ</span>
                            </Link>
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

      {/* ---------------- Create RFQ Modal ---------------- */}
      <ModalShell
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="สร้างคำขอใบเสนอราคา (New RFQ)"
        subtitle="เลือกใบขอซื้อที่อนุมัติแล้ว หรือระบุรายการเอง แล้วเลือกผู้จำหน่ายที่จะส่งคำขอราคา"
        icon={FileSearch}
        size="xl"
        footer={
          <>
            <div className="mr-auto text-xs text-slate-500">
              ราคากลางประเมิน:{' '}
              <span className="font-bold text-[#D97706] text-sm tabular-nums">฿{fmtMoney(previewTotal)}</span>
            </div>
            <button type="button" onClick={() => setShowCreate(false)} className={btnSecondary}>
              ยกเลิก
            </button>
            <button type="button" disabled={submitting} onClick={() => handleCreate(false)} className={btnSecondary}>
              <FileEdit className="w-4 h-4" />
              <span>บันทึกร่าง</span>
            </button>
            <button type="button" disabled={submitting} onClick={() => handleCreate(true)} className={btnPrimary}>
              <Send className="w-4 h-4" />
              <span>บันทึกและส่ง RFQ</span>
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-5">
            <SectionCard title="ข้อมูลคำขอใบเสนอราคา" icon={FileText}>
              <div className="space-y-3 text-xs">
                <div className="flex gap-2">
                  {(['PR', 'MANUAL'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSource(s)}
                      className={`flex-1 px-3 py-2 rounded-xl border font-semibold transition-all ${
                        source === s
                          ? 'border-[#F28C28] bg-orange-50 text-[#D97706]'
                          : 'border-[#E2EAF4] text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {s === 'PR' ? 'อ้างอิงใบขอซื้อ (PR)' : 'ระบุรายการเอง'}
                    </button>
                  ))}
                </div>

                {source === 'PR' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ใบขอซื้อที่อนุมัติแล้ว *</label>
                    {eligiblePRs.length === 0 ? (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                        ไม่มีใบขอซื้อที่อนุมัติแล้วและยังไม่ได้เปิด RFQ
                      </div>
                    ) : (
                      <select
                        value={formPrId}
                        onChange={(e) => {
                          setFormPrId(e.target.value);
                          const p = prs.find((x) => x.id === e.target.value);
                          if (p) setTitle(`ขอใบเสนอราคาตามใบขอซื้อ ${p.prNumber}`);
                        }}
                        className={inputCls}
                      >
                        <option value="">-- เลือกใบขอซื้อ --</option>
                        {eligiblePRs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.prNumber} • {p.lines?.length || 0} รายการ • ฿{fmtMoney(p.totalAmount)} • {p.requesterName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หัวข้อ *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="เช่น ขอใบเสนอราคาเวชภัณฑ์ไตรมาส 4" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">กำหนดยื่นใบเสนอราคา</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ / เงื่อนไข</label>
                    <input value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputCls} placeholder="เงื่อนไขการส่งมอบ, ยืนราคา..." />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={`รายการสินค้าที่ขอราคา (${previewLines.length} รายการ)`}
              icon={Package}
              right={
                source === 'MANUAL' && (
                  <button
                    type="button"
                    onClick={() =>
                      items.length &&
                      setManualLines([...manualLines, { itemId: items[0].id, quantity: 100, estimatedUnitPrice: items[0].standardCost || 0 }])
                    }
                    className="text-[11px] font-semibold text-[#D97706] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
                  </button>
                )
              }
            >
              {previewLines.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">เลือกใบขอซื้อเพื่อดึงรายการสินค้า</div>
              ) : source === 'PR' ? (
                <table className="w-full text-xs">
                  <thead className="text-[11px] text-slate-500 border-b">
                    <tr>
                      <th className="py-2 text-left">สินค้า</th>
                      <th className="py-2 text-right">จำนวน</th>
                      <th className="py-2 text-right">ราคากลาง/หน่วย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewLines.map((l: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2">
                          <div className="font-semibold text-[#14213D]">{l.item?.itemName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{l.item?.itemCode}</div>
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {l.quantity} {l.item?.unit}
                        </td>
                        <td className="py-2 text-right tabular-nums">฿{fmtMoney(l.estimatedUnitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="space-y-2">
                  {manualLines.map((l, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={l.itemId}
                        onChange={(e) => {
                          const it = items.find((i) => i.id === e.target.value);
                          const next = [...manualLines];
                          next[idx] = { ...l, itemId: e.target.value, estimatedUnitPrice: it?.standardCost || 0 };
                          setManualLines(next);
                        }}
                        className={`${inputCls} flex-1`}
                      >
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            [{it.itemCode}] {it.itemName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={l.quantity}
                        onChange={(e) => {
                          const next = [...manualLines];
                          next[idx] = { ...l, quantity: Number(e.target.value) };
                          setManualLines(next);
                        }}
                        className={`${inputCls} w-24 text-right`}
                        placeholder="จำนวน"
                      />
                      <input
                        type="number"
                        min={0}
                        value={l.estimatedUnitPrice}
                        onChange={(e) => {
                          const next = [...manualLines];
                          next[idx] = { ...l, estimatedUnitPrice: Number(e.target.value) };
                          setManualLines(next);
                        }}
                        className={`${inputCls} w-28 text-right`}
                        placeholder="ราคากลาง"
                      />
                      {manualLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setManualLines(manualLines.filter((_, i) => i !== idx))}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="lg:col-span-2">
            <SectionCard
              title="เลือกผู้จำหน่ายที่จะส่งคำขอราคา"
              icon={Users}
              right={
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    supplierIds.length >= 3 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  เลือก {supplierIds.length} ราย {supplierIds.length < 3 && '(แนะนำ ≥ 3)'}
                </span>
              }
              className="h-full"
            >
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {suppliers.map((s) => {
                  const checked = supplierIds.includes(s.id);
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleSupplier(s.id)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                        checked ? 'border-[#F28C28] bg-orange-50/60 shadow-2xs' : 'border-[#E2EAF4] hover:bg-slate-50'
                      }`}
                    >
                      {checked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#F28C28] mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#14213D] truncate">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {s.code} • {s.paymentTerm || '-'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>
      </ModalShell>

      {/* ---------------- Detail Modal ---------------- */}
      <ModalShell
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.rfqNumber} • ${detail.title}` : ''}
        subtitle={
          detail && (
            <span className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={detail.status} />
              {detail.prNumber && <span className="font-mono">อ้างอิง {detail.prNumber}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> ยื่นราคาภายใน {fmtDate(detail.dueDate)}
              </span>
            </span>
          )
        }
        icon={FileSearch}
        size="xl"
        footer={
          detail && (
            <>
              {!['AWARDED', 'PO_CREATED', 'CANCELLED'].includes(detail.status) && (
                <button
                  type="button"
                  onClick={() => handleAction(detail, 'CANCEL')}
                  className="mr-auto px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" /> ยกเลิก RFQ
                </button>
              )}
              <button type="button" onClick={() => setDetail(null)} className={btnSecondary}>
                ปิดหน้าต่าง
              </button>
              {detail.status === 'DRAFT' && (
                <button type="button" onClick={() => handleAction(detail, 'SEND')} className={btnPrimary}>
                  <Send className="w-4 h-4" /> ส่ง RFQ ให้ผู้จำหน่าย
                </button>
              )}
              {['SENT', 'QUOTING'].includes(detail.status) && (
                <Link href={`/procurement/quotations?rfqId=${detail.id}`} className={btnPrimary}>
                  <Receipt className="w-4 h-4" /> บันทึกใบเสนอราคา
                </Link>
              )}
              {(detail.quotations?.length || 0) > 0 && detail.status !== 'CANCELLED' && (
                <Link href={`/procurement/comparison?rfqId=${detail.id}`} className={btnSuccess}>
                  <Scale className="w-4 h-4" /> ไปหน้าเปรียบเทียบ
                </Link>
              )}
            </>
          )
        }
      >
        {detail && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <SectionCard title={`รายการสินค้า (${detail.lines?.length || 0})`} icon={Package} className="lg:col-span-2">
                <table className="w-full text-xs">
                  <thead className="text-[11px] text-slate-500 border-b">
                    <tr>
                      <th className="py-2 text-left">#</th>
                      <th className="py-2 text-left">สินค้า</th>
                      <th className="py-2 text-right">จำนวน</th>
                      <th className="py-2 text-right">ราคากลาง/หน่วย</th>
                      <th className="py-2 text-right">ราคากลางรวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.lines?.map((l: any, i: number) => (
                      <tr key={l.id}>
                        <td className="py-2 text-slate-400">{i + 1}</td>
                        <td className="py-2">
                          <div className="font-semibold text-[#14213D]">{l.item?.itemName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{l.item?.itemCode}</div>
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {l.quantity} {l.item?.unit}
                        </td>
                        <td className="py-2 text-right tabular-nums">฿{fmtMoney(l.estimatedUnitPrice)}</td>
                        <td className="py-2 text-right tabular-nums font-semibold">
                          ฿{fmtMoney(l.estimatedUnitPrice * l.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </SectionCard>

              <SectionCard title="ผู้จำหน่ายที่ได้รับเชิญ" icon={Users}>
                <div className="space-y-2">
                  {detail.suppliers?.map((s: any) => {
                    const q = detail.quotations?.find((x: any) => x.supplierId === s.supplierId && x.status !== 'CANCELLED');
                    return (
                      <div key={s.id} className="p-2.5 rounded-xl border border-[#E2EAF4] flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#14213D] truncate">{s.supplier?.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.supplier?.code}</div>
                        </div>
                        {q ? (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-xs font-bold text-emerald-700 tabular-nums">฿{fmtMoney(q.totalAmount)}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{q.quotationNumber}</div>
                            </div>
                            <Link
                              href={`/procurement/quotations?rfqId=${detail.id}`}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors shrink-0"
                              title="ดูรายละเอียดใบเสนอราคา"
                            >
                              ดูราคา
                            </Link>
                          </div>
                        ) : ['SENT', 'QUOTING'].includes(detail.status) ? (
                          <Link
                            href={`/procurement/quotations?rfqId=${detail.id}&supplierId=${s.supplierId}`}
                            className="px-2.5 py-1 bg-orange-50 hover:bg-[#F28C28] text-[#D97706] hover:text-white border border-orange-200 hover:border-[#F28C28] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs shrink-0"
                            title={`บันทึกใบเสนอราคาสำหรับ ${s.supplier?.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>บันทึกราคา</span>
                          </Link>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                            รอเสนอราคา
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            {(detail.selectionReason || detail.poNumber) && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
                <Trophy className="w-5 h-5 shrink-0 text-emerald-600" />
                <div>
                  <div className="font-bold">
                    ผลการคัดเลือก:{' '}
                    {detail.quotations?.find((q: any) => q.id === detail.selectedQuotationId)?.supplier?.name || '-'}
                  </div>
                  <div className="mt-0.5">{detail.selectionReason}</div>
                  {detail.poNumber && (
                    <Link href="/procurement/orders" className="inline-block mt-1 font-bold underline">
                      ออกใบสั่งซื้อแล้ว: {detail.poNumber}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </ModalShell>
    </div>
  );
}

export default function RFQPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลด...</div>}>
      <RFQContent />
    </Suspense>
  );
}
