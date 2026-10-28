export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gr = await prisma.goodsReceipt.findUnique({
      where: { id: params.id },
      include: {
        po: true,
        supplier: true,
        warehouse: true,
        lines: {
          include: { item: true },
        },
      },
    });

    if (!gr) {
      return NextResponse.json({ error: 'ไม่พบเอกสารใบรับสินค้า' }, { status: 404 });
    }

    return NextResponse.json(gr);
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
    const gr = await prisma.goodsReceipt.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!gr) {
      return NextResponse.json({ error: 'ไม่พบเอกสารใบรับสินค้า' }, { status: 404 });
    }

    if (gr.status === 'POSTED') {
      return NextResponse.json(
        { error: 'ไม่สามารถแก้ไขเอกสารที่บันทึกรับเข้าคลังเรียบร้อยแล้วได้' },
        { status: 400 }
      );
    }

    let totalAccepted = 0;
    let totalRejected = 0;
    let totalQuarantine = 0;

    // Update lines if provided
    if (body.lines && Array.isArray(body.lines)) {
      for (const l of body.lines) {
        const accepted = parseFloat(l.acceptedQty || '0');
        const rejected = parseFloat(l.rejectedQty || '0');
        const quarantine = parseFloat(l.quarantineQty || '0');
        const received = parseFloat(l.receivedQty || (accepted + rejected + quarantine).toString());

        totalAccepted += accepted;
        totalRejected += rejected;
        totalQuarantine += quarantine;

        if (l.id) {
          await prisma.goodsReceiptLine.update({
            where: { id: l.id },
            data: {
              receivedQty: received,
              acceptedQty: accepted,
              rejectedQty: rejected,
              quarantineQty: quarantine,
              lotNumber: l.lotNumber || `LOT-${Date.now().toString().slice(-6)}`,
              expiryDate: l.expiryDate ? new Date(l.expiryDate) : new Date(Date.now() + 365 * 24 * 3600 * 1000),
              locationId: l.locationId || null,
              remark: l.remark || null,
            },
          });
        }
      }
    } else {
      totalAccepted = gr.totalAccepted;
      totalRejected = gr.totalRejected;
      totalQuarantine = gr.totalQuarantine;
    }

    // Update GoodsReceipt parent record
    const updatedGR = await prisma.goodsReceipt.update({
      where: { id: params.id },
      data: {
        warehouseId: body.warehouseId || gr.warehouseId,
        inspectionNotes: body.inspectionNotes !== undefined ? body.inspectionNotes : gr.inspectionNotes,
        remark: body.remark !== undefined ? body.remark : gr.remark,
        totalAccepted,
        totalRejected,
        totalQuarantine,
      },
      include: {
        po: true,
        supplier: true,
        warehouse: true,
        lines: {
          include: { item: true },
        },
      },
    });

    return NextResponse.json(updatedGR);
  } catch (error: any) {
    console.error('Update GR Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

