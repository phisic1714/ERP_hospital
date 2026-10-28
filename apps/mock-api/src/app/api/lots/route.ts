export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const warehouseId = searchParams.get('warehouseId');
    const filter = searchParams.get('filter'); // ALL, ACTIVE, NEAR_EXPIRY, EXPIRED, QUARANTINE
    const search = searchParams.get('search') || '';

    const now = new Date();
    const d90 = new Date(now.getTime() + 90 * 24 * 3600 * 1000);

    const lots = await prisma.lot.findMany({
      where: {
        ...(itemId ? { itemId } : {}),
        ...(warehouseId ? { warehouseId } : {}),
        ...(search
          ? {
              OR: [
                { lotNumber: { contains: search } },
                { item: { itemCode: { contains: search } } },
                { item: { itemName: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        item: {
          include: { category: true },
        },
        warehouse: true,
        location: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    const mapped = lots.map((lot) => {
      const expDate = new Date(lot.expiryDate);
      const isExpired = expDate <= now;
      const isNearExpiry = !isExpired && expDate <= d90;
      const daysRemaining = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      let computedStatus = lot.status;
      if (isExpired && lot.status === 'ACTIVE') {
        computedStatus = 'EXPIRED';
      }

      const availableInLot = Math.max(
        0,
        lot.currentQty -
          (lot.reservedQty || 0) -
          (lot.quarantineQty || 0) -
          (lot.damagedQty || 0) -
          (lot.expiredQty || 0)
      );

      return {
        id: lot.id,
        itemId: lot.itemId,
        itemCode: lot.item.itemCode,
        itemName: lot.item.itemName,
        categoryName: lot.item.category.name,
        unit: lot.item.unit,
        warehouseId: lot.warehouseId,
        warehouseCode: lot.warehouse.code,
        warehouseName: lot.warehouse.name,
        locationCode: lot.location?.code || '-',
        zone: lot.location?.zone || '-',
        lotNumber: lot.lotNumber,
        expiryDate: lot.expiryDate,
        receivedDate: lot.receivedDate,
        initialQty: lot.initialQty,
        currentQty: lot.currentQty,
        reservedQty: lot.reservedQty,
        quarantineQty: lot.quarantineQty,
        damagedQty: lot.damagedQty,
        expiredQty: lot.expiredQty,
        availableInLot,
        unitCost: lot.unitCost,
        totalValue: lot.currentQty * lot.unitCost,
        status: computedStatus,
        isExpired,
        isNearExpiry,
        daysRemaining,
      };
    });

    const filtered = mapped.filter((l) => {
      if (!filter || filter === 'ALL') return true;
      if (filter === 'NEAR_EXPIRY') return l.isNearExpiry && l.currentQty > 0;
      if (filter === 'EXPIRED') return l.isExpired && l.currentQty > 0;
      if (filter === 'QUARANTINE') return l.quarantineQty > 0 || l.status === 'QUARANTINE';
      if (filter === 'ACTIVE') return l.status === 'ACTIVE' && !l.isExpired && l.currentQty > 0;
      return true;
    });

    return NextResponse.json(filtered);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
