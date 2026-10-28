export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const categoryId = searchParams.get('categoryId');

    const now = new Date();
    const d90 = new Date(now.getTime() + 90 * 24 * 3600 * 1000);

    // 1. Total Items
    const totalItems = await prisma.item.count({
      where: {
        active: true,
        ...(categoryId ? { categoryId } : {}),
      },
    });

    // 2. Stock balances
    const balances = await prisma.stockBalance.findMany({
      where: {
        ...(warehouseId ? { warehouseId } : {}),
        ...(categoryId ? { item: { categoryId } } : {}),
      },
      include: {
        item: true,
        warehouse: true,
      },
    });

    let totalStockQty = 0;
    let totalInventoryValue = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    for (const b of balances) {
      totalStockQty += b.onHand;
      totalInventoryValue += b.onHand * (b.item.standardCost || 0);

      if (b.available <= 0) {
        outOfStockCount++;
      } else if (b.available <= b.item.minStock) {
        lowStockCount++;
      }
    }

    // 3. Lots: Near Expiry (<90 days) & Expired
    const nearExpiryLots = await prisma.lot.findMany({
      where: {
        currentQty: { gt: 0 },
        expiryDate: {
          gt: now,
          lte: d90,
        },
        ...(warehouseId ? { warehouseId } : {}),
      },
      include: {
        item: true,
        warehouse: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    const expiredLots = await prisma.lot.findMany({
      where: {
        currentQty: { gt: 0 },
        expiryDate: {
          lte: now,
        },
        ...(warehouseId ? { warehouseId } : {}),
      },
      include: {
        item: true,
        warehouse: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    // 4. Pending Transactions
    const pendingGR = await prisma.goodsReceipt.count({ where: { status: 'DRAFT' } });
    const pendingIssues = await prisma.stockIssue.count({ where: { status: 'PENDING_APPROVAL' } });
    const inTransitTransfers = await prisma.stockTransfer.count({ where: { status: 'IN_TRANSIT' } });
    const pendingAdjustments = await prisma.stockAdjustment.count({ where: { status: 'PENDING_APPROVAL' } });
    const pendingReturns = await prisma.stockReturn.count({ where: { status: 'PENDING_INSPECTION' } });

    const pendingTransactions =
      pendingGR + pendingIssues + inTransitTransfers + pendingAdjustments + pendingReturns;

    // 5. Recent Stock Movements (last 10)
    const recentMovements = await prisma.stockMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        item: true,
      },
    });

    // 6. Warehouses summary
    const warehouses = await prisma.warehouse.findMany({
      where: { active: true },
      include: {
        stockBalances: {
          include: { item: true },
        },
      },
    });

    const warehouseSummary = warehouses.map((w) => {
      let qty = 0;
      let val = 0;
      for (const sb of w.stockBalances) {
        qty += sb.onHand;
        val += sb.onHand * (sb.item.standardCost || 0);
      }
      return {
        id: w.id,
        code: w.code,
        name: w.name,
        type: w.type,
        totalItems: w.stockBalances.length,
        totalQty: qty,
        totalValue: val,
      };
    });

    // 7. Categories summary
    const categories = await prisma.itemCategory.findMany({
      include: {
        items: {
          include: {
            stockBalances: true,
          },
        },
      },
    });

    const categorySummary = categories.map((c) => {
      let qty = 0;
      let val = 0;
      for (const item of c.items) {
        for (const sb of item.stockBalances) {
          qty += sb.onHand;
          val += sb.onHand * (item.standardCost || 0);
        }
      }
      return {
        id: c.id,
        name: c.name,
        code: c.code,
        totalItems: c.items.length,
        totalQty: qty,
        totalValue: val,
      };
    });

    return NextResponse.json({
      summary: {
        totalItems,
        totalStockQuantity: totalStockQty,
        totalInventoryValue,
        lowStockItems: lowStockCount,
        outOfStock: outOfStockCount,
        nearExpiry: nearExpiryLots.length,
        expiredItems: expiredLots.length,
        pendingTransactions,
      },
      alerts: {
        nearExpiryLots: nearExpiryLots.map((l) => ({
          lotId: l.id,
          lotNumber: l.lotNumber,
          itemName: l.item.itemName,
          itemCode: l.item.itemCode,
          warehouseName: l.warehouse.name,
          currentQty: l.currentQty,
          unit: l.item.unit,
          expiryDate: l.expiryDate,
          daysRemaining: Math.ceil(
            (new Date(l.expiryDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
          ),
        })),
        expiredLots: expiredLots.map((l) => ({
          lotId: l.id,
          lotNumber: l.lotNumber,
          itemName: l.item.itemName,
          itemCode: l.item.itemCode,
          warehouseName: l.warehouse.name,
          currentQty: l.currentQty,
          unit: l.item.unit,
          expiryDate: l.expiryDate,
          daysExpired: Math.ceil(
            (now.getTime() - new Date(l.expiryDate).getTime()) / (1000 * 3600 * 24)
          ),
        })),
        lowStockItems: balances
          .filter((b) => b.available <= b.item.minStock)
          .map((b) => ({
            itemId: b.itemId,
            itemCode: b.item.itemCode,
            itemName: b.item.itemName,
            warehouseName: b.warehouse.name,
            available: b.available,
            onHand: b.onHand,
            minStock: b.item.minStock,
            reorderPoint: b.item.reorderPoint,
            unit: b.item.unit,
            status: b.available === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          })),
      },
      pendingApprovals: {
        goodsReceipts: pendingGR,
        issues: pendingIssues,
        transfers: inTransitTransfers,
        adjustments: pendingAdjustments,
        returns: pendingReturns,
      },
      recentMovements,
      warehouseSummary,
      categorySummary,
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
