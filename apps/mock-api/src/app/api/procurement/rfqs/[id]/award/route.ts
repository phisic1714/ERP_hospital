export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

/**
 * Record the comparison result (award winner).
 * Body: { quotationId, criteria, reason, userName }
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { quotationId, criteria, reason, userName } = await req.json();

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { quotations: { include: { supplier: true } } },
    });
    if (!rfq) return NextResponse.json({ error: 'ไม่พบคำขอใบเสนอราคา' }, { status: 404 });

    if (!['SENT', 'QUOTING', 'AWARDED'].includes(rfq.status)) {
      return NextResponse.json(
        { error: `ไม่สามารถบันทึกผลคัดเลือกได้ เอกสารอยู่ในสถานะ ${rfq.status}` },
        { status: 400 }
      );
    }

    const winner = rfq.quotations.find((q) => q.id === quotationId && q.status !== 'CANCELLED');
    if (!winner) {
      return NextResponse.json({ error: 'ไม่พบใบเสนอราคาที่เลือก' }, { status: 400 });
    }

    if (!reason || !String(reason).trim()) {
      return NextResponse.json({ error: 'กรุณาระบุเหตุผลในการคัดเลือก' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.quotation.updateMany({
        where: { rfqId: rfq.id, status: { not: 'CANCELLED' } },
        data: { status: 'NOT_SELECTED' },
      });
      await tx.quotation.update({ where: { id: winner.id }, data: { status: 'SELECTED' } });
      return tx.rFQ.update({
        where: { id: rfq.id },
        data: {
          status: 'AWARDED',
          selectedQuotationId: winner.id,
          selectionCriteria: criteria || 'BEST_VALUE',
          selectionReason: reason,
          comparedBy: userName || 'คณะกรรมการจัดซื้อ',
          comparedAt: new Date(),
        },
      });
    });

    await logAudit({
      action: 'AWARD',
      module: 'QUOTATION_COMPARISON',
      entityId: rfq.id,
      user: userName,
      remarks: `คัดเลือก ${winner.supplier?.name} (${winner.quotationNumber}) มูลค่า ${winner.totalAmount.toLocaleString()} บาท จาก ${rfq.rfqNumber}: ${reason}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error awarding RFQ:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
