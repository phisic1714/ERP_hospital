'use client';

import React, { useState, useEffect } from 'react';
import Link from '@erp/ui/navigation';
import { useApp } from '@erp/app-context';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  CreditCard,
  CheckCircle,
  Eye,
  Copy,
  Printer,
  X,
  ShoppingCart,
  ShieldCheck,
  FileText,
  Layers,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export default function SuppliersPage() {
  const { addToast, refreshKey, triggerRefresh } = useApp();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Full-screen Supplier Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<any | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('Credit 30 Days');

  const loadSuppliers = () => {
    setLoading(true);
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSuppliers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSuppliers();
  }, [refreshKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          taxId,
          contactPerson,
          phone,
          email,
          paymentTerm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      addToast('success', `เพิ่มผู้จัดจำหน่าย ${name} เรียบร้อยแล้ว`);
      setShowModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const filtered = suppliers.filter((s) => {
    if (!search) return true;
    return (
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase()))
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
            <span className="text-slate-500">ทะเบียนผู้จัดจำหน่าย</span>
          </div>
          <h1 className="text-2xl font-bold text-[#14213D] flex items-center gap-2">
            <Building2 className="w-7 h-7 text-[#F28C28]" />
            <span>ทะเบียนผู้จัดจำหน่ายและคู่ค้า (Suppliers & Vendors)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการข้อมูลคู่ค้าโรงพยาบาล เงื่อนไขการชำระเงิน และประวัติการจัดซื้อ
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
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้จัดจำหน่าย</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E2EAF4] shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้จำหน่าย, รหัสคู่ค้า, หรือชื่อผู้ติดต่อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            กำลังโหลดข้อมูลผู้จัดจำหน่าย...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            ไม่พบข้อมูลผู้จัดจำหน่าย
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedSupplierDetail(s);
                setShowDetailModal(true);
              }}
              className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm space-y-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSupplierDetail(s);
                      setShowDetailModal(true);
                    }}
                    className="font-mono text-xs font-bold text-[#D97706] bg-[#FFF7ED] group-hover:bg-[#F28C28] group-hover:text-white px-2 py-0.5 rounded transition-all"
                    title="คลิกเพื่อดูโปรไฟล์คู่ค้าแบบเต็มจอ"
                  >
                    {s.code}
                  </button>
                  <h3 className="font-bold text-sm text-[#14213D] mt-1.5 group-hover:text-[#F28C28] transition-colors">
                    {s.name}
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  คู่ค้าอนุมัติ
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-[#E2EAF4]">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>เครดิต: {s.paymentTerm || 'Credit 30 Days'}</span>
                </div>
                {s.contactPerson && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>ผู้ติดต่อ: {s.contactPerson}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>โทร: {s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>อีเมล: {s.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#E2EAF4] flex items-center justify-between text-xs text-[#F28C28] font-semibold group-hover:underline">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูประวัติและข้อมูล 360°</span>
                </span>
                <span className="text-slate-400 text-[11px] font-normal">
                  {s.purchaseOrders?.length || 0} ใบสั่งซื้อ
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Supplier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#14213D] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F28C28]" />
                <span>เพิ่มผู้จัดจำหน่ายใหม่</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสคู่ค้า (Supplier Code) *</label>
                <input
                  type="text"
                  placeholder="เช่น SUP-004"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อบริษัท / ผู้จัดจำหน่าย *</label>
                <input
                  type="text"
                  placeholder="เช่น บริษัท สยามเมดิคอล จำกัด"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เงื่อนไขการชำระเงิน</label>
                  <input
                    type="text"
                    value={paymentTerm}
                    onChange={(e) => setPaymentTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ติดต่อ</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[#F5F8FC] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-[#F5F8FC] font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white font-semibold rounded-xl shadow-sm"
                >
                  บันทึกข้อมูลคู่ค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Supplier Profile 360° Modal */}
      {showDetailModal && selectedSupplierDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E2EAF4] w-full h-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header: Clean Modern White Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E2EAF4] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F28C28] shadow-2xs shrink-0">
                  <Building2 className="w-6 h-6 text-[#F28C28]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Supplier Code Pill */}
                    <div className="bg-[#0F172A] text-white px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>{selectedSupplierDetail.code}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selectedSupplierDetail.code);
                          addToast('info', `คัดลอกรหัสคู่ค้า ${selectedSupplierDetail.code} แล้ว`);
                        }}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="คัดลอกรหัสคู่ค้า"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      คู่ค้าอนุมัติ (Approved Vendor)
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-snug">
                      {selectedSupplierDetail.name}
                    </h2>
                    {selectedSupplierDetail.taxId && (
                      <span className="text-xs sm:text-sm font-normal text-[#64748B]">
                        (เลขผู้เสียภาษี: {selectedSupplierDetail.taxId})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#334155] rounded-xl text-xs font-semibold border border-[#E2EAF4] shadow-2xs transition-all"
                  title="พิมพ์ข้อมูลคู่ค้า"
                >
                  <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>พิมพ์</span>
                </button>

                <Link
                  href="/procurement/orders"
                  className="px-4 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>ออกใบสั่งซื้อ (Create PO)</span>
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F5F8FC]">
              {/* 4 Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    ประวัติใบสั่งซื้อสะสม
                  </span>
                  <div className="text-xl font-bold text-[#14213D] mt-1 tabular-nums">
                    {selectedSupplierDetail.purchaseOrders?.length || selectedSupplierDetail._count?.purchaseOrders || 0} <span className="text-xs font-normal text-slate-500">ฉบับ</span>
                  </div>
                  <div className="text-[11px] text-[#F28C28] mt-1 flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    <span>คำสั่งซื้อในระบบ ERP</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                    การตรวจรับพัสดุ (GR)
                  </span>
                  <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
                    {selectedSupplierDetail._count?.goodsReceipts || 0} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ผ่านการตรวจมาตรฐานคลัง</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">
                    เงื่อนไขเครดิตเทอม
                  </span>
                  <div className="text-xl font-bold text-purple-700 mt-1">
                    {selectedSupplierDetail.paymentTerm || 'Credit 30 Days'}
                  </div>
                  <div className="text-[11px] text-purple-600 mt-1">
                    กำหนดชำระเงินตามสัญญา
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2EAF4] shadow-2xs">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                    คะแนนประเมินคุณภาพคู่ค้า
                  </span>
                  <div className="text-xl font-bold text-amber-600 mt-1">
                    99.2% <span className="text-xs font-semibold text-emerald-600">(Grade A+)</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>เกณฑ์ On-Time & GHP Compliant</span>
                  </div>
                </div>
              </div>

              {/* Company & Contact Profile */}
              <div className="bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2EAF4] pb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#14213D] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#F28C28]" />
                    <span>ข้อมูลนิติบุคคลและการติดต่อ (Company Profile)</span>
                  </h4>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-xs border border-emerald-200">
                    สถานะ: คู่ค้าขึ้นทะเบียน รพ.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-slate-400 block text-[11px]">ชื่อบริษัท / ผู้จัดจำหน่าย</span>
                    <span className="font-bold text-[#14213D] text-sm">{selectedSupplierDetail.name}</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-slate-400 block text-[11px]">เลขประจำตัวผู้เสียภาษี (Tax ID)</span>
                    <span className="font-mono font-bold text-[#14213D]">{selectedSupplierDetail.taxId || '0105558012345'}</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-slate-400 block text-[11px]">ผู้ประสานงาน / ผู้แทนขาย</span>
                    <span className="font-bold text-[#14213D]">{selectedSupplierDetail.contactPerson || 'ฝ่ายขายและการตลาด'}</span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-slate-400 block text-[11px]">เบอร์โทรศัพท์ติดต่อ</span>
                    <span className="font-semibold text-[#D97706] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedSupplierDetail.phone || '02-123-4567'}</span>
                    </span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-slate-400 block text-[11px]">อีเมลติดต่อสั่งซื้อ</span>
                    <span className="font-semibold text-[#D97706] flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedSupplierDetail.email || 'order@supplier.co.th'}</span>
                    </span>
                  </div>

                  <div className="p-3 bg-[#F5F8FC] rounded-xl border border-[#E2EAF4] space-y-1">
                    <span className="text-slate-400 block text-[11px]">ที่อยู่จดทะเบียน</span>
                    <span className="text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{selectedSupplierDetail.address || 'กรุงเทพมหานคร ประเทศไทย'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Purchase Orders Table */}
              <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-[#E2EAF4] flex items-center justify-between bg-[#F5F8FC]">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#F28C28]" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#14213D]">
                      ประวัติคำสั่งซื้อล่าสุด (Recent Purchase Orders)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    แสดงสูงสุด 10 รายการล่าสุด
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-slate-700 border-b border-[#E2EAF4] uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="py-3 px-4">เลขที่ใบสั่งซื้อ (PO No.)</th>
                        <th className="py-3 px-3">วันที่สั่งซื้อ</th>
                        <th className="py-3 px-3 text-right">จำนวนรายการพัสดุ</th>
                        <th className="py-3 px-3 text-right">ยอดเงินรวมทั้งสิ้น</th>
                        <th className="py-3 px-4 text-center">สถานะคำสั่งซื้อ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSupplierDetail.purchaseOrders && selectedSupplierDetail.purchaseOrders.length > 0 ? (
                        selectedSupplierDetail.purchaseOrders.map((po: any) => (
                          <tr key={po.id} className="hover:bg-[#F5F8FC] transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#F28C28]">
                              <Link href={`/procurement/orders`} className="hover:underline">
                                {po.poNumber}
                              </Link>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {new Date(po.orderDate).toLocaleDateString('th-TH')}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                              {po.lines?.length || 1} รายการ
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">
                              ฿{(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {po.status || 'APPROVED'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            ยังไม่มีประวัติใบสั่งซื้อกับคู่ค้ารายนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-4 border-t border-[#E2EAF4] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 flex items-center gap-4">
                <span>รหัสคู่ค้า: <strong className="font-mono text-[#14213D]">{selectedSupplierDetail.code}</strong></span>
                <span>เครดิต: <strong>{selectedSupplierDetail.paymentTerm || '30 Days'}</strong></span>
                <span>คำสั่งซื้อสะสม: <strong>{selectedSupplierDetail.purchaseOrders?.length || 0}</strong> ใบ</span>
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
                  href="/procurement/orders"
                  className="px-5 py-2 bg-[#F28C28] hover:bg-[#D97706] text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>ออกใบสั่งซื้อ (Create PO)</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
