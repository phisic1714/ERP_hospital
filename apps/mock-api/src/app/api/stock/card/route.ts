export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const warehouseId = searchParams.get('warehouseId');
    const movementType = searchParams.get('movementType');
    const lotNumber = searchParams.get('lotNumber');
    const search = searchParams.get('search');

    const movements = await prisma.stockMovement.findMany({
      where: {
        ...(itemId ? { itemId } : {}),
        ...(warehouseId ? { warehouseId } : {}),
        ...(movementType ? { movementType } : {}),
        ...(lotNumber ? { lotNumber } : {}),
        ...(search
          ? {
              OR: [
                { documentNumber: { contains: search } },
                { movementNumber: { contains: search } },
                { item: { itemName: { contains: search } } },
                { item: { itemCode: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        item: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(movements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
