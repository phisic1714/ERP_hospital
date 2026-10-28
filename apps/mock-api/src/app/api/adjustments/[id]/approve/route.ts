export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postStockAdjustment } from '@/lib/stock-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'APPROVE';
    const approverName = body.userName || 'ผู้จัดการคลังสินค้า';

    if (action === 'REJECT') {
      const updated = await prisma.stockAdjustment.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          approvedBy: approverName,
          approvedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    // Approve & Post
    const updated = await postStockAdjustment(params.id, approverName);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
