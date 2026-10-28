export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postGoodsReceipt } from '@/lib/stock-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const postedBy = body.userName || 'เจ้าหน้าที่ตรวจรับคลัง';

    // If body contains updated inspection lines (e.g. acceptedQty, rejectedQty, quarantineQty, lotNumber, expiryDate)
    if (body.lines && Array.isArray(body.lines)) {
      for (const l of body.lines) {
        if (l.id) {
          const accepted = parseFloat(l.acceptedQty || '0');
          const rejected = parseFloat(l.rejectedQty || '0');
          const quarantine = parseFloat(l.quarantineQty || '0');
          const received = parseFloat(l.receivedQty || (accepted + rejected + quarantine).toString());

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
    }

    if (body.inspectionNotes) {
      await prisma.goodsReceipt.update({
        where: { id: params.id },
        data: { inspectionNotes: body.inspectionNotes },
      });
    }

    const updatedGR = await postGoodsReceipt(params.id, postedBy);
    return NextResponse.json(updatedGR);
  } catch (error: any) {
    console.error('Post GR Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
