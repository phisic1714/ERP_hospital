'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ERPPortalHomePage() {
  const router = useRouter();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  // Search input ref for Ctrl+K
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 3D Cube interactive drag & rotate refs
  const cubeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const rotXRef = useRef(-22);
  const rotYRef = useRef(-35);

  // 6 Core ERP Modules Data (With direct system routes and readiness status)
  const erpModules = [
    {
      id: 'hr',
      code: 'HRM • บุคลากร',
      title: 'HR & บุคลากร',
      desc: 'จัดการข้อมูลแพทย์ พยาบาล พนักงาน โครงสร้างองค์กร ตารางเวรปฏิบัติงาน และศูนย์อนุมัติคำขอบุคลากร',
      kpiBadge: 'เตรียมเปิดใช้งาน',
      statusText: 'อยู่ระหว่างพัฒนาระบบ',
      isReady: false,
      route: '#',
      gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
      edgeColor: '#475569',
      glowColor: 'rgba(100, 116, 139, 0.25)',
      svgIcon: (
        <svg className="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'finance',
      code: 'FIN • แผนงบประมาณ',
      title: 'งบประมาณและการเงิน',
      desc: 'บริหารงบประมาณประจำปี แผนจัดซื้อกรอบวงเงิน (PP) ค่าใช้จ่าย เจ้าหนี้ และสถานะการเบิกจ่ายโรงพยาบาล',
      kpiBadge: 'เตรียมเปิดใช้งาน',
      statusText: 'อยู่ระหว่างพัฒนาระบบ',
      isReady: false,
      route: '#',
      gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
      edgeColor: '#475569',
      glowColor: 'rgba(100, 116, 139, 0.25)',
      svgIcon: (
        <svg className="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      )
    },
    {
      id: 'procurement',
      code: 'PROCUREMENT • จัดซื้อ',
      title: 'จัดซื้อจัดจ้าง',
      desc: 'บริหารกระบวนการจัดซื้อครบวงจร แผนจัดซื้อ (PP) ใบขอซื้อ (PR) ใบสั่งซื้อ (PO) และการติดตามส่งมอบ',
      kpiBadge: 'รออนุมัติ 5 PR',
      statusText: 'รอตรวจรับ 4 PO วันนี้',
      isReady: true,
      route: '/procurement',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      edgeColor: '#78350f',
      glowColor: 'rgba(245, 158, 11, 0.34)',
      svgIcon: (
        <svg className="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    {
      id: 'inventory',
      code: 'INVENTORY • คลังพัสดุ',
      title: 'คลังสินค้าและพัสดุ',
      desc: 'บริหารสินค้าคงคลังและพัสดุโรงพยาบาล ตรวจรับเข้าคลัง เบิกจ่าย โอนย้าย ยืมคืน และตรวจนับตามเกณฑ์ FEFO',
      kpiBadge: '1,420 รายการ',
      statusText: 'แจ้งเตือน Lot ใกล้หมดอายุ 3 รายการ',
      isReady: true,
      route: '/inventory',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
      edgeColor: '#1e1b4b',
      glowColor: 'rgba(79, 70, 229, 0.34)',
      svgIcon: (
        <svg className="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      )
    },
    {
      id: 'reports',
      code: 'BI • รายงานผู้บริหาร',
      title: 'รายงานและวิเคราะห์',
      desc: 'ศูนย์รวมรายงานผู้บริหาร สถิติการเบิกจ่าย อัตราการหมุนเวียนพัสดุ และวิเคราะห์ข้อมูลเชิงลึกแบบ Real-time',
      kpiBadge: 'Real-time BI',
      statusText: 'แดชบอร์ดสรุปผล 24 รายงาน',
      isReady: true,
      route: '/operations/reports',
      gradient: 'linear-gradient(135deg, #9333ea 0%, #6b21a8 100%)',
      edgeColor: '#3b0764',
      glowColor: 'rgba(147, 51, 234, 0.32)',
      svgIcon: (
        <svg className="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      )
    },
    {
      id: 'maintenance',
      code: 'ASSET • ครุภัณฑ์โรงพยาบาล',
      title: 'ครุภัณฑ์และทรัพย์สิน',
      desc: 'บริหารทะเบียนครุภัณฑ์ทางการแพทย์ ทะเบียนทรัพย์สิน การตรวจสอบประวัติพัสดุ และการบำรุงรักษาเชิงป้องกัน',
      kpiBadge: 'เตรียมเปิดใช้งาน',
      statusText: 'อยู่ระหว่างพัฒนาระบบ',
      isReady: false,
      route: '#',
      gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
      edgeColor: '#475569',
      glowColor: 'rgba(100, 116, 139, 0.25)',
      svgIcon: (
        <svg className="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    }
  ];

  // Filter modules
  const filteredModules = erpModules.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard shortcut Ctrl+K
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

  // 3D Cube idle rotation & drag logic
  useEffect(() => {
    const cube = cubeRef.current;
    if (!cube) return;

    const interval = setInterval(() => {
      if (!isDraggingRef.current && cubeRef.current) {
        rotYRef.current += 0.35;
        cubeRef.current.style.transform = `rotateX(${rotXRef.current}deg) rotateY(${rotYRef.current}deg)`;
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleCubeMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  };

  const handleCubeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      isDraggingRef.current = true;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !cubeRef.current) return;
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      rotYRef.current += dx * 0.65;
      rotXRef.current = Math.max(-65, Math.min(65, rotXRef.current - dy * 0.65));
      cubeRef.current.style.transform = `rotateX(${rotXRef.current}deg) rotateY(${rotYRef.current}deg)`;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !cubeRef.current || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - startXRef.current;
      const dy = e.touches[0].clientY - startYRef.current;
      rotYRef.current += dx * 0.65;
      rotXRef.current = Math.max(-65, Math.min(65, rotXRef.current - dy * 0.65));
      cubeRef.current.style.transform = `rotateX(${rotXRef.current}deg) rotateY(${rotYRef.current}deg)`;
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, []);

  // Direct navigation to target system route
  const navigateToModule = (route: string) => {
    router.push(route);
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col font-sans">
      {/* Modern Spatial Styles */}
      <style jsx global>{`
        :root {
          --bg-page: #f1f5f9;
          --card-bg: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          --card-border: rgba(226, 232, 240, 0.95);
          --card-edge: #cbd5e1;
          --card-shadow: rgba(15, 23, 42, 0.08);
          --hero-bg: linear-gradient(125deg, #e0edff 0%, #f0f7ff 52%, #e8f7f5 100%);
        }

        .cube-scene {
          width: 190px;
          height: 190px;
          perspective: 950px;
          position: relative;
          user-select: none;
          cursor: grab;
          touch-action: none;
        }
        .cube-scene:active {
          cursor: grabbing;
        }

        .cube-3d {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(-22deg) rotateY(-35deg);
          transition: transform 0.08s linear;
        }

        .cube-face {
          position: absolute;
          width: 116px;
          height: 116px;
          left: 37px;
          top: 37px;
          border-radius: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(255, 255, 255, 0.5);
          box-shadow: 
            inset 0 0 24px rgba(255, 255, 255, 0.28),
            0 12px 28px -6px rgba(29, 78, 216, 0.45);
          backface-visibility: visible;
        }

        .face-front  {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 55%, #1e3a8a 100%);
          transform: rotateY(0deg) translateZ(58px);
        }
        .face-back   {
          background: linear-gradient(135deg, #1e40af 0%, #0f172a 100%);
          transform: rotateY(180deg) translateZ(58px);
        }
        .face-right  {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          transform: rotateY(90deg) translateZ(58px);
        }
        .face-left   {
          background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%);
          transform: rotateY(-90deg) translateZ(58px);
        }
        .face-top    {
          background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
          transform: rotateX(90deg) translateZ(58px);
        }
        .face-bottom {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
          transform: rotateX(-90deg) translateZ(58px);
          box-shadow: 0 38px 50px rgba(15, 23, 42, 0.35);
        }

        /* Orbiting Satellite Badges */
        .sat-badge {
          position: absolute;
          width: 46px;
          height: 46px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          box-shadow: 
            0 10px 22px -4px rgba(15, 23, 42, 0.14),
            inset 0 1px 1px rgba(255, 255, 255, 0.9);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .sat-badge:hover {
          transform: scale(1.18) translateY(-4px) !important;
        }
        .sat-tl { top: 2px; left: -4px; animation: floatSatA 4.2s ease-in-out infinite; }
        .sat-tr { top: 0px; right: -4px; animation: floatSatB 4.7s ease-in-out infinite; }
        .sat-bl { bottom: 6px; left: -2px; animation: floatSatB 5.1s ease-in-out infinite; }
        .sat-br { bottom: 4px; right: -4px; animation: floatSatA 4.5s ease-in-out infinite; }

        @keyframes floatSatA {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes floatSatB {
          0%, 100% { transform: translateY(0px) rotate(4deg); }
          50% { transform: translateY(-7px) rotate(-4deg); }
        }

        /* Standard SaaS Module Card with gentle hover lift (No 3D tilt) */
        .module-card {
          position: relative;
          background: var(--card-bg);
          border-radius: 24px;
          border: 1px solid var(--card-border);
          box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
        }

        .module-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 16px 32px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(37, 99, 235, 0.08);
        }

        .iso-block {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 1.5px solid rgba(255, 255, 255, 0.75);
          box-shadow: 0 4px 12px -2px var(--block-glow);
          transition: transform 0.22s ease;
        }
        .module-card:hover .iso-block {
          transform: scale(1.05);
        }

        .hero-surface {
          background: var(--hero-bg);
          box-shadow: 0 12px 32px -8px rgba(30, 64, 175, 0.10);
        }
      `}</style>

      {/* ================= 1. TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md border border-blue-400/40">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">TOP PROVIDER</span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-blue-600 text-white shadow-xs">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Enterprise Hospital Portal</p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <svg className="w-4 h-4 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาระบบงาน, เอกสาร PR/PO, หรือรหัสพัสดุ..."
                className="w-full pl-11 pr-16 py-2.5 rounded-full bg-slate-100/90 hover:bg-blue-50/60 focus:bg-white border border-slate-200/90 focus:border-blue-500 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition"
              />
              <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-full absolute right-3 top-1/2 -translate-y-1/2">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right Actions: Notification & Profile (Light mode only) */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Notification Bell */}
            <Link
              href="/operations/approvals"
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200/80 transition"
              title="รายการแจ้งเตือนรออนุมัติ"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                4
              </span>
            </Link>

            <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-sky-500 text-white font-bold text-sm flex items-center justify-center shadow-md ring-2 ring-blue-500/20">
                SW
              </div>
              <div className="hidden lg:block leading-tight">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  สมชาย วงศ์สวัสดิ์
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                    ADMIN
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Portfolio Manager</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN CONTENT CONTAINER ================= */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 space-y-9">
        {/* ================= HERO BANNER ================= */}
        <section className="hero-surface relative rounded-[28px] border border-white/90 p-6 sm:p-9 lg:p-10 overflow-hidden transition-all">
          {/* Decorative Grid Mesh Background */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between">
            {/* Left Column: Welcome Message */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-blue-200/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700">
                  TOP PROVIDER SYSTEM GROUP • ENTERPRISE PORTAL
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-900 leading-tight">
                ยินดีต้อนรับสู่{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">
                  ERP Center
                </span>
              </h1>

              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                ศูนย์กลางการจัดการระบบภายในองค์กร
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                เชื่อมต่อทุกระบบงาน จัดการทุกกระบวนการ ตั้งแต่บุคลากร งบประมาณ จัดซื้อ คลังพัสดุ FEFO
                ไปจนถึงการซ่อมบำรุง เพื่อให้องค์กรทำงานได้อย่างมีประสิทธิภาพสูงสุด
              </p>
            </div>

            {/* Right Column: Interactive Rotating Cube on the far right */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center lg:items-end justify-center lg:pr-4">
              <div
                className="cube-scene"
                onMouseDown={handleCubeMouseDown}
                onTouchStart={handleCubeTouchStart}
                title="คลิกค้างแล้วลากเพื่อหมุนดูลูกบาศก์ระบบงาน"
              >
                {/* 4 Floating Satellite Badges */}
                <div
                  className="sat-badge sat-tl bg-white text-blue-600 border border-blue-100"
                  title="HR & บุคลากร"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <div
                  className="sat-badge sat-tr bg-white text-emerald-600 border border-emerald-100"
                  title="งบประมาณและการเงิน"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                  </svg>
                </div>

                <div
                  className="sat-badge sat-bl bg-white text-amber-500 border border-amber-100"
                  title="จัดซื้อจัดจ้าง (PR/PO)"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>

                <div
                  className="sat-badge sat-br bg-white text-indigo-600 border border-indigo-100"
                  title="คลังสินค้าและพัสดุ"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>

                {/* 6-Sided Cube */}
                <div className="cube-3d" ref={cubeRef}>
                  <div className="cube-face face-front text-white p-2 text-center">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-sky-200">
                      TOP PROVIDER
                    </span>
                    <span className="text-xl font-extrabold tracking-tight mt-0.5">ERP</span>
                    <span className="mt-1 px-2 py-0.5 rounded-full text-[8px] bg-white/20">
                      6 MODULES
                    </span>
                  </div>
                  <div className="cube-face face-right text-white p-2 text-center">
                    <span className="text-[9px] font-bold uppercase text-sky-200">INVENTORY</span>
                    <span className="text-base font-extrabold mt-0.5">FEFO LOT</span>
                  </div>
                  <div className="cube-face face-back text-white p-2 text-center">
                    <span className="text-[9px] font-bold uppercase text-sky-200">FINANCE</span>
                    <span className="text-base font-extrabold mt-0.5">BUDGET</span>
                  </div>
                  <div className="cube-face face-left text-white p-2 text-center">
                    <span className="text-[9px] font-bold uppercase text-sky-200">HOSPITAL</span>
                    <span className="text-base font-extrabold mt-0.5">SERVICES</span>
                  </div>
                  <div className="cube-face face-top text-white p-2 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">ERP CORE</span>
                  </div>
                  <div className="cube-face face-bottom"></div>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                </svg>
                หมุนเพื่อดูภาพรวมระบบงาน
              </span>
            </div>
          </div>
        </section>

        {/* ================= 3. SECTION HEADER & VIEW CONTROLS ================= */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                ระบบงานทั้งหมด
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                6 ระบบงานหลัก
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              เลือกคลิกที่การ์ดหรือกดปุ่มเข้าสู่ระบบ เพื่อเปิดใช้งานระบบงานที่ต้องการได้ทันที
            </p>
          </div>

          {/* View Switcher Buttons */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs self-start sm:self-auto">
            <button
              onClick={() => setCurrentView('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                currentView === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>มุมมองการ์ด</span>
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>มุมมองรายการ</span>
            </button>
          </div>
        </section>

        {/* ================= 4. 6 ERP MODULES GRID ================= */}
        {currentView === 'grid' ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 pb-8">
            {filteredModules.map((mod) => (
              <div key={mod.id}>
                <article
                  onClick={() => navigateToModule(mod.route)}
                  className="module-card cursor-pointer p-6 sm:p-7 h-full flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Squircle Icon + Live KPI Badge */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div>
                        <div
                          className="iso-block"
                          style={{
                            background: mod.gradient,
                            ['--block-edge' as any]: mod.edgeColor,
                            ['--block-glow' as any]: mod.glowColor,
                          }}
                        >
                          {mod.svgIcon}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200/80">
                          {mod.code}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                          {mod.kpiBadge}
                        </span>
                      </div>
                    </div>

                    {/* Module Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Status & Action Button */}
                  <div className="pt-5 mt-6 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {mod.statusText}
                      </span>
                      <span className="font-semibold text-slate-400">พร้อมใช้งาน</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToModule(mod.route);
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-[#f1f6fe] group-hover:bg-blue-600 text-blue-800 group-hover:text-white font-bold text-xs sm:text-sm flex items-center justify-between border border-blue-100 group-hover:border-blue-700 shadow-2xs group-hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-blue-700 group-hover:bg-white text-white group-hover:text-blue-700 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </span>
                        <span>เข้าสู่ระบบงาน</span>
                      </div>
                      <span className="text-[11px] opacity-75 group-hover:opacity-100">เปิดระบบ →</span>
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </section>
        ) : (
          /* List View */
          <section className="flex flex-col gap-4 pb-8">
            {filteredModules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => navigateToModule(mod.route)}
                className="module-card cursor-pointer p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="iso-block shrink-0"
                    style={{
                      background: mod.gradient,
                      ['--block-edge' as any]: mod.edgeColor,
                      ['--block-glow' as any]: mod.glowColor,
                      width: '58px',
                      height: '58px',
                      borderRadius: '16px',
                    }}
                  >
                    {mod.svgIcon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {mod.code}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600">
                        {mod.kpiBadge}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500">{mod.desc}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToModule(mod.route);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md shrink-0 flex items-center gap-2 transition-all"
                >
                  <span>เข้าสู่ระบบงาน</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
