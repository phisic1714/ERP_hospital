'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  Search,
  Building2,
  ChevronDown,
  ShoppingCart,
  LayoutGrid,
  Home,
  Check,
  Package,
} from 'lucide-react';

export function Topbar() {
  const pathname = usePathname();
  const { currentUser, selectedWarehouse, setSelectedWarehouse } = useApp();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isHome = pathname === '/home';
  const isProcurement = pathname.startsWith('/procurement');
  const isInventory = !isHome && !isProcurement;

  useEffect(() => {
    fetch('/api/warehouses')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setWarehouses(data);
      })
      .catch(console.error);

    fetch('/api/approvals')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPendingApprovalsCount(data.length);
      })
      .catch(console.error);
  }, []);

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isHome) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2EAF4] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* 1. Left: Module Switcher */}
      <div className="flex items-center shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowAppSwitcher(!showAppSwitcher)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#E2EAF4] bg-[#F5F8FC] hover:bg-slate-100 text-xs font-semibold text-[#14213D] transition-all shadow-2xs"
            title="คลิกเพื่อสลับระบบงาน (App Switcher)"
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-xs ${
                isHome
                  ? 'bg-[#2563EB]'
                  : isProcurement
                  ? 'bg-[#F28C28]'
                  : 'bg-[#2563EB]'
              }`}
            >
              {isHome ? (
                <LayoutGrid className="w-3.5 h-3.5" />
              ) : isProcurement ? (
                <ShoppingCart className="w-3.5 h-3.5" />
              ) : (
                <Package className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-bold text-xs text-[#14213D] block leading-tight">
                {isHome
                  ? 'ERP Center'
                  : isProcurement
                  ? 'ระบบจัดซื้อจัดจ้าง'
                  : 'ระบบคลังสินค้าและพัสดุ'}
              </span>
              <span className="text-[10px] text-[#94A3B8] font-normal block">
                {isHome ? 'หน้าหลักองค์กร' : isProcurement ? 'Procurement' : 'Inventory'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] ml-0.5" />
          </button>

          {showAppSwitcher && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAppSwitcher(false)}
              />
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E2EAF4] p-2 z-50 animate-scale-up">
                <div className="px-3 py-2 border-b border-[#E2EAF4] text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  สลับโมดูลระบบงาน (Hospital ERP Systems)
                </div>
                <div className="p-1 space-y-1">
                  {/* 1. ERP Center */}
                  <Link
                    href="/home"
                    onClick={() => setShowAppSwitcher(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                      isHome ? 'bg-blue-50 font-bold text-[#2563EB]' : 'hover:bg-[#F5F8FC] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#14213D]">ERP Center (หน้าหลัก)</div>
                        <div className="text-[10px] text-[#94A3B8]">ศูนย์กลางการจัดการระบบทั้งหมด</div>
                      </div>
                    </div>
                    {isHome && <Check className="w-4 h-4 text-[#2563EB]" />}
                  </Link>

                  {/* 2. Inventory */}
                  <Link
                    href="/inventory"
                    onClick={() => setShowAppSwitcher(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                      isInventory ? 'bg-blue-50 font-bold text-[#2563EB]' : 'hover:bg-[#F5F8FC] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#14213D]">คลังสินค้าและพัสดุ (Inventory)</div>
                        <div className="text-[10px] text-[#94A3B8]">รับเข้า เบิกจ่าย โอนย้าย และตรวจนับ</div>
                      </div>
                    </div>
                    {isInventory && <Check className="w-4 h-4 text-[#2563EB]" />}
                  </Link>

                  {/* 3. Procurement */}
                  <Link
                    href="/procurement"
                    onClick={() => setShowAppSwitcher(false)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                      isProcurement ? 'bg-orange-50 font-bold text-[#F28C28]' : 'hover:bg-[#F5F8FC] text-[#64748B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F28C28] text-white flex items-center justify-center shadow-xs">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#14213D]">จัดซื้อจัดจ้าง (Procurement)</div>
                        <div className="text-[10px] text-[#94A3B8]">แผนจัดซื้อ (PP), ขอซื้อ (PR), สั่งซื้อ (PO)</div>
                      </div>
                    </div>
                    {isProcurement && <Check className="w-4 h-4 text-[#F28C28]" />}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Center: Global Search Bar */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md lg:max-w-lg mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="ค้นหาระบบงาน, เอกสาร, หรือพัสดุ..."
            className="w-full text-xs pl-10 pr-16 py-2 bg-[#F5F8FC] hover:bg-[#EEF3F9] focus:bg-white border border-[#E2EAF4] rounded-full text-[#14213D] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] bg-white border border-[#E2EAF4] rounded-md shadow-2xs absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Warehouse Selector, Pending Approvals, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Warehouse Selector (Prominent Card on Right) */}
        {isInventory && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F8FC] hover:bg-slate-100 border border-[#E2EAF4] rounded-xl text-xs transition-all shadow-2xs">
            <Building2 className="w-4 h-4 text-[#2563EB] shrink-0" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="text-xs font-semibold bg-transparent text-[#14213D] focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
              title="เลือกคลังสินค้าปฏิบัติการ"
            >
              <option value="">🏢 ทุกคลังสินค้า (All Warehouses)</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notifications / Pending Approval link */}
        <Link
          href="/operations/approvals"
          className="relative p-2 rounded-xl text-[#64748B] hover:text-[#14213D] hover:bg-[#F5F8FC] border border-transparent hover:border-[#E2EAF4] transition-all"
          title="รายการรออนุมัติ"
        >
          <Bell className="w-4 h-4" />
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse">
              {pendingApprovalsCount}
            </span>
          )}
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#E2EAF4]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#164EAB] to-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {currentUser?.name ? currentUser.name.slice(0, 2) : 'WH'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-[#14213D] leading-tight">
              {currentUser?.name || 'ผู้ใช้งาน'}
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium">
              {currentUser?.department?.name || 'โรงพยาบาล'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
