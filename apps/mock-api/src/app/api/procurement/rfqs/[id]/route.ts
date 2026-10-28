export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { rfqInclude } from '@/lib/rfq';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id }, include: rfqInclude });
    if (!rfq) return NextResponse.json({ error: 'ไม่พบคำขอใบเสนอราคา' }, { status: 404 });
    return NextResponse.json(rfq);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH actions: { action: 'SEND' | 'CANCEL', userName, reason? }
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { action, userName, reason } = await req.json();
    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } });
    if (!rfq) return NextResponse.json({ error: 'ไม่พบคำขอใบเสนอราคา' }, { status: 404 });

    if (action === 'SEND') {
      if (rfq.status !== 'DRAFT') {
        return NextResponse.json({ error: 'ส่งได้เฉพาะคำขอใบเสนอราคาที่เป็นฉบับร่าง' }, { status: 400 });
      }
      const updated = await prisma.rFQ.update({
        where: { id: rfq.id },
        data: { status: 'SENT', issueDate: new Date() },
      });
      await logAudit({
        action: 'SEND',
        module: 'RFQ',
        entityId: rfq.id,
        user: userName,
        remarks: `ส่งคำขอใบเสนอราคา ${rfq.rfqNumber} ให้ผู้จำหน่าย`,
      });
      return NextResponse.json(updated);
    }

    if (action === 'CANCEL') {
      if (['AWARDED', 'PO_CREATED', 'CANCELLED'].includes(rfq.status)) {
        return NextResponse.json({ error: `ไม่สามารถยกเลิกได้ เอกสารอยู่ในสถานะ ${rfq.status}` }, { status: 400 });
      }
      const updated = await prisma.$transaction(async (tx) => {
        await tx.quotation.updateMany({
          where: { rfqId: rfq.id },
          data: { status: 'CANCELLED' },
        });
        return tx.rFQ.update({
          where: { id: rfq.id },
          data: { status: 'CANCELLED', remarks: reason ? `ยกเลิก: ${reason}` : rfq.remarks },
        });
      });
      await logAudit({
        action: 'CANCEL',
        module: 'RFQ',
        entityId: rfq.id,
        user: userName,
        remarks: `ยกเลิกคำขอใบเสนอราคา ${rfq.rfqNumber}${reason ? ` (${reason})` : ''}`,
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'action ไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating RFQ:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
