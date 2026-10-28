export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const grs = await prisma.goodsReceipt.findMany({
      include: {
        po: true,
        supplier: true,
        warehouse: true,
        lines: {
          include: { item: true },
        },
      },
      orderBy: { receivingDate: 'desc' },
    });

    return NextResponse.json(grs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const grNumber = await generateDocumentNumber('GR');

    const gr = await prisma.goodsReceipt.create({
      data: {
        grNumber,
        poId: body.poId || null,
        poNumber: body.poNumber || null,
        supplierId: body.supplierId,
        warehouseId: body.warehouseId,
        receivingDate: new Date(body.receivingDate || Date.now()),
        status: 'DRAFT', // Starts as DRAFT -> inspect & post
        inspectionNotes: body.inspectionNotes,
        remark: body.remark,
        createdBy: body.userName || 'เจ้าหน้าที่คลัง',
        lines: {
          create: (body.lines || []).map((l: any) => ({
            poLineId: l.poLineId || null,
            itemId: l.itemId,
            orderedQty: parseFloat(l.orderedQty || '0'),
            previouslyReceived: parseFloat(l.previouslyReceived || '0'),
            remainingQty: parseFloat(l.remainingQty || '0'),
            receivedQty: parseFloat(l.receivedQty || '0'),
            acceptedQty: parseFloat(l.acceptedQty || l.receivedQty || '0'),
            rejectedQty: parseFloat(l.rejectedQty || '0'),
            quarantineQty: parseFloat(l.quarantineQty || '0'),
            lotNumber: l.lotNumber || `LOT-${Date.now().toString().slice(-6)}`,
            expiryDate: new Date(l.expiryDate || Date.now() + 365 * 24 * 3600 * 1000),
            unitPrice: parseFloat(l.unitPrice || '0'),
            locationId: l.locationId || null,
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
      module: 'GR',
      recordId: gr.id,
      details: `สร้างใบรับสินค้าเข้าคลังร่างเลขที่ ${grNumber} (อ้างอิง PO: ${body.poNumber || 'ไม่มี'})`,
    });

    return NextResponse.json(gr);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
