'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from '@erp/ui/navigation';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@erp/app-context';
import { StatusBadge } from '@erp/ui';
import {
  SourcingHeader,
  StatCard,
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
  Scale,
  Trophy,
  CheckCircle2,
  DollarSign,
  Clock,
  Star,
  FileSearch,
  ShoppingCart,
  Building2,
  Package,
  Sparkles,
  AlertCircle,
  Truck,
  ShieldCheck,
  FileText,
  Plus,
  Paperclip,
  Eye,
} from 'lucide-react';

function ComparisonContent() {
  const searchParams = useSearchParams();
  const rfqIdParam = searchParams.get('rfqId') || '';
  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Award modal
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [candidateQuoteId, setCandidateQuoteId] = useState<string>('');
  const [criteria, setCriteria] = useState<'LOWEST_PRICE' | 'BEST_VALUE' | 'FASTEST_DELIVERY' | 'QUALITY'>('LOWEST_PRICE');
  const [reason, setReason] = useState<string>('');
  const [submittingAward, setSubmittingAward] = useState(false);

  // Create PO modal
  const [showPoModal, setShowPoModal] = useState(false);
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [poRemarks, setPoRemarks] = useState<string>('');
  const [submittingPo, setSubmittingPo] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/procurement/rfqs')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRfqs(data);
          if (!selectedRfqId && data.length > 0) {
            const preset = rfqIdParam ? data.find((r) => r.id === rfqIdParam) : null;
            const fallback = data.find((r) => (r.quotations?.length || 0) > 0) || data[0];
            setSelectedRfqId(preset?.id || fallback?.id || '');
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    if (rfqIdParam) {
      setSelectedRfqId(rfqIdParam);
    }
  }, [rfqIdParam]);

  const activeRfq = useMemo(() => rfqs.find((r) => r.id === selectedRfqId) || null, [rfqs, selectedRfqId]);

  const quotations: any[] = useMemo(() => {
    if (!activeRfq?.quotations) return [];
    return activeRfq.quotations.filter((q: any) => q.status !== 'CANCELLED');
  }, [activeRfq]);

  // Reference / estimated total from PR / RFQ lines
  const estimatedTotal = useMemo(() => {
    if (!activeRfq?.lines) return 0;
    return activeRfq.lines.reduce(
      (sum: number, l: any) => sum + (Number(l.quantity) || 0) * (Number(l.estimatedUnitPrice) || 0),
      0
    );
  }, [activeRfq]);

  // Sourcing metrics
  const minPrice = useMemo(() => {
    if (quotations.length === 0) return 0;
    return Math.min(...quotations.map((q) => q.totalAmount || 0));
  }, [quotations]);

  const minDelivery = useMemo(() => {
    if (quotations.length === 0) return 0;
    return Math.min(...quotations.map((q) => q.deliveryDays || 999));
  }, [quotations]);

  const maxQuality = useMemo(() => {
    if (quotations.length === 0) return 0;
    return Math.max(...quotations.map((q) => q.qualityScore || 0));
  }, [quotations]);

  const winnerQuote = useMemo(() => {
    if (!activeRfq?.selectedQuotationId) return null;
    return quotations.find((q) => q.id === activeRfq.selectedQuotationId) || null;
  }, [activeRfq, quotations]);

  // Open Award modal with default pre-fill
  const handleOpenAward = (quoteId?: string) => {
    const qid = quoteId || quotations[0]?.id || '';
    setCandidateQuoteId(qid);
    const targetQ = quotations.find((q) => q.id === qid);
    if (targetQ) {
      if (targetQ.totalAmount === minPrice) {
        setCriteria('LOWEST_PRICE');
        setReason(`เสนอราคาต่ำสุดที่ ฿${fmtMoney(targetQ.totalAmount)} (ประหยัดงบประมาณ ${(((estimatedTotal - targetQ.totalAmount) / (estimatedTotal || 1)) * 100).toFixed(1)}%) ถูกต้องตามข้อกำหนด`);
      } else if (targetQ.deliveryDays === minDelivery) {
        setCriteria('FASTEST_DELIVERY');
        setReason(`สามารถส่งมอบสินค้าได้เร็วที่สุดภายใน ${targetQ.deliveryDays} วัน เพื่อตอบสนองความต้องการด่วน`);
      } else {
        setCriteria('BEST_VALUE');
        setReason(`คุณภาพและความพร้อมในการส่งมอบเหมาะสมที่สุดตามเงื่อนไขของโรงพยาบาล`);
      }
    }
    setShowAwardModal(true);
  };

  const handleSaveAward = async () => {
    if (!activeRfq) return;
    if (!candidateQuoteId) return addToast('error', 'กรุณาเลือกใบเสนอราคาที่ชนะ');
    if (!reason.trim()) return addToast('error', 'กรุณาระบุเหตุผลการคัดเลือก');

    setSubmittingAward(true);
    try {
      const res = await fetch(`/api/procurement/rfqs/${activeRfq.id}/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotationId: candidateQuoteId,
          criteria,
          reason,
          userName: currentUser.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกผลการคัดเลือกไม่สำเร็จ');

      addToast('success', 'บันทึกผลการคัดเลือกผู้ชนะเรียบร้อยแล้ว');
      setShowAwardModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setSubmittingAward(false);
    }
  };

  const handleOpenCreatePo = () => {
    if (!winnerQuote) return;
    const days = winnerQuote.deliveryDays || 7;
    setExpectedDate(new Date(Date.now() + days * 86400000).toISOString().slice(0, 10));
    setPoRemarks(`สร้างจากผลเปรียบเทียบราคา ${activeRfq?.rfqNumber} (ใบเสนอราคา ${winnerQuote.quotationNumber})`);
    setShowPoModal(true);
  };

  const handleCreatePo = async () => {
    if (!activeRfq) return;
    setSubmittingPo(true);
    try {
      const res = await fetch(`/api/procurement/rfqs/${activeRfq.id}/create-po`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedDate: expectedDate || null,
          remarks: poRemarks,
          createdBy: currentUser.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สร้างใบสั่งซื้อไม่สำเร็จ');

      addToast(
        'success',
        `สร้างใบสั่งซื้อ ${data.po?.poNumber} สำเร็จแล้ว (สถานะ: รออนุมัติ PO ที่หน้าใบสั่งซื้อ)`
      );
      setShowPoModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setSubmittingPo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SourcingHeader
        crumb="เปรียบเทียบใบเสนอราคา"
        title="เปรียบเทียบใบเสนอราคา (Quotation Comparison)"
        subtitle="เปรียบเทียบราคา คุณภาพ เงื่อนไข และระยะเวลาส่งมอบ พร้อมบันทึกผลการคัดเลือกผู้ชนะและออกใบสั่งซื้อ (PO)"
        icon={Scale}
        onRefresh={triggerRefresh}
        actions={
          activeRfq &&
          quotations.length > 0 &&
          activeRfq.status !== 'PO_CREATED' && (
            <button
              type="button"
              onClick={() => handleOpenAward()}
              className={btnPrimary}
            >
              <Trophy className="w-4 h-4" />
              <span>{activeRfq.status === 'AWARDED' ? 'ปรับเปลี่ยนผู้ชนะ' : 'บันทึกผลคัดเลือกผู้ชนะ'}</span>
            </button>
          )
        }
      />

      {/* Select RFQ bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28] shrink-0">
            <FileSearch className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              เลือกคำขอใบเสนอราคา (RFQ) เพื่อเปรียบเทียบ
            </label>
            <select
              value={selectedRfqId}
              onChange={(e) => setSelectedRfqId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-1.5 border border-[#E2EAF4] rounded-lg bg-[#F5F8FC] focus:bg-white text-[#14213D] focus:ring-2 focus:ring-[#F28C28]"
            >
              {rfqs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.rfqNumber} • {r.title} ({r.quotations?.filter((q: any) => q.status !== 'CANCELLED').length || 0} ใบเสนอราคา) [{r.status}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeRfq && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <StatusBadge status={activeRfq.status} />
            {activeRfq.prNumber && (
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                PR: {activeRfq.prNumber}
              </span>
            )}
            <Link
              href={`/procurement/quotations?rfqId=${activeRfq.id}`}
              className="text-xs font-semibold text-[#F28C28] hover:underline px-2 py-1 rounded-lg hover:bg-orange-50 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มใบเสนอราคา</span>
            </Link>
          </div>
        )}
      </div>

      {/* Sourcing Summary Cards */}
      {activeRfq && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="ราคากลางประเมิน (PR)"
            value={`฿${fmtMoney(estimatedTotal)}`}
            hint={`${activeRfq.lines?.length || 0} รายการพัสดุ`}
            icon={DollarSign}
            tone="slate"
          />
          <StatCard
            label="ราคาต่ำสุดที่เสนอ"
            value={minPrice > 0 ? `฿${fmtMoney(minPrice)}` : '-'}
            hint={
              minPrice > 0 && estimatedTotal > 0
                ? minPrice < estimatedTotal
                  ? `ประหยัด ฿${fmtMoney(estimatedTotal - minPrice)} (${(((estimatedTotal - minPrice) / estimatedTotal) * 100).toFixed(1)}%)`
                  : 'สูงกว่าราคากลาง'
                : 'ไม่มีข้อเสนอ'
            }
            icon={minPrice > 0 && minPrice <= estimatedTotal ? Sparkles : AlertCircle}
            tone={minPrice > 0 && minPrice <= estimatedTotal ? 'emerald' : 'amber'}
          />
          <StatCard
            label="ผู้จำหน่ายที่เสนอราคา"
            value={`${quotations.length} ราย`}
            hint={`จากที่เชิญ ${activeRfq.suppliers?.length || 0} ราย`}
            icon={Building2}
            tone="sky"
          />
          <StatCard
            label="ส่งมอบเร็วที่สุด"
            value={minDelivery < 999 ? `${minDelivery} วัน` : '-'}
            hint={winnerQuote ? `ผู้ชนะ: ${winnerQuote.supplier?.name}` : 'ยังไม่คัดเลือก'}
            icon={Clock}
            tone="violet"
          />
        </div>
      )}

      {/* Awarded Banner & Action */}
      {activeRfq && activeRfq.status === 'AWARDED' && winnerQuote && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <span>คัดเลือกผู้ชนะเรียบร้อยแล้ว</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px]">
                  เกณฑ์: {activeRfq.selectionCriteria}
                </span>
              </div>
              <div className="text-base font-extrabold text-[#14213D] mt-0.5">
                {winnerQuote.supplier?.name} — ฿{fmtMoney(winnerQuote.totalAmount)}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {activeRfq.selectionReason} (โดย {activeRfq.comparedBy || 'คณะกรรมการจัดซื้อ'})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleOpenAward(winnerQuote.id)}
              className={btnSecondary}
            >
              แก้ไขผลคัดเลือก
            </button>
            <button
              type="button"
              onClick={handleOpenCreatePo}
              className={btnSuccess}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>ออกใบสั่งซื้อ (สร้าง PO)</span>
            </button>
          </div>
        </div>
      )}

      {/* PO Created Banner */}
      {activeRfq && activeRfq.status === 'PO_CREATED' && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold">ออกใบสั่งซื้อเรียบร้อยแล้ว: </span>
              <span className="font-mono font-bold">{activeRfq.poNumber || 'PO Created'}</span>
              <span className="text-purple-700 ml-2">สถานะเริ่มต้น: รออนุมัติ PO</span>
            </div>
          </div>
          <Link
            href="/procurement/orders"
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-2xs"
          >
            ไปหน้าใบสั่งซื้อ (PO) →
          </Link>
        </div>
      )}

      {/* Comparison Matrix */}
      {activeRfq && quotations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2EAF4] p-12 text-center text-slate-400">
          <Scale className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-slate-700 text-sm">ยังไม่มีใบเสนอราคาสำหรับ RFQ นี้</div>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            หลังจากส่ง RFQ ให้ผู้จำหน่ายแล้ว สามารถบันทึกใบเสนอราคาที่ได้รับเพื่อนำมาเปรียบเทียบในหน้านี้
          </p>
          <Link
            href={`/procurement/quotations?rfqId=${activeRfq.id}`}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกใบเสนอราคาใบแรก</span>
          </Link>
        </div>
      ) : (
        activeRfq && (
          <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E2EAF4] bg-[#F8FAFC] flex items-center justify-between gap-2">
              <div className="font-bold text-xs text-[#14213D] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#F28C28]" />
                <span>ตารางเปรียบเทียบข้อเสนอ ({quotations.length} ราย)</span>
              </div>
              <span className="text-[11px] text-slate-500">
                ราคากลางประเมินรวม: <span className="font-bold text-[#14213D]">฿{fmtMoney(estimatedTotal)}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#E2EAF4] text-slate-700 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-left min-w-[200px] sticky left-0 bg-[#F5F8FC] z-10">
                      หัวข้อเปรียบเทียบ
                    </th>
                    {quotations.map((q) => {
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      const isLowest = q.totalAmount === minPrice;
                      return (
                        <th
                          key={q.id}
                          className={`py-3 px-4 text-center min-w-[220px] transition-colors ${
                            isWinner ? 'bg-emerald-50/70 border-x border-emerald-200' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {isWinner && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                                <Trophy className="w-3 h-3" /> ผู้ชนะการคัดเลือก
                              </span>
                            )}
                            <div className="font-extrabold text-[#14213D] text-xs truncate max-w-[200px]">
                              {q.supplier?.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {q.quotationNumber} {q.supplierQuoteRef && `(${q.supplierQuoteRef})`}
                            </div>
                            {isLowest && !isWinner && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                                ★ ราคาต่ำสุด
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {/* Row 1: Total Amount */}
                  <tr className="bg-slate-50/50 font-semibold">
                    <td className="py-3 px-4 font-bold text-[#14213D] sticky left-0 bg-slate-50/90 z-10">
                      ยอดเสนอราคารวมทั้งสิ้น
                    </td>
                    {quotations.map((q) => {
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      const isLowest = q.totalAmount === minPrice;
                      const diffEst = estimatedTotal > 0 ? ((q.totalAmount - estimatedTotal) / estimatedTotal) * 100 : 0;
                      return (
                        <td
                          key={q.id}
                          className={`py-3 px-4 text-center ${
                            isWinner ? 'bg-emerald-50/40 border-x border-emerald-200' : ''
                          }`}
                        >
                          <div className={`text-base font-extrabold tabular-nums ${isLowest ? 'text-emerald-700' : 'text-[#14213D]'}`}>
                            ฿{fmtMoney(q.totalAmount)}
                          </div>
                          {estimatedTotal > 0 && (
                            <div
                              className={`text-[10px] font-semibold mt-0.5 ${
                                diffEst <= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {diffEst <= 0 ? '▼ ประหยัด ' : '▲ สูงกว่า '}
                              {Math.abs(diffEst).toFixed(1)}%
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 2: Delivery Days */}
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 sticky left-0 bg-white z-10 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>ระยะเวลาส่งมอบ</span>
                    </td>
                    {quotations.map((q) => {
                      const isFastest = q.deliveryDays === minDelivery;
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-2.5 px-4 text-center ${
                            isWinner ? 'bg-emerald-50/30 border-x border-emerald-200' : ''
                          }`}
                        >
                          <span
                            className={`font-semibold tabular-nums ${
                              isFastest ? 'text-emerald-700 font-bold' : 'text-slate-700'
                            }`}
                          >
                            {q.deliveryDays} วัน
                          </span>
                          {isFastest && <span className="text-[10px] text-emerald-600 ml-1">★ เร็วที่สุด</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 3: Payment Term */}
                  <tr className="bg-slate-50/30">
                    <td className="py-2.5 px-4 text-slate-600 sticky left-0 bg-slate-50/90 z-10 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>เงื่อนไขการชำระเงิน</span>
                    </td>
                    {quotations.map((q) => {
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-2.5 px-4 text-center text-slate-700 ${
                            isWinner ? 'bg-emerald-50/30 border-x border-emerald-200' : ''
                          }`}
                        >
                          {q.paymentTerm || q.supplier?.paymentTerm || '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 4: Warranty */}
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 sticky left-0 bg-white z-10 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>การรับประกัน / อายุสินค้า</span>
                    </td>
                    {quotations.map((q) => {
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-2.5 px-4 text-center text-slate-700 ${
                            isWinner ? 'bg-emerald-50/30 border-x border-emerald-200' : ''
                          }`}
                        >
                          {q.warranty || '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 5: Quality Rating */}
                  <tr className="bg-slate-50/30">
                    <td className="py-2.5 px-4 text-slate-600 sticky left-0 bg-slate-50/90 z-10 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>คะแนนคุณภาพ / ความน่าเชื่อถือ</span>
                    </td>
                    {quotations.map((q) => {
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-2.5 px-4 text-center ${
                            isWinner ? 'bg-emerald-50/30 border-x border-emerald-200' : ''
                          }`}
                        >
                          {q.qualityScore > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {q.qualityScore}/5
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 6: Quotation Document Attachment */}
                  <tr>
                    <td className="py-2.5 px-4 text-slate-600 sticky left-0 bg-white z-10 flex items-center gap-1.5 font-medium">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>เอกสารใบเสนอราคาต้นฉบับ</span>
                    </td>
                    {quotations.map((q) => {
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-2.5 px-4 text-center ${
                            isWinner ? 'bg-emerald-50/30 border-x border-emerald-200' : ''
                          }`}
                        >
                          {q.attachmentName ? (
                            <a
                              href={q.attachmentUrl || `/attachments/${q.attachmentName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-colors"
                              title={q.attachmentName}
                            >
                              <Paperclip className="w-3 h-3 text-blue-600" />
                              <span className="truncate max-w-[120px]">{q.attachmentName}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">ไม่มีเอกสารแนบ</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Section Divider: Item-by-item breakdown */}
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                    <td colSpan={quotations.length + 1} className="py-2 px-4 uppercase tracking-wider">
                      ราคาต่อหน่วยและยอดรวมรายรายการพัสดุ
                    </td>
                  </tr>

                  {activeRfq.lines?.map((line: any, idx: number) => (
                    <tr key={line.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 sticky left-0 bg-white z-10 border-r border-slate-100">
                        <div className="font-semibold text-[#14213D]">
                          {idx + 1}. {line.item?.itemName}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{line.item?.itemCode}</span>
                          <span>•</span>
                          <span>
                            {line.quantity} {line.item?.unit} (ราคากลาง ฿{fmtMoney(line.estimatedUnitPrice)})
                          </span>
                        </div>
                      </td>
                      {quotations.map((q) => {
                        const qline = q.lines?.find((l: any) => l.rfqLineId === line.id || l.itemId === line.itemId);
                        const isWinner = activeRfq.selectedQuotationId === q.id;
                        return (
                          <td
                            key={q.id}
                            className={`py-2.5 px-4 text-center ${
                              isWinner ? 'bg-emerald-50/30 border-x border-emerald-200' : ''
                            }`}
                          >
                            {qline ? (
                              <div>
                                <div className="font-bold text-[#14213D] tabular-nums">
                                  ฿{fmtMoney(qline.unitPrice)}
                                  <span className="text-[10px] text-slate-400 font-normal"> / {line.item?.unit}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 tabular-nums font-semibold">
                                  รวม ฿{fmtMoney(qline.totalAmount)}
                                </div>
                                {qline.brand && (
                                  <div className="text-[9px] text-slate-400 truncate max-w-[150px] mx-auto">
                                    ยี่ห้อ: {qline.brand}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Action Row */}
                  <tr className="bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-700 sticky left-0 bg-slate-50 z-10">
                      การดำเนินการ
                    </td>
                    {quotations.map((q) => {
                      const isWinner = activeRfq.selectedQuotationId === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-3 px-4 text-center ${
                            isWinner ? 'bg-emerald-50/50 border-x border-emerald-200' : ''
                          }`}
                        >
                          {isWinner ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ได้รับคัดเลือก
                            </span>
                          ) : activeRfq.status !== 'PO_CREATED' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAward(q.id)}
                              className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-lg text-xs font-semibold shadow-2xs hover:border-emerald-500 transition-all"
                            >
                              เลือกรายนี้เป็นผู้ชนะ
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ---------------- Modal: Award / Select Winner ---------------- */}
      <ModalShell
        open={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        title="บันทึกผลการคัดเลือกผู้เสนอราคา (Award Sourcing)"
        subtitle="ระบุเกณฑ์และเหตุผลในการคัดเลือกผู้จำหน่ายรายที่ชนะ เพื่อความโปร่งใสและใช้เป็นหลักฐานการจัดซื้อ"
        icon={Trophy}
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setShowAwardModal(false)} className={btnSecondary}>
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={submittingAward}
              onClick={handleSaveAward}
              className={btnPrimary}
            >
              <Trophy className="w-4 h-4" />
              <span>ยืนยันผลการคัดเลือก</span>
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ผู้จำหน่ายที่คัดเลือกเป็นผู้ชนะ *</label>
            <select
              value={candidateQuoteId}
              onChange={(e) => setCandidateQuoteId(e.target.value)}
              className={inputCls}
            >
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.supplier?.name} — ฿{fmtMoney(q.totalAmount)} (ส่งมอบ {q.deliveryDays} วัน)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">เกณฑ์การตัดสิน (Criteria) *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'LOWEST_PRICE', label: 'ราคาต่ำสุด', desc: 'ถูกต้องตามสเปกและเสนอราคาต่ำสุด' },
                { id: 'BEST_VALUE', label: 'คุ้มค่าที่สุด', desc: 'คุณภาพ ราคา และบริการเหมาะสมที่สุด' },
                { id: 'FASTEST_DELIVERY', label: 'ส่งมอบเร็วสุด', desc: 'ตอบสนองความจำเป็นเร่งด่วน' },
                { id: 'QUALITY', label: 'คุณภาพสูงสุด', desc: 'มาตรฐานยา/เวชภัณฑ์และความน่าเชื่อถือ' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCriteria(c.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    criteria === c.id
                      ? 'border-[#F28C28] bg-orange-50/70 text-[#D97706] shadow-2xs'
                      : 'border-[#E2EAF4] hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">{c.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              เหตุผลประกอบการคัดเลือก (สำหรับบันทึกรายงานจัดซื้อ) *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls}
              placeholder="ระบุเหตุผล เช่น เสนอราคาต่ำกว่าราคากลาง 12% คุณสมบัติตรงตามข้อกำหนด..."
            />
          </div>
        </div>
      </ModalShell>

      {/* ---------------- Modal: Create PO from Winner ---------------- */}
      <ModalShell
        open={showPoModal}
        onClose={() => setShowPoModal(false)}
        title="ออกใบสั่งซื้อ (Create PO from Winner)"
        subtitle={
          winnerQuote && (
            <span>
              สร้างใบสั่งซื้อสำหรับ <b>{winnerQuote.supplier?.name}</b> มูลค่า <b>฿{fmtMoney(winnerQuote.totalAmount)}</b> (สถานะ: รออนุมัติ PO)
            </span>
          )
        }
        icon={ShoppingCart}
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setShowPoModal(false)} className={btnSecondary}>
              ยกเลิก
            </button>
            <button
              type="button"
              disabled={submittingPo}
              onClick={handleCreatePo}
              className={btnSuccess}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>ยืนยันสร้างใบสั่งซื้อ (PO)</span>
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 space-y-1">
            <div className="font-bold">ขั้นตอนตามระเบียบจัดซื้อ:</div>
            <div>
              ใบสั่งซื้อ (PO) จะถูกสร้างขึ้นในสถานะ <b>รออนุมัติ (PENDING_APPROVAL)</b> ในระบบ
              เพื่อให้ผู้มีอำนาจอนุมัติลงนามก่อนส่งให้ผู้ขายและส่งเข้าสู่การตรวจรับสินค้า (GR)
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">วันที่คาดว่าจะส่งมอบสินค้า</label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติมในใบสั่งซื้อ</label>
            <textarea
              rows={3}
              value={poRemarks}
              onChange={(e) => setPoRemarks(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </ModalShell>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">กำลังโหลด...</div>}>
      <ComparisonContent />
    </Suspense>
  );
}
