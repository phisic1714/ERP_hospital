export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const transfers = await prisma.stockTransfer.findMany({
      include: {
        sourceWarehouse: true,
        destWarehouse: true,
        lines: {
          include: { item: true },
        },
      },
      orderBy: { transferDate: 'desc' },
    });

    return NextResponse.json(transfers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.sourceWarehouseId === body.destinationWarehouseId) {
      return NextResponse.json(
        { error: 'คลังต้นทางและคลังปลายทางต้องไม่ใช่คลังเดียวกัน' },
        { status: 400 }
      );
    }

    const transferNumber = await generateDocumentNumber('TRF');

    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNumber,
        sourceWarehouseId: body.sourceWarehouseId,
        destinationWarehouseId: body.destinationWarehouseId,
        transferDate: new Date(body.transferDate || Date.now()),
        status: 'PENDING_APPROVAL',
        remark: body.remark,
        createdBy: body.userName || 'เจ้าหน้าที่คลัง',
        lines: {
          create: (body.lines || []).map((l: any) => ({
            itemId: l.itemId,
            requestedQty: parseFloat(l.requestedQty),
            dispatchedQty: 0,
            receivedQty: 0,
            lotNumber: l.lotNumber || null,
            remark: l.remark,
          })),
        },
      },
      include: {
        lines: true,
      },
    });

    await logAudit({
      userName: body.userName || 'เจ้าหน้าที่คลัง',
      action: 'CREATE',
      module: 'TRANSFER',
      recordId: transfer.id,
      details: `สร้างใบขอโอนย้ายพัสดุเลขที่ ${transferNumber} จากคลังต้นทางไปปลายทาง`,
    });

    return NextResponse.json(transfer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
