export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trf = await prisma.stockTransfer.findUnique({
      where: { id: params.id },
      include: {
        sourceWarehouse: true,
        destWarehouse: true,
        lines: {
          include: { item: true },
        },
      },
    });

    if (!trf) {
      return NextResponse.json({ error: 'ไม่พบเอกสารโอนย้าย' }, { status: 404 });
    }

    return NextResponse.json(trf);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
