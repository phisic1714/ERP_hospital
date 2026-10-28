export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');

    const items = await prisma.item.findMany({
      where: {
        active: true,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { itemCode: { contains: search } },
                { itemName: { contains: search } },
                { genericName: { contains: search } },
                { barcode: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        unitConversions: true,
        stockBalances: {
          include: { warehouse: true },
        },
        lots: {
          where: { currentQty: { gt: 0 } },
          include: { warehouse: true },
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { itemCode: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check unique itemCode
    const existing = await prisma.item.findUnique({
      where: { itemCode: body.itemCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: `รหัสสินค้า ${body.itemCode} มีอยู่ในระบบแล้ว (Item code already exists)` },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        itemCode: body.itemCode,
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
        lotControl: body.lotControl ?? true,
        expiryControl: body.expiryControl ?? true,
        temperatureReq: body.temperatureReq,
      },
    });

    if (body.purchaseUnit && body.conversionRate > 1) {
      await prisma.unitConversion.create({
        data: {
          itemId: item.id,
          fromUnit: body.purchaseUnit,
          toUnit: body.unit,
          conversionRate: parseFloat(body.conversionRate),
        },
      });
    }

    await logAudit({
      userName: body.userName || 'System',
      action: 'CREATE',
      module: 'ITEM',
      recordId: item.id,
      details: `สร้างข้อมูลสินค้าใหม่: [${item.itemCode}] ${item.itemName}`,
    });

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
