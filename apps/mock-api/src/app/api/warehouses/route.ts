export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { active: true },
      include: {
        department: true,
        locations: {
          where: { active: true },
          orderBy: { code: 'asc' },
        },
        _count: {
          select: {
            stockBalances: true,
            lots: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json(warehouses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === 'LOCATION') {
      // Create location inside warehouse
      const loc = await prisma.warehouseLocation.create({
        data: {
          warehouseId: body.warehouseId,
          code: body.code,
          zone: body.zone,
          rack: body.rack,
          shelf: body.shelf,
          bin: body.bin,
        },
      });
      return NextResponse.json(loc);
    }

    // Create Warehouse
    const wh = await prisma.warehouse.create({
      data: {
        code: body.code,
        name: body.name,
        type: body.type || 'DEPARTMENT',
        departmentId: body.departmentId || null,
        managerName: body.managerName,
        location: body.location,
        storageCond: body.storageCond,
      },
    });

    await logAudit({
      userName: body.userName || 'System',
      action: 'CREATE',
      module: 'WAREHOUSE',
      recordId: wh.id,
      details: `สร้างคลังสินค้าใหม่: [${wh.code}] ${wh.name}`,
    });

    return NextResponse.json(wh);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
