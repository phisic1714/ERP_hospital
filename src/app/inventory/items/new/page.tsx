'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Package, ArrowLeft, Save, Building } from 'lucide-react';

export default function NewItemPage() {
  const router = useRouter();
  const { addToast, currentUser, triggerRefresh } = useApp();
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    genericName: '',
    categoryId: '',
    subCategory: '',
    description: '',
    unit: 'Box',
    purchaseUnit: 'Carton',
    issueUnit: 'Box',
    conversionRate: '10',
    barcode: '',
    minStock: '100',
    maxStock: '1000',
    reorderPoint: '250',
    safetyStock: '50',
    standardCost: '150',
    lotControl: true,
    expiryControl: true,
    temperatureReq: 'อุณหภูมิห้อง (20-25°C)',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
          }
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userName: currentUser.name,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to create item');

      addToast('success', `บันทึกข้อมูลสินค้า [${result.itemCode}] ${result.itemName} สำเร็จ`);
      triggerRefresh();
      router.push('/inventory/items');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#E2EAF4] shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory/items"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#14213D]">เพิ่มรายการสินค้าใหม่ (New Item)</h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              บันทึกข้อมูล Master Data สินค้า พร้อมตั้งค่าการแปลงหน่วยนับและการควบคุม Lot/วันหมดอายุ
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[#E2EAF4] shadow-sm space-y-6">
        {/* Section 1: Basic Information */}
        <div>
          <h2 className="text-sm font-bold text-[#14213D] border-b border-[#E2EAF4] pb-2 mb-4">
            1. ข้อมูลพื้นฐานสินค้า (General Information)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                รหัสสินค้า (Item Code) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น MED-004, SUP-006"
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value.toUpperCase() })}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                ชื่อสินค้าทางการค้า (Item Name) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Ceftriaxone 1g Powder for Injection"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                ชื่อสามัญทางยา/เวชภัณฑ์ (Generic Name)
              </label>
              <input
                type="text"
                placeholder="เช่น Ceftriaxone Sodium"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                กลุ่มหมวดหมู่หลัก *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                หมวดหมู่ย่อย (Sub Category)
              </label>
              <input
                type="text"
                placeholder="เช่น ยาปฏิชีวนะ, วัสดุปลอดเชื้อ"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                คำอธิบายคุณลักษณะ (Specification / Description)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดคุณลักษณะเฉพาะของสินค้า..."
                className="w-full text-xs p-2.5 bg-white border border-[#DCE5F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 text-[#14213D]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Units and Conversion */}
        <div>
          <h2 className="text-sm font-bold text-[#14213D] border-b border-[#E2EAF4] pb-2 mb-4">
            2. หน่วยนับและการแปลงหน่วย (Units of Measure & Conversion)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                หน่วยนับหลักในคลัง (Base Unit) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น Box, Piece, Bottle, Vial"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                หน่วยที่ซื้อจากคู่ค้า (Purchase Unit)
              </label>
              <input
                type="text"
                placeholder="เช่น Carton, Pack"
                value={formData.purchaseUnit}
                onChange={(e) => setFormData({ ...formData, purchaseUnit: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                อัตราแปลงหน่วย (Conversion Rate)
              </label>
              <input
                type="number"
                min="1"
                placeholder="เช่น 1 Carton = 10 Box"
                value={formData.conversionRate}
                onChange={(e) => setFormData({ ...formData, conversionRate: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-semibold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                ราคาทุนมาตรฐาน (Standard Cost) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.standardCost}
                onChange={(e) => setFormData({ ...formData, standardCost: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-bold text-[#14213D] tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Min/Max Stock Control */}
        <div>
          <h2 className="text-sm font-bold text-[#14213D] border-b border-[#E2EAF4] pb-2 mb-4">
            3. ปริมาณควบคุมและจุดสั่งซื้อ (Stock Thresholds)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                ปริมาณขั้นต่ำ (Minimum Stock) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                จุดสั่งซื้อซ้ำ (Reorder Point) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.reorderPoint}
                onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg tabular-nums font-bold text-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                ปริมาณสูงสุด (Maximum Stock) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                สต็อกสำรอง (Safety Stock)
              </label>
              <input
                type="number"
                min="0"
                value={formData.safetyStock}
                onChange={(e) => setFormData({ ...formData, safetyStock: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Lot & Environmental Controls */}
        <div>
          <h2 className="text-sm font-bold text-[#14213D] border-b border-[#E2EAF4] pb-2 mb-4">
            4. เงื่อนไขการจัดเก็บและการควบคุม Lot
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                เงื่อนไขอุณหภูมิ (Temperature Requirement)
              </label>
              <input
                type="text"
                placeholder="เช่น อุณหภูมิห้อง 20-25°C หรือ แช่เย็น 2-8°C"
                value={formData.temperatureReq}
                onChange={(e) => setFormData({ ...formData, temperatureReq: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                บาร์โค้ด (Barcode)
              </label>
              <input
                type="text"
                placeholder="เช่น 8850123400..."
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#F5F8FC] border border-[#E2EAF4] rounded-lg font-mono"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#334155]">
                <input
                  type="checkbox"
                  checked={formData.lotControl}
                  onChange={(e) => setFormData({ ...formData, lotControl: e.target.checked })}
                  className="w-4 h-4 text-[#2563EB] rounded"
                />
                <span>ควบคุม Lot Number</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#334155]">
                <input
                  type="checkbox"
                  checked={formData.expiryControl}
                  onChange={(e) => setFormData({ ...formData, expiryControl: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>ควบคุมวันหมดอายุ (FEFO)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E2EAF4]">
          <Link
            href="/inventory/items"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#334155] rounded-xl text-xs font-semibold transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#164EAB] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกข้อมูลสินค้า</span>
          </button>
        </div>
      </form>
    </div>
  );
}
