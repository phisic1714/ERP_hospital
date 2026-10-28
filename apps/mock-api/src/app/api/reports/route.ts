export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'VALUATION'; // VALUATION, BALANCE, MOVEMENTS, LOW_STOCK, EXPIRY, RECEIVING, ISSUE
    const warehouseId = searchParams.get('warehouseId');
    const categoryId = searchParams.get('categoryId');

    const now = new Date();

    if (reportType === 'VALUATION') {
      const balances = await prisma.stockBalance.findMany({
        where: {
          ...(warehouseId ? { warehouseId } : {}),
          ...(categoryId ? { item: { categoryId } } : {}),
        },
        include: {
          item: { include: { category: true } },
          warehouse: true,
        },
      });

      let totalValuation = 0;
      let totalQty = 0;

      const items = balances.map((b) => {
        const val = b.onHand * (b.item.standardCost || 0);
        totalValuation += val;
        totalQty += b.onHand;
        return {
          itemCode: b.item.itemCode,
          itemName: b.item.itemName,
          categoryName: b.item.category.name,
          warehouseName: b.warehouse.name,
          onHand: b.onHand,
          unit: b.item.unit,
          unitCost: b.item.standardCost,
          totalValue: val,
        };
      });

      return NextResponse.json({
        title: 'รายงานมูลค่าสินค้าคงคลัง (Inventory Valuation Report)',
        generatedAt: now,
        summary: { totalValuation, totalQty, totalItemsCount: items.length },
        rows: items,
      });
    }

    if (reportType === 'LOW_STOCK') {
      const balances = await prisma.stockBalance.findMany({
        where: {
          ...(warehouseId ? { warehouseId } : {}),
          ...(categoryId ? { item: { categoryId } } : {}),
        },
        include: {
          item: { include: { category: true } },
          warehouse: true,
        },
      });

      const lowStockRows = balances
        .filter((b) => b.available <= b.item.minStock)
        .map((b) => ({
          itemCode: b.item.itemCode,
          itemName: b.item.itemName,
          categoryName: b.item.category.name,
          warehouseName: b.warehouse.name,
          available: b.available,
          onHand: b.onHand,
          minStock: b.item.minStock,
          reorderPoint: b.item.reorderPoint,
          unit: b.item.unit,
          suggestedOrderQty: Math.max(0, b.item.maxStock - b.available),
          status: b.available === 0 ? 'สินค้าหมดคลัง' : 'ต่ำกว่าเกณฑ์ขั้นต่ำ',
        }));

      return NextResponse.json({
        title: 'รายงานสินค้าต่ำกว่าจุดสั่งซื้อ / ใกล้หมดคลัง (Low Stock Report)',
        generatedAt: now,
        summary: { totalLowItems: lowStockRows.length },
        rows: lowStockRows,
      });
    }

    if (reportType === 'EXPIRY') {
      const d90 = new Date(now.getTime() + 90 * 24 * 3600 * 1000);
      const lots = await prisma.lot.findMany({
        where: {
          currentQty: { gt: 0 },
          ...(warehouseId ? { warehouseId } : {}),
        },
        include: {
          item: { include: { category: true } },
          warehouse: true,
        },
        orderBy: { expiryDate: 'asc' },
      });

      const expiryRows = lots.map((l) => {
        const exp = new Date(l.expiryDate);
        const isExp = exp <= now;
        const isNear = !isExp && exp <= d90;
        const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return {
          lotNumber: l.lotNumber,
          itemCode: l.item.itemCode,
          itemName: l.item.itemName,
          categoryName: l.item.category.name,
          warehouseName: l.warehouse.name,
          currentQty: l.currentQty,
          unit: l.item.unit,
          expiryDate: l.expiryDate,
          daysRemaining: days,
          status: isExp ? 'หมดอายุแล้ว' : isNear ? 'ใกล้หมดอายุ (< 90 วัน)' : 'ปกติ',
        };
      });

      return NextResponse.json({
        title: 'รายงานการควบคุม Lot และวันหมดอายุ (Lot & Expiry Report)',
        generatedAt: now,
        summary: {
          expiredCount: expiryRows.filter((r) => r.status === 'หมดอายุแล้ว').length,
          nearExpiryCount: expiryRows.filter((r) => r.status.includes('ใกล้หมดอายุ')).length,
        },
        rows: expiryRows,
      });
    }

    if (reportType === 'MOVEMENTS') {
      const movements = await prisma.stockMovement.findMany({
        where: {
          ...(warehouseId ? { warehouseId } : {}),
        },
        include: {
          item: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return NextResponse.json({
        title: 'รายงานประวัติความเคลื่อนไหวสินค้า (Stock Movement Report)',
        generatedAt: now,
        rows: movements,
      });
    }

    return NextResponse.json({ error: 'Unsupported report type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
