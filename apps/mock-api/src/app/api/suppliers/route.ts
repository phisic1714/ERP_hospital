export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
      include: {
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            lines: {
              include: { item: true },
            },
          },
        },
        _count: {
          select: {
            purchaseOrders: true,
            goodsReceipts: true,
          },
        },
      },
    });
    return NextResponse.json(suppliers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, taxId, contactPerson, phone, email, address, paymentTerm } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสและชื่อผู้จัดจำหน่าย' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        code,
        name,
        taxId,
        contactPerson,
        phone,
        email,
        address,
        paymentTerm: paymentTerm || 'Credit 30 Days',
        active: true,
      },
    });

    return NextResponse.json(supplier);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
