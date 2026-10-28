'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Package,
  ArrowLeft,
  Building,
  Layers,
  CalendarClock,
  History,
  ShoppingCart,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

function ItemDetailContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get('id')?.trim() || '';
  const { addToast } = useApp();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'STOCK' | 'LOTS' | 'MOVEMENTS' | 'PO'>('STOCK');

  useEffect(() => {
    setItem(null);
    setError('');
    if (!itemId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/items/${encodeURIComponent(itemId)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data.error) throw new Error(data.error || 'ไม่สามารถโหลดข้อมูลสินค้าได้');
        return data;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setError(err.message);
        addToast('error', err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [itemId]);

  if (!itemId || (!loading && (!item || error))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <ShieldAlert className="w-8 h-8 text-amber-500" />
        <p className="text-sm text-[#64748B]">{!itemId ? 'กรุณาเลือกสินค้าที่ต้องการดูรายละเอียด' : error || 'ไม่พบข้อมูลสินค้า'}</p>
        <Link href="/inventory/items" className="text-sm font-semibold text-[#2563EB]">กลับทะเบียนสินค้า</Link>
      </div>
    );
  }

  if (loading || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <span className="text-sm font-medium text-[#64748B]">กำลังโหลดข้อมูลสินค้า 360°...</span>
      </div>
    );
  }

  const totalOnHand = item.stockBalances.reduce((s: number, b: any) => s + b.onHand, 0);
  const totalAvailable = item.stockBalances.reduce((s: number, b: any) => s + b.available, 0);
  const totalValue = totalOnHand * (item.standardCost || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory/items"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {item.itemCode}
              </span>
              <span className="text-xs text-[#94A3B8]">• {item.category.name}</span>
            </div>
            <h1 className="text-lg font-bold text-[#14213D] mt-1">{item.itemName}</h1>
            {item.genericName && (
              <p className="text-xs text-[#64748B] italic mt-0.5">{item.genericName}</p>
            )}
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-4 text-xs bg-[#F5F8FC] p-3 rounded-xl border border-[#E2EAF4]">
          <div>
            <span className="text-[#94A3B8] block">คงคลังรวม (On Hand)</span>
            <span className="text-sm font-bold text-[#14213D] tabular-nums">
              {totalOnHand.toLocaleString()} {item.unit}
            </span>
          </div>
          <div className="border-l border-[#E2EAF4] pl-4">
            <span className="text-[#94A3B8] block">พร้อมจ่าย (Available)</span>
            <span className="text-sm font-bold text-blue-700 tabular-nums">
              {totalAvailable.toLocaleString()} {item.unit}
            </span>
          </div>
          <div className="border-l border-[#E2EAF4] pl-4">
            <span className="text-[#94A3B8] block">มูลค่าสต็อกรวม</span>
            <span className="text-sm font-bold text-emerald-700 tabular-nums">
              ฿{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2EAF4] text-xs font-semibold">
        {[
          { id: 'STOCK', label: 'สต็อกแยกตามคลัง (Warehouse Stock)', icon: Building },
          { id: 'LOTS', label: 'Lot & วันหมดอายุ (FEFO Lots)', icon: CalendarClock },
          { id: 'MOVEMENTS', label: 'ประวัติบัตรสต็อก (Stock Movement)', icon: History },
          { id: 'PO', label: 'ประวัติการจัดซื้อ (PO History)', icon: ShoppingCart },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-blue-600 text-[#2563EB] font-bold'
                  : 'border-transparent text-[#64748B] hover:text-[#14213D]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Warehouse Stock */}
      {activeTab === 'STOCK' && (
        <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] font-semibold">
              <tr>
                <th className="py-3 px-4">คลังสินค้า</th>
                <th className="py-3 px-3 text-right">On Hand</th>
                <th className="py-3 px-3 text-right text-amber-700">จอง (Reserved)</th>
                <th className="py-3 px-3 text-right font-bold text-blue-700">พร้อมจ่าย (Available)</th>
                <th className="py-3 px-3 text-right text-indigo-700">In Transit</th>
                <th className="py-3 px-3 text-right text-purple-700">กักกัน</th>
                <th className="py-3 px-3 text-right text-red-600">ชำรุด/หมดอายุ</th>
                <th className="py-3 px-3 text-right">มูลค่าคงเหลือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.stockBalances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                    ยังไม่มียอดคงคลังในคลังสินค้าใด
                  </td>
                </tr>
              ) : (
                item.stockBalances.map((b: any) => (
                  <tr key={b.id} className="hover:bg-[#F5F8FC]">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#14213D]">{b.warehouse.name}</div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">{b.warehouse.code}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {b.onHand} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 font-medium tabular-nums">
                      {b.reserved > 0 ? b.reserved : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-blue-700 tabular-nums bg-blue-50/40">
                      {b.available} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-700 font-medium tabular-nums">
                      {b.inTransit > 0 ? `+${b.inTransit}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right text-purple-700 font-medium tabular-nums">
                      {b.quarantine > 0 ? b.quarantine : '-'}
                    </td>
                    <td className="py-3 px-3 text-right text-red-600 font-medium tabular-nums">
                      {b.damaged + b.expired > 0 ? b.damaged + b.expired : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#14213D] tabular-nums">
                      ฿{(b.onHand * (item.standardCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Lots */}
      {activeTab === 'LOTS' && (
        <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] font-semibold">
              <tr>
                <th className="py-3 px-4">Lot Number</th>
                <th className="py-3 px-3">คลังสินค้า</th>
                <th className="py-3 px-3">ตำแหน่ง (Location)</th>
                <th className="py-3 px-3 text-right">จำนวนปัจจุบัน</th>
                <th className="py-3 px-3 text-right font-bold text-blue-700">พร้อมจ่าย</th>
                <th className="py-3 px-3">วันหมดอายุ</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.lots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#94A3B8]">
                    ไม่พบข้อมูล Lot ที่มียอดคงคลัง
                  </td>
                </tr>
              ) : (
                item.lots.map((l: any) => (
                  <tr key={l.id} className="hover:bg-[#F5F8FC]">
                    <td className="py-3 px-4 font-mono font-bold text-[#14213D]">{l.lotNumber}</td>
                    <td className="py-3 px-3 text-[#334155]">{l.warehouse.name}</td>
                    <td className="py-3 px-3 font-mono text-[#64748B]">{l.location?.code || '-'}</td>
                    <td className="py-3 px-3 text-right font-medium tabular-nums">
                      {l.currentQty} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-blue-700 tabular-nums bg-blue-50/40">
                      {Math.max(0, l.currentQty - (l.reservedQty || 0) - (l.quarantineQty || 0) - (l.damagedQty || 0) - (l.expiredQty || 0))} {item.unit}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {new Date(l.expiryDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Stock Movements */}
      {activeTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] font-semibold">
              <tr>
                <th className="py-3 px-4">วัน-เวลา</th>
                <th className="py-3 px-3">เลขที่เอกสาร</th>
                <th className="py-3 px-3">ประเภท</th>
                <th className="py-3 px-3 text-right">จำนวน (+/-)</th>
                <th className="py-3 px-3 text-right">คงเหลือหลังทำ</th>
                <th className="py-3 px-3">ผู้ทำรายการ</th>
                <th className="py-3 px-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.stockMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#94A3B8]">
                    ยังไม่มีประวัติความเคลื่อนไหวของสินค้านี้
                  </td>
                </tr>
              ) : (
                item.stockMovements.map((m: any) => (
                  <tr key={m.id} className="hover:bg-[#F5F8FC]">
                    <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#2563EB]">{m.documentNumber}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-[#334155] border border-[#E2EAF4]">
                        {m.movementType}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold tabular-nums ${
                        m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#14213D] tabular-nums">
                      {m.balanceAfter} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-[#64748B]">{m.createdBy}</td>
                    <td className="py-3 px-3 text-[#94A3B8] text-[11px] truncate max-w-[200px]">
                      {m.remark || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: PO History */}
      {activeTab === 'PO' && (
        <div className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F8FC] text-[#334155] border-b border-[#E2EAF4] font-semibold">
              <tr>
                <th className="py-3 px-4">เลขที่ PO</th>
                <th className="py-3 px-3">ผู้จัดจำหน่าย (Supplier)</th>
                <th className="py-3 px-3">วันที่สั่งซื้อ</th>
                <th className="py-3 px-3 text-right">จำนวนที่สั่ง</th>
                <th className="py-3 px-3 text-right">รับเข้าแล้ว</th>
                <th className="py-3 px-3 text-right">คงเหลือรอรับ</th>
                <th className="py-3 px-3 text-right">ราคา/หน่วย</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.poLines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                    ไม่มีประวัติการสั่งซื้อสำหรับสินค้านี้
                  </td>
                </tr>
              ) : (
                item.poLines.map((pl: any) => (
                  <tr key={pl.id} className="hover:bg-[#F5F8FC]">
                    <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">{pl.po.poNumber}</td>
                    <td className="py-3 px-3 text-[#14213D]">{pl.po.supplier.name}</td>
                    <td className="py-3 px-3 text-[#64748B]">
                      {new Date(pl.po.orderDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums">
                      {pl.orderedQty} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 tabular-nums">
                      {pl.receivedQty} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#2563EB] tabular-nums">
                      {pl.remainingQty} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      ฿{pl.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={pl.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ItemDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">กำลังโหลดรายละเอียดสินค้า...</div>}>
      <ItemDetailContent />
    </Suspense>
  );
}
