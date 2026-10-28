export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        unitConversions: true,
        stockBalances: {
          include: { warehouse: true },
        },
        lots: {
          include: { warehouse: true, location: true },
          orderBy: { expiryDate: 'asc' },
        },
        stockMovements: {
          take: 30,
          orderBy: { createdAt: 'desc' },
        },
        poLines: {
          take: 10,
          orderBy: { po: { orderDate: 'desc' } },
          include: {
            po: {
              include: { supplier: true },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลสินค้า' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const item = await prisma.item.update({
      where: { id: params.id },
      data: {
        itemName: body.itemName,
        genericName: body.genericName,
        categoryId: body.categoryId,
        subCategory: body.subCategory,
        description: body.description,
        unit: body.unit,
        purchaseUnit: body.purchaseUnit,
        issueUnit: body.issueUnit,
        conversionRate: body.conversionRate ? parseFloat(body.conversionRate) : 1.0,
        barcode: body.barcode,
        minStock: parseFloat(body.minStock || '0'),
        maxStock: parseFloat(body.maxStock || '0'),
        reorderPoint: parseFloat(body.reorderPoint || '0'),
        safetyStock: parseFloat(body.safetyStock || '0'),
        standardCost: parseFloat(body.standardCost || '0'),
        temperatureReq: body.temperatureReq,
      },
    });

    await logAudit({
      userName: body.userName || 'System',
      action: 'UPDATE',
      module: 'ITEM',
      recordId: item.id,
      details: `แก้ไขข้อมูลสินค้า: [${item.itemCode}] ${item.itemName}`,
    });

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
