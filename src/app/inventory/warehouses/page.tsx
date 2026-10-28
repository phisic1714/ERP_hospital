'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Building,
  Plus,
  Layers,
  MapPin,
  User,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  FolderTree,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function WarehousesPage() {
  const { addToast, refreshKey, triggerRefresh, currentUser } = useApp();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState<string | null>(null);

  // New Warehouse form
  const [whForm, setWhForm] = useState({
    code: '',
    name: '',
    type: 'DEPARTMENT',
    managerName: '',
    location: '',
    storageCond: 'อุณหภูมิห้อง 20-25°C',
  });

  // New Location form
  const [locForm, setLocForm] = useState({
    zone: 'Zone A',
    rack: 'R01',
    shelf: 'S01',
    bin: 'B01',
  });

  const loadWarehouses = () => {
    setLoading(true);
    fetch('/api/warehouses')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWarehouses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWarehouses();
  }, [refreshKey]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...whForm,
          userName: currentUser.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', `สร้างคลังสินค้า [${data.code}] ${data.name} เรียบร้อยแล้ว`);
      setShowCreateModal(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddLocationModal) return;

    try {
      const fullCode = `${locForm.zone}-${locForm.rack}-${locForm.shelf}-${locForm.bin}`;
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'LOCATION',
          warehouseId: showAddLocationModal,
          code: fullCode,
          zone: locForm.zone,
          rack: locForm.rack,
          shelf: locForm.shelf,
          bin: locForm.bin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      addToast('success', `เพิ่มตำแหน่งจัดเก็บ ${fullCode} เรียบร้อยแล้ว`);
      setShowAddLocationModal(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#14213D] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#2563EB]" />
            โครงสร้างคลังสินค้าและผังตำแหน่งจัดเก็บ (Warehouse & Locations Hierarchy)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            ลำดับชั้นการจัดเก็บ: Warehouse (คลัง) ➔ Zone (โซน) ➔ Rack (ชั้นวาง) ➔ Shelf (ชั้น) ➔ Bin (ช่องเก็บ)
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มคลังสินค้าใหม่ (New Warehouse)</span>
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-white rounded-2xl border border-[#E2EAF4] shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Warehouse Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  {wh.code}
                </span>
                <h2 className="text-sm font-bold text-[#14213D] mt-1">{wh.name}</h2>
                <div className="text-[11px] text-[#94A3B8]">{wh.type === 'MAIN' ? 'คลังกลางส่วนกลาง' : 'คลังย่อยประจำแผนก'}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                เปิดใช้งาน
              </span>
            </div>

            {/* Metadata */}
            <div className="space-y-1.5 text-xs text-[#64748B] bg-[#F5F8FC] p-3 rounded-xl border border-[#E2EAF4]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span className="truncate">{wh.location || 'อาคารพัสดุ'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span className="truncate">ผู้ดูแล: {wh.managerName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span className="truncate">{wh.storageCond || 'อุณหภูมิห้อง'}</span>
              </div>
            </div>

            {/* Locations Hierarchy Preview */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#334155] mb-2">
                <span className="flex items-center gap-1.5">
                  <FolderTree className="w-3.5 h-3.5 text-[#2563EB]" />
                  ตำแหน่งจัดเก็บ ({wh.locations.length} ตำแหน่ง)
                </span>
                <button
                  onClick={() => setShowAddLocationModal(wh.id)}
                  className="text-[#2563EB] hover:text-[#164EAB] text-[11px] font-bold hover:underline"
                >
                  + เพิ่มตำแหน่ง
                </button>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {wh.locations.length === 0 ? (
                  <div className="text-[11px] text-[#94A3B8] text-center py-2">
                    ยังไม่มีการระบุตำแหน่งย่อย
                  </div>
                ) : (
                  wh.locations.map((loc: any) => (
                    <div
                      key={loc.id}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-[#F5F8FC] rounded-lg text-[11px] font-mono border border-[#E2EAF4] text-[#334155]"
                    >
                      <span className="font-semibold text-blue-900">{loc.code}</span>
                      <span className="text-[10px] text-[#94A3B8] truncate max-w-[120px]">{loc.zone}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom stats */}
            <div className="pt-2 border-t border-[#E2EAF4] flex items-center justify-between text-xs text-[#64748B]">
              <span>รายการคงคลัง: <strong className="text-[#14213D]">{wh._count.stockBalances}</strong></span>
              <span>ล็อตทั้งหมด: <strong className="text-[#14213D]">{wh._count.lots}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Create Warehouse */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-md w-full p-6 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <h3 className="text-sm font-bold text-[#14213D]">เพิ่มคลังสินค้าใหม่ (New Warehouse)</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#64748B] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">รหัสคลัง (Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น RAD, DENT, PHARM"
                  value={whForm.code}
                  onChange={(e) => setWhForm({ ...whForm, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">ชื่อคลังสินค้า *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คลังย่อยแผนกรังสีวิทยา"
                  value={whForm.name}
                  onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">ประเภทคลัง *</label>
                <select
                  value={whForm.type}
                  onChange={(e) => setWhForm({ ...whForm, type: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                >
                  <option value="DEPARTMENT">คลังย่อยประจำแผนก (Department Warehouse)</option>
                  <option value="MAIN">คลังกลางโรงพยาบาล (Main Central Warehouse)</option>
                  <option value="QUARANTINE">คลังกักกันรอตรวจสอบ (Quarantine Warehouse)</option>
                  <option value="DAMAGED">คลังสินค้าชำรุดรอตัดจำหน่าย (Damaged Warehouse)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">ชื่อผู้รับผิดชอบ</label>
                <input
                  type="text"
                  placeholder="เช่น เจ้าหน้าที่คลังประจำแผนก"
                  value={whForm.managerName}
                  onChange={(e) => setWhForm({ ...whForm, managerName: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">สถานที่ตั้ง</label>
                <input
                  type="text"
                  placeholder="เช่น อาคาร 2 ชั้น 1 ห้องพัสดุ"
                  value={whForm.location}
                  onChange={(e) => setWhForm({ ...whForm, location: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2EAF4]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  บันทึกคลังสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Location / Bin */}
      {showAddLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2EAF4] max-w-sm w-full p-6 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EAF4]">
              <h3 className="text-sm font-bold text-[#14213D]">เพิ่มตำแหน่งจัดเก็บ (Storage Bin)</h3>
              <button
                onClick={() => setShowAddLocationModal(null)}
                className="text-[#94A3B8] hover:text-[#64748B] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">โซน (Zone) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Zone A - เวชภัณฑ์"
                  value={locForm.zone}
                  onChange={(e) => setLocForm({ ...locForm, zone: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">ชั้นวาง (Rack)</label>
                  <input
                    type="text"
                    value={locForm.rack}
                    onChange={(e) => setLocForm({ ...locForm, rack: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">ชั้น (Shelf)</label>
                  <input
                    type="text"
                    value={locForm.shelf}
                    onChange={(e) => setLocForm({ ...locForm, shelf: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">ช่อง (Bin)</label>
                  <input
                    type="text"
                    value={locForm.bin}
                    onChange={(e) => setLocForm({ ...locForm, bin: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="bg-[#F5F8FC] p-2.5 rounded-lg border border-[#E2EAF4] text-[11px] text-[#64748B]">
                รหัสตำแหน่งที่จะสร้าง: <strong className="font-mono text-blue-700">{`${locForm.zone}-${locForm.rack}-${locForm.shelf}-${locForm.bin}`}</strong>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2EAF4]">
                <button
                  type="button"
                  onClick={() => setShowAddLocationModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  บันทึกตำแหน่ง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
