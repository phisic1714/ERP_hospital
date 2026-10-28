'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@erp/app-context';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building,
  UserCheck,
  Eye,
  Copy,
  Printer,
  X,
  Layers,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '@erp/ui';

export default function ApprovalCenterPage() {
  const { currentUser, addToast, refreshKey, triggerRefresh } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Full-screen Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDocDetail, setSelectedDocDetail] = useState<any | null>(null);

  // Comment modal for approval/rejection
  const [selectedActionItem, setSelectedActionItem] = useState<{
    item: any;
    action: 'APPROVE' | 'REJECT';
  } | null>(null);
  const [comment, setComment] = useState('');

  const loadData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (moduleFilter !== 'ALL') params.set('module', moduleFilter);

    fetch(`/api/approvals?${params.toString()}`)
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
  }, [moduleFilter, refreshKey]);

  const handleConfirmAction = async () => {
    if (!selectedActionItem) return;
    const { item, action } = selectedActionItem;

    try {
      let endpoint = '';
      if (item.module === 'ISSUE') {
        endpoint = `/api/issues/${item.id}/approve`;
      } else if (item.module === 'TRANSFER') {
        endpoint = `/api/transfers/${item.id}/approve`;
      } else if (item.module === 'ADJUSTMENT') {
        endpoint = `/api/adjustments/${item.id}/approve`;
      } else if (item.module === 'GR') {
        endpoint = `/api/receiving/${item.id}/post`;
      } else if (item.module === 'PR') {
        endpoint = `/api/procurement/requisitions/${item.id}/approve`;
      } else {
        throw new Error('Unsupported module');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userName: currentUser.name,
          comment: comment || (action === 'APPROVE' ? 'อนุมัติผ่านศูนย์อนุมัติ' : 'ไม่อนุมัติ'),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed');

      addToast(
        'success',
        `${action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}เอกสาร ${item.documentNumber} เรียบร้อยแล้ว`
      );
      setSelectedActionItem(null);
      setComment('');
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    return (
      item.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.requester.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#2563EB]" />
            ศูนย์อนุมัติเอกสารและตรวจสอบธุรกรรม (Approval Center)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            รวมศูนย์เอกสารรออนุมัติทุกโมดูล (ใบเบิกพัสดุ, โอนย้ายคลัง, ปรับยอดสต็อก, และตรวจรับเข้าคลัง)
          </p>
        </div>

        <button
          onClick={() => triggerRefresh()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAF4] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่เอกสาร, ผู้ขอ, หรือแผนก..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'ทั้งหมด (All)', color: 'blue' },
              { id: 'PR', label: 'ใบขอซื้อ (PR)', color: 'orange' },
              { id: 'ISSUE', label: 'ใบขอเบิก (Issue)', color: 'blue' },
              { id: 'TRANSFER', label: 'ใบโอนย้าย (Transfer)', color: 'blue' },
              { id: 'ADJUSTMENT', label: 'ใบปรับยอด (Adjustment)', color: 'blue' },
              { id: 'GR', label: 'ใบรับสินค้า (GR)', color: 'blue' },
            ].map((tab) => {
              const isSelected = moduleFilter === tab.id;
              let activeClass = 'bg-[#2563EB] text-white font-semibold shadow-xs';
              if (isSelected && tab.color === 'orange') {
                activeClass = 'bg-[#F28C28] text-white font-semibold shadow-xs';
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setModuleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    isSelected
                      ? activeClass
                      : 'bg-[#F5F8FC] hover:bg-slate-200 text-[#64748B] border border-[#E2EAF4]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">เลขที่เอกสาร</th>
                <th className="py-3 px-3">ประเภทเอกสาร</th>
                <th className="py-3 px-3">ผู้ยื่นคำขอ</th>
                <th className="py-3 px-3">แผนก / เส้นทาง</th>
                <th className="py-3 px-3">วันที่ยื่น</th>
                <th className="py-3 px-3">รายละเอียดสินค้า</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การตัดสินใจ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#94A3B8]">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#2563EB] mb-2" />
                    กำลังดึงรายการรออนุมัติ...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#94A3B8]">
                    ไม่มีรายการเอกสารค้างรอการอนุมัติในระบบ
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isPR = item.module === 'PR';
                  return (
                    <tr key={item.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDocDetail(item);
                            setShowDetailModal(true);
                          }}
                          className={`font-mono font-bold hover:underline ${
                            isPR
                              ? 'text-[#F28C28] hover:text-[#D97706]'
                              : 'text-[#2563EB] hover:text-[#164EAB]'
                          }`}
                          title="คลิกเพื่อตรวจดูรายละเอียดเอกสารและรายการพัสดุแบบเต็มจอ"
                        >
                          {item.documentNumber}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-medium whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isPR
                              ? 'bg-orange-50 text-[#F28C28] border-orange-200'
                              : 'bg-blue-50 text-[#2563EB] border-blue-200'
                          }`}
                        >
                          {item.typeLabel}
                        </span>
                      </td>
                    <td className="py-3 px-3 text-[#334155] whitespace-nowrap">
                      {item.requester}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                      {item.department}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 text-[#64748B] max-w-[240px] truncate" title={item.details}>
                      {item.details}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedActionItem({ item, action: 'REJECT' })}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ปฏิเสธ</span>
                        </button>
                        <button
                          onClick={() => setSelectedActionItem({ item, action: 'APPROVE' })}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>อนุมัติ (Approve)</span>
                        </button>
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

      {/* Confirmation & Comment Modal */}
      {selectedActionItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-md w-full p-6 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <h3 className="text-base font-bold text-[#14213D] flex items-center gap-2">
                {selectedActionItem.action === 'APPROVE' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                {selectedActionItem.action === 'APPROVE' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}
              </h3>
              <button
                onClick={() => setSelectedActionItem(null)}
                className="text-[#94A3B8] hover:text-[#64748B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#64748B] space-y-1">
              <div>เลขที่เอกสาร: <span className="font-bold font-mono text-[#14213D]">{selectedActionItem.item.documentNumber}</span></div>
              <div>ประเภท: <span className="font-semibold text-[#14213D]">{selectedActionItem.item.typeLabel}</span></div>
              <div>ผู้ยื่นคำขอ: <span className="font-medium text-[#14213D]">{selectedActionItem.item.requester}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                ความเห็นผู้อนุมัติ (Approval Comment)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ระบุความเห็นหรือคำสั่งการ..."
                className="w-full text-xs p-2.5 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2EAF4]">
              <button
                type="button"
                onClick={() => setSelectedActionItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-sm ${
                  selectedActionItem.action === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                ยืนยันการ{selectedActionItem.action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Document Detail & Inspection Modal */}
      {showDetailModal && selectedDocDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 ${
                    selectedDocDetail.module === 'PR'
                      ? 'bg-orange-50 border border-orange-100 text-[#F28C28]'
                      : 'bg-blue-50 border border-blue-100 text-[#2563EB]'
                  }`}
                >
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Document Number Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedDocDetail.documentNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedDocDetail.documentNumber);
                          addToast('info', `คัดลอกเลขที่เอกสาร ${selectedDocDetail.documentNumber} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกเลขที่เอกสาร"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="bg-slate-100 text-[#475569] border border-slate-200/80 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {selectedDocDetail.typeLabel}
                    </span>

                    <StatusBadge status={selectedDocDetail.status} />
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      ศูนย์ตรวจสอบรายละเอียดเอกสารและพิจารณาอนุมัติ
                    </h2>
                    <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                      (Document Review & Approval Inspection)
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
                  title="พิมพ์เอกสารเพื่อตรวจสอบ"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

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
              {/* 4 Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    ประเภทเอกสาร
                  </span>
                  <div className="text-base font-bold text-[#14213D] mt-1">
                    {selectedDocDetail.typeLabel}
                  </div>
                  <div className="text-[11px] text-[#2563EB] mt-1 font-mono">
                    Module: {selectedDocDetail.module}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    ผู้ยื่นคำขออนุมัติ
                  </span>
                  <div className="text-base font-bold text-[#14213D] mt-1">
                    {selectedDocDetail.requester}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    วันที่: {new Date(selectedDocDetail.date).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                    หน่วยงาน / เส้นทาง
                  </span>
                  <div className="text-base font-bold text-[#14213D] mt-1">
                    {selectedDocDetail.department}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    {selectedDocDetail.sourceWarehouse ? `คลังต้นทาง: ${selectedDocDetail.sourceWarehouse}` : 'โรงพยาบาล'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                    จำนวนรวมพัสดุในคำขอ
                  </span>
                  <div className="text-xl font-bold text-purple-700 mt-1 tabular-nums">
                    {selectedDocDetail.totalQty?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">หน่วย</span>
                  </div>
                  <div className="text-[11px] text-purple-600 mt-1">
                    ทั้งหมด {selectedDocDetail.itemsCount || selectedDocDetail.lines?.length || 0} รายการ
                  </div>
                </div>
              </div>

              {/* Justification / Remark Callout Banner */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-blue-900 block">วัตถุประสงค์ / หมายเหตุประกอบการยื่นขอ:</span>
                  <p className="text-blue-800 mt-0.5">
                    {selectedDocDetail.remark || 'ไม่มีการระบุหมายเหตุเพิ่มเติม ยื่นคำขอตามกระบวนการปกติของระบบ ERP'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#14213D]">
                      รายการพัสดุและเวชภัณฑ์ในเอกสาร ({selectedDocDetail.lines?.length || selectedDocDetail.itemsCount || 0} รายการ)
                    </h3>
                  </div>
                  <span className="text-xs text-[#64748B] font-mono">
                    REF: {selectedDocDetail.documentNumber}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-[#334155] border-b border-[#E2EAF4] uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-3">รหัส / รายการพัสดุ</th>
                        <th className="py-3 px-3 text-right">จำนวนที่ขอ</th>
                        <th className="py-3 px-3 text-right">หน่วยนับ</th>
                        {selectedDocDetail.module === 'PR' && (
                          <>
                            <th className="py-3 px-3 text-right">ราคาประเมิน</th>
                            <th className="py-3 px-3 text-right">รวมเงิน (บาท)</th>
                          </>
                        )}
                        {selectedDocDetail.module === 'ADJUSTMENT' && (
                          <th className="py-3 px-3 text-right">การปรับยอด (+/-)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDocDetail.lines && selectedDocDetail.lines.length > 0 ? (
                        selectedDocDetail.lines.map((line: any, idx: number) => (
                          <tr key={line.id || idx} className="hover:bg-[#F5F8FC] transition-colors">
                            <td className="py-3 px-4 text-center font-mono text-[#94A3B8]">{idx + 1}</td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-[#14213D]">{line.item?.itemName}</div>
                              <div className="text-[11px] font-mono text-[#2563EB]">{line.item?.itemCode}</div>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">
                              {(line.requestedQty || line.receivedQty || line.adjustmentQty || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right text-[#64748B]">
                              {line.unit || line.item?.unit || 'ชิ้น'}
                            </td>
                            {selectedDocDetail.module === 'PR' && (
                              <>
                                <td className="py-3 px-3 text-right text-[#64748B] tabular-nums">
                                  ฿{(line.estimatedUnitPrice || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">
                                  ฿{(line.estimatedTotal || (line.requestedQty * line.estimatedUnitPrice) || 0).toLocaleString()}
                                </td>
                              </>
                            )}
                            {selectedDocDetail.module === 'ADJUSTMENT' && (
                              <td className="py-3 px-3 text-right font-bold tabular-nums">
                                <span className={line.adjustmentQty >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                  {line.adjustmentQty >= 0 ? `+${line.adjustmentQty}` : line.adjustmentQty}
                                </span>
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 px-4 text-[#64748B]">
                            {selectedDocDetail.details || 'ไม่มีรายละเอียดเพิ่มเติม'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Approval Decision Card inside Modal */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span>การพิจารณาอนุมัติคำขอ (Supervisor Sign-off)</span>
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    ผู้อนุมัติปัจจุบัน: <strong className="text-[#14213D]">{currentUser.name}</strong> • ตรวจสอบความถูกต้องก่อนลงนาม
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedActionItem({ item: selectedDocDetail, action: 'REJECT' });
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-rose-200"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>ไม่อนุมัติ / ปฏิเสธ (Reject)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedActionItem({ item: selectedDocDetail, action: 'APPROVE' });
                      setShowDetailModal(false);
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>อนุมัติคำขอ (Approve)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-4 border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-[#64748B] flex items-center gap-4">
                <span>เลขที่เอกสาร: <strong className="font-mono text-[#14213D]">{selectedDocDetail.documentNumber}</strong></span>
                <span>จำนวน: <strong>{selectedDocDetail.itemsCount || selectedDocDetail.lines?.length || 0}</strong> รายการ</span>
                <span>สถานะ: <strong className="text-amber-600">รอการอนุมัติ</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-[#E2EAF4] hover:bg-slate-100 text-[#334155] rounded-xl text-xs font-semibold transition-colors"
                >
                  ปิดหน้าต่าง (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
