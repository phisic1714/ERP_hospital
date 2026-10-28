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
  Receipt,
  Plus,
  Search,
  Eye,
  Inbox,
  Trophy,
  Truck,
  Star,
  Building2,
  Package,
  Scale,
  Clock,
  FileSearch,
  Save,
  Paperclip,
  Upload,
  FileText,
} from 'lucide-react';

type Tab = 'ALL' | 'RECEIVED' | 'SELECTED' | 'NOT_SELECTED';

function QuotationStatus({ status }: { status: string }) {
  if (status === 'RECEIVED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-violet-50 text-violet-700 border-violet-200">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
        ได้รับแล้ว (รอเปรียบเทียบ)
      </span>
    );
  }
  return <StatusBadge status={status} />;
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n === value ? 0 : n)} className="p-0.5">
          <Star className={`w-5 h-5 transition-colors ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'}`} />
        </button>
      ))}
      <span className="text-[11px] text-slate-500 ml-1">{value > 0 ? `${value}/5` : 'ไม่ประเมิน'}</span>
    </div>
  );
}

function QuotationsContent() {
  const searchParams = useSearchParams();
  const rfqIdParam = searchParams.get('rfqId') || '';
  const supplierIdParam = searchParams.get('supplierId') || '';
  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();

  const [quotations, setQuotations] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('ALL');
  const [detail, setDetail] = useState<any | null>(null);

  // Form
  const [showCreate, setShowCreate] = useState(false);
  const [rfqId, setRfqId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplierQuoteRef, setSupplierQuoteRef] = useState('');
  const [quoteDate, setQuoteDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(7);
  const [paymentTerm, setPaymentTerm] = useState('');
  const [warranty, setWarranty] = useState('');
  const [qualityScore, setQualityScore] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [prices, setPrices] = useState<Record<string, { unitPrice: number; brand: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      addToast('info', `แนบไฟล์ใบเสนอราคา: ${file.name}`);
    }
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/procurement/quotations').then((r) => r.json()),
      fetch('/api/procurement/rfqs').then((r) => r.json()),
    ])
      .then(([q, r]) => {
        if (Array.isArray(q)) setQuotations(q);
        if (Array.isArray(r)) setRfqs(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSuppliers(d.filter((s: any) => s.active !== false)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const openRfqs = useMemo(() => rfqs.filter((r) => ['SENT', 'QUOTING'].includes(r.status)), [rfqs]);
  const selectedRfq = rfqs.find((r) => r.id === rfqId);

  // Suppliers that already submitted for selected RFQ
  const quotedSupplierIds = new Set(
    (selectedRfq?.quotations || []).filter((q: any) => q.status !== 'CANCELLED').map((q: any) => q.supplierId)
  );
  const invitedPending = (selectedRfq?.suppliers || []).filter((s: any) => !quotedSupplierIds.has(s.supplierId));
  const otherSuppliers = suppliers.filter(
    (s) => !quotedSupplierIds.has(s.id) && !(selectedRfq?.suppliers || []).some((x: any) => x.supplierId === s.id)
  );

  const resetLinesFor = (rfq: any) => {
    const p: Record<string, { unitPrice: number; brand: string }> = {};
    (rfq?.lines || []).forEach((l: any) => (p[l.id] = { unitPrice: 0, brand: '' }));
    setPrices(p);
  };

  const pickSupplier = (sid: string) => {
    setSupplierId(sid);
    const s = suppliers.find((x) => x.id === sid);
    setPaymentTerm(s?.paymentTerm || '');
  };

  const openCreate = (presetRfqId?: string, presetSupplierId?: string) => {
    const rfq = openRfqs.find((r) => r.id === presetRfqId) || openRfqs[0];
    setRfqId(rfq?.id || '');
    resetLinesFor(rfq);

    // Auto-select target supplier if specified, or pick first pending supplier
    const targetSupplierId =
      presetSupplierId ||
      rfq?.suppliers?.find(
        (s: any) => !(rfq.quotations || []).some((q: any) => q.supplierId === s.supplierId && q.status !== 'CANCELLED')
      )?.supplierId ||
      '';

    setSupplierId(targetSupplierId);
    const targetSupplier =
      suppliers.find((x) => x.id === targetSupplierId) ||
      rfq?.suppliers?.find((x: any) => x.supplierId === targetSupplierId)?.supplier;
    setPaymentTerm(targetSupplier?.paymentTerm || '');
    setSupplierQuoteRef('');
    setQuoteDate(new Date().toISOString().slice(0, 10));
    setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setDeliveryDays(7);
    setWarranty('');
    setQualityScore(0);
    setRemarks('');
    setAttachmentName('');
    setShowCreate(true);
  };

  useEffect(() => {
    if (rfqIdParam && rfqs.length > 0) openCreate(rfqIdParam, supplierIdParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfqIdParam, supplierIdParam, rfqs.length]);

  const formTotal = (selectedRfq?.lines || []).reduce(
    (s: number, l: any) => s + (Number(prices[l.id]?.unitPrice) || 0) * l.quantity,
    0
  );
  const estTotal = (selectedRfq?.lines || []).reduce(
    (s: number, l: any) => s + (l.estimatedUnitPrice || 0) * l.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!rfqId) return addToast('error', 'กรุณาเลือก RFQ');
    if (!supplierId) return addToast('error', 'กรุณาเลือกผู้จำหน่าย');
    setSubmitting(true);
    try {
      const res = await fetch('/api/procurement/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId,
          supplierId,
          supplierQuoteRef,
          quoteDate,
          validUntil,
          deliveryDays,
          paymentTerm,
          warranty,
          qualityScore,
          remarks,
          attachmentName: attachmentName || null,
          attachmentUrl: attachmentName ? `/attachments/${attachmentName}` : null,
          createdBy: currentUser.name,
          lines: Object.entries(prices).map(([rfqLineId, v]) => ({
            rfqLineId,
            unitPrice: v.unitPrice,
            brand: v.brand,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
      addToast('success', `บันทึกใบเสนอราคา ${data.quotationNumber} จาก ${data.supplier?.name} เรียบร้อย`);
      setShowCreate(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const counts = {
    ALL: quotations.length,
    RECEIVED: quotations.filter((q) => q.status === 'RECEIVED').length,
    SELECTED: quotations.filter((q) => q.status === 'SELECTED').length,
    NOT_SELECTED: quotations.filter((q) => q.status === 'NOT_SELECTED').length,
  };

  const filtered = quotations.filter((q) => {
    if (tab !== 'ALL' && q.status !== tab) return false;
    if (!search.trim()) return true;
    const t = search.toLowerCase();
    return (
      q.quotationNumber?.toLowerCase().includes(t) ||
      q.supplierQuoteRef?.toLowerCase().includes(t) ||
      q.rfq?.rfqNumber?.toLowerCase().includes(t) ||
      q.supplier?.name?.toLowerCase().includes(t)
    );
  });

  const selectedValue = quotations.filter((q) => q.status === 'SELECTED').reduce((s, q) => s + q.totalAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SourcingHeader
        crumb="ใบเสนอราคา (Quotation)"
        title="ใบเสนอราคา (Quotation Management)"
        subtitle="บันทึกใบเสนอราคาที่ได้รับจากผู้จำหน่ายแต่ละราย ทั้งราคาต่อหน่วย ระยะเวลาส่งมอบ เงื่อนไขการชำระเงิน และการรับประกัน"
        icon={Receipt}
        onRefresh={triggerRefresh}
        actions={
          <button
            type="button"
            id="btn-create-quotation"
            onClick={() => (openRfqs.length ? openCreate() : addToast('info', 'ยังไม่มี RFQ ที่เปิดรับใบเสนอราคา กรุณาสร้างและส่ง RFQ ก่อน'))}
            className={btnPrimary}
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกใบเสนอราคา</span>
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="RFQ เปิดรับราคา" value={openRfqs.length} hint="รอบันทึกใบเสนอราคา" icon={FileSearch} tone="sky" />
        <StatCard label="ใบเสนอราคาทั้งหมด" value={counts.ALL} icon={Inbox} tone="violet" />
        <StatCard label="รอเปรียบเทียบ" value={counts.RECEIVED} icon={Clock} tone="amber" />
        <StatCard label="มูลค่าที่ได้รับคัดเลือก" value={`฿${fmtMoney(selectedValue)}`} hint={`${counts.SELECTED} ใบเสนอราคา`} icon={Trophy} tone="emerald" />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="quotation-search"
            type="text"
            placeholder="ค้นหาเลขที่ใบเสนอราคา, RFQ หรือผู้จำหน่าย..."
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
            { id: 'RECEIVED', label: 'รอเปรียบเทียบ', count: counts.RECEIVED },
            { id: 'SELECTED', label: 'ได้รับคัดเลือก', count: counts.SELECTED },
            { id: 'NOT_SELECTED', label: 'ไม่ได้รับคัดเลือก', count: counts.NOT_SELECTED },
          ]}
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่ใบเสนอราคา</th>
                <th className="py-3 px-3">RFQ</th>
                <th className="py-3 px-3">ผู้จำหน่าย</th>
                <th className="py-3 px-3">วันที่เสนอ / ยืนราคาถึง</th>
                <th className="py-3 px-3 text-center">ส่งมอบ</th>
                <th className="py-3 px-3 text-center">คุณภาพ</th>
                <th className="py-3 px-3 text-right">ยอดเสนอราคา</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    ยังไม่มีใบเสนอราคาตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filtered.map((q) => {
                  const expired = q.validUntil && new Date(q.validUntil) < new Date() && q.status === 'RECEIVED';
                  return (
                    <tr key={q.id} className="hover:bg-[#FFF7ED]/40 transition-colors">
                      <td className="py-3 px-4">
                        <button type="button" onClick={() => setDetail(q)} className="font-mono font-bold text-[#D97706] hover:underline">
                          {q.quotationNumber}
                        </button>
                        {q.supplierQuoteRef && <div className="text-[10px] text-slate-400">อ้างอิงผู้ขาย: {q.supplierQuoteRef}</div>}
                        {q.attachmentName && (
                          <div className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1 font-mono">
                            <Paperclip className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[130px]">{q.attachmentName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded-lg">{q.rfq?.rfqNumber}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#14213D]">{q.supplier?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{q.paymentTerm || q.supplier?.paymentTerm || '-'}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div>{fmtDate(q.quoteDate)}</div>
                        <div className={`text-[10px] ${expired ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                          ถึง {fmtDate(q.validUntil)} {expired && '(หมดอายุ)'}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center tabular-nums">{q.deliveryDays} วัน</td>
                      <td className="py-3 px-3 text-center">
                        {q.qualityScore > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {q.qualityScore}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">฿{fmtMoney(q.totalAmount)}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <QuotationStatus status={q.status} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetail(q)}
                            className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>ดูข้อมูล</span>
                          </button>
                          {q.status === 'RECEIVED' && (
                            <Link
                              href={`/procurement/comparison?rfqId=${q.rfqId}`}
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

      {/* ---------------- Create Quotation Modal ---------------- */}
      <ModalShell
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="บันทึกใบเสนอราคาจากผู้จำหน่าย"
        subtitle="กรอกราคาต่อหน่วยของแต่ละรายการตามใบเสนอราคาที่ได้รับ ระบบจะคำนวณยอดรวมให้อัตโนมัติ"
        icon={Receipt}
        size="xl"
        footer={
          <>
            <div className="mr-auto text-xs text-slate-500 flex items-center gap-3">
              <span>
                ยอดเสนอราคา: <span className="font-bold text-[#D97706] text-sm tabular-nums">฿{fmtMoney(formTotal)}</span>
              </span>
              {estTotal > 0 && formTotal > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold ${
                    formTotal <= estTotal ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {formTotal <= estTotal ? '▼' : '▲'} {Math.abs(((formTotal - estTotal) / estTotal) * 100).toFixed(1)}% จากราคากลาง
                </span>
              )}
            </div>
            <button type="button" onClick={() => setShowCreate(false)} className={btnSecondary}>
              ยกเลิก
            </button>
            <button type="button" disabled={submitting} onClick={handleSubmit} className={btnPrimary}>
              <Save className="w-4 h-4" />
              <span>บันทึกใบเสนอราคา</span>
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <SectionCard title="อ้างอิงคำขอและผู้จำหน่าย" icon={Building2}>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">คำขอใบเสนอราคา (RFQ) *</label>
                  <select
                    value={rfqId}
                    onChange={(e) => {
                      setRfqId(e.target.value);
                      const r = rfqs.find((x) => x.id === e.target.value);
                      resetLinesFor(r);
                      setSupplierId('');
                    }}
                    className={inputCls}
                  >
                    <option value="">-- เลือก RFQ --</option>
                    {openRfqs.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.rfqNumber} • {r.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ผู้จำหน่าย *</label>
                  <select value={supplierId} onChange={(e) => pickSupplier(e.target.value)} className={inputCls}>
                    <option value="">-- เลือกผู้จำหน่าย --</option>
                    {invitedPending.length > 0 && (
                      <optgroup label="ผู้จำหน่ายที่ได้รับเชิญ (ยังไม่เสนอราคา)">
                        {invitedPending.map((s: any) => (
                          <option key={s.supplierId} value={s.supplierId}>
                            {s.supplier?.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {otherSuppliers.length > 0 && (
                      <optgroup label="ผู้จำหน่ายอื่น (ไม่ได้รับเชิญ)">
                        {otherSuppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {selectedRfq && quotedSupplierIds.size > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1">เสนอราคาแล้ว {quotedSupplierIds.size} ราย</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เลขที่ใบเสนอราคาผู้ขาย</label>
                    <input value={supplierQuoteRef} onChange={(e) => setSupplierQuoteRef(e.target.value)} className={inputCls} placeholder="เช่น QO-2569/123" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">วันที่เสนอราคา</label>
                    <input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>เอกสารแนบใบเสนอราคาต้นฉบับ (Quotation Document)</span>
                    <span className="text-[10px] text-slate-400 font-normal">PDF, รูปภาพ หรือ Word</span>
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-[#F28C28] rounded-xl p-3 bg-slate-50/70 hover:bg-orange-50/20 transition-all text-center">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {attachmentName ? (
                      <div className="flex items-center justify-between gap-2 text-xs bg-white p-2 rounded-lg border border-orange-200 shadow-2xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <Paperclip className="w-4 h-4 text-[#F28C28] shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{attachmentName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachmentName('');
                          }}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-rose-50"
                        >
                          ✕ ลบไฟล์
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-1 text-xs text-slate-500">
                        <Upload className="w-4 h-4 text-[#F28C28]" />
                        <span className="font-medium text-slate-700">คลิกเพื่ออัปโหลดไฟล์ใบเสนอราคา (PDF / รูปภาพหลักฐาน)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="เงื่อนไขการเสนอราคา" icon={Truck}>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ระยะเวลาส่งมอบ (วัน)</label>
                    <input type="number" min={1} value={deliveryDays} onChange={(e) => setDeliveryDays(Number(e.target.value))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ยืนราคาถึงวันที่</label>
                    <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">เงื่อนไขชำระเงิน</label>
                    <input value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} className={inputCls} placeholder="เช่น Credit 30 วัน" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">การรับประกัน</label>
                    <input value={warranty} onChange={(e) => setWarranty(e.target.value)} className={inputCls} placeholder="เช่น อายุยา ≥ 2 ปี" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ประเมินคุณภาพ / ความน่าเชื่อถือ</label>
                  <StarInput value={qualityScore} onChange={setQualityScore} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ</label>
                  <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputCls} />
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-3">
            <SectionCard title={`ราคาที่เสนอรายรายการ (${selectedRfq?.lines?.length || 0})`} icon={Package} className="h-full">
              {!selectedRfq ? (
                <div className="text-center text-xs text-slate-400 py-10">เลือก RFQ เพื่อแสดงรายการสินค้า</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="text-[11px] text-slate-500 border-b">
                    <tr>
                      <th className="py-2 text-left">สินค้า</th>
                      <th className="py-2 text-right">จำนวน</th>
                      <th className="py-2 text-right">ราคากลาง</th>
                      <th className="py-2 text-right w-28">ราคาเสนอ/หน่วย *</th>
                      <th className="py-2 text-left w-28 pl-2">ยี่ห้อ</th>
                      <th className="py-2 text-right">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRfq.lines.map((l: any) => {
                      const p = prices[l.id] || { unitPrice: 0, brand: '' };
                      const over = p.unitPrice > 0 && l.estimatedUnitPrice > 0 && p.unitPrice > l.estimatedUnitPrice;
                      return (
                        <tr key={l.id}>
                          <td className="py-2 pr-2">
                            <div className="font-semibold text-[#14213D]">{l.item?.itemName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{l.item?.itemCode}</div>
                          </td>
                          <td className="py-2 text-right tabular-nums whitespace-nowrap">
                            {l.quantity} {l.item?.unit}
                          </td>
                          <td className="py-2 text-right tabular-nums text-slate-400">฿{fmtMoney(l.estimatedUnitPrice)}</td>
                          <td className="py-2 pl-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={p.unitPrice || ''}
                              onChange={(e) =>
                                setPrices({ ...prices, [l.id]: { ...p, unitPrice: Number(e.target.value) } })
                              }
                              className={`${inputCls} text-right font-semibold ${over ? 'ring-1 ring-rose-300 text-rose-600' : ''}`}
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-2 pl-2">
                            <input
                              value={p.brand}
                              onChange={(e) => setPrices({ ...prices, [l.id]: { ...p, brand: e.target.value } })}
                              className={inputCls}
                              placeholder="-"
                            />
                          </td>
                          <td className="py-2 text-right tabular-nums font-bold text-[#14213D] whitespace-nowrap">
                            ฿{fmtMoney((p.unitPrice || 0) * l.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </SectionCard>
          </div>
        </div>
      </ModalShell>

      {/* ---------------- Detail Modal ---------------- */}
      <ModalShell
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.quotationNumber} • ${detail.supplier?.name}` : ''}
        subtitle={
          detail && (
            <span className="flex items-center gap-2 flex-wrap">
              <QuotationStatus status={detail.status} />
              <span className="font-mono">RFQ {detail.rfq?.rfqNumber}</span>
              {detail.rfq?.prNumber && <span className="font-mono">• PR {detail.rfq.prNumber}</span>}
            </span>
          )
        }
        icon={Receipt}
        size="lg"
        footer={
          detail && (
            <>
              <button type="button" onClick={() => setDetail(null)} className={btnSecondary}>
                ปิดหน้าต่าง
              </button>
              <Link href={`/procurement/comparison?rfqId=${detail.rfqId}`} className={btnSuccess}>
                <Scale className="w-4 h-4" /> ดูตารางเปรียบเทียบ
              </Link>
            </>
          )
        }
      >
        {detail && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'ยอดเสนอราคารวม', value: `฿${fmtMoney(detail.totalAmount)}` },
                { label: 'ระยะเวลาส่งมอบ', value: `${detail.deliveryDays} วัน` },
                { label: 'เงื่อนไขชำระเงิน', value: detail.paymentTerm || '-' },
                { label: 'ยืนราคาถึง', value: fmtDate(detail.validUntil) },
              ].map((c) => (
                <div key={c.label} className="bg-white p-3.5 rounded-2xl border border-[#E2EAF4]">
                  <div className="text-[11px] text-slate-500">{c.label}</div>
                  <div className="font-bold text-[#14213D] text-sm mt-0.5 truncate">{c.value}</div>
                </div>
              ))}
            </div>

            {detail.attachmentName && (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-950">เอกสารใบเสนอราคาต้นฉบับของผู้ขาย:</div>
                    <div className="text-[11px] font-mono text-blue-800 flex items-center gap-1.5 mt-0.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold">{detail.attachmentName}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={detail.attachmentUrl || `/attachments/${detail.attachmentName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>เปิดดูเอกสาร</span>
                </a>
              </div>
            )}

            <SectionCard title="รายการราคาที่เสนอ" icon={Package}>
              <table className="w-full text-xs">
                <thead className="text-[11px] text-slate-500 border-b">
                  <tr>
                    <th className="py-2 text-left">สินค้า</th>
                    <th className="py-2 text-left">ยี่ห้อ</th>
                    <th className="py-2 text-right">จำนวน</th>
                    <th className="py-2 text-right">ราคา/หน่วย</th>
                    <th className="py-2 text-right">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.lines?.map((l: any) => (
                    <tr key={l.id}>
                      <td className="py-2">
                        <div className="font-semibold text-[#14213D]">{l.item?.itemName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{l.item?.itemCode}</div>
                      </td>
                      <td className="py-2 text-slate-600">{l.brand || '-'}</td>
                      <td className="py-2 text-right tabular-nums">
                        {l.quantity} {l.item?.unit}
                      </td>
                      <td className="py-2 text-right tabular-nums">฿{fmtMoney(l.unitPrice)}</td>
                      <td className="py-2 text-right tabular-nums font-semibold">฿{fmtMoney(l.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
            <div className="text-xs text-slate-500 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>การรับประกัน: <span className="text-[#14213D] font-medium">{detail.warranty || '-'}</span></div>
              <div>คะแนนคุณภาพ: <span className="text-[#14213D] font-medium">{detail.qualityScore > 0 ? `${detail.qualityScore}/5` : '-'}</span></div>
              <div>บันทึกโดย: <span className="text-[#14213D] font-medium">{detail.createdBy}</span></div>
              {detail.remarks && <div className="sm:col-span-3">หมายเหตุ: <span className="text-[#14213D]">{detail.remarks}</span></div>}
            </div>
          </>
        )}
      </ModalShell>
    </div>
  );
}

export default function QuotationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลด...</div>}>
      <QuotationsContent />
    </Suspense>
  );
}
