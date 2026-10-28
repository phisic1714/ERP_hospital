export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const warehouseId = searchParams.get('warehouseId');
    const categoryId = searchParams.get('categoryId');
    const statusFilter = searchParams.get('status'); // ALL, NORMAL, LOW_STOCK, OUT_OF_STOCK

    const balances = await prisma.stockBalance.findMany({
      where: {
        ...(warehouseId ? { warehouseId } : {}),
        ...(categoryId ? { item: { categoryId } } : {}),
        ...(search
          ? {
              OR: [
                { item: { itemCode: { contains: search } } },
                { item: { itemName: { contains: search } } },
                { item: { genericName: { contains: search } } },
                { warehouse: { name: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        item: {
          include: { category: true },
        },
        warehouse: true,
      },
      orderBy: [{ warehouse: { code: 'asc' } }, { item: { itemCode: 'asc' } }],
    });

    const now = new Date();

    // Map each balance and calculate exact status
    const result = balances
      .map((b) => {
        let status = 'NORMAL';
        if (b.available <= 0) {
          status = 'OUT_OF_STOCK';
        } else if (b.available <= b.item.minStock) {
          status = 'LOW_STOCK';
        } else if (b.item.maxStock > 0 && b.onHand >= b.item.maxStock) {
          status = 'OVER_STOCK';
        }

        const totalValue = b.onHand * (b.item.standardCost || 0);

        return {
          id: b.id,
          itemId: b.itemId,
          itemCode: b.item.itemCode,
          itemName: b.item.itemName,
          genericName: b.item.genericName,
          categoryName: b.item.category.name,
          categoryId: b.item.categoryId,
          warehouseId: b.warehouseId,
          warehouseCode: b.warehouse.code,
          warehouseName: b.warehouse.name,
          onHand: b.onHand,
          reserved: b.reserved,
          available: b.available,
          inTransit: b.inTransit,
          quarantine: b.quarantine,
          damaged: b.damaged,
          expired: b.expired,
          unit: b.item.unit,
          minStock: b.item.minStock,
          maxStock: b.item.maxStock,
          reorderPoint: b.item.reorderPoint,
          standardCost: b.item.standardCost,
          totalValue,
          status,
          lastMovementAt: b.lastMovementAt,
        };
      })
      .filter((b) => {
        if (!statusFilter || statusFilter === 'ALL') return true;
        return b.status === statusFilter;
      });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
