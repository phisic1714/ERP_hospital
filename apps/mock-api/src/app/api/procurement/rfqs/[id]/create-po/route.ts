export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

/**
 * Create a PO (status PENDING_APPROVAL) from the awarded quotation of an RFQ.
 * Body: { expectedDate?, remarks?, createdBy }
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { expectedDate, remarks, createdBy } = await req.json().catch(() => ({}));

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: { quotations: { include: { lines: true, supplier: true } } },
    });
    if (!rfq) return NextResponse.json({ error: 'ไม่พบคำขอใบเสนอราคา' }, { status: 404 });

    if (rfq.status !== 'AWARDED' || !rfq.selectedQuotationId) {
      return NextResponse.json(
        { error: 'ต้องบันทึกผลการเปรียบเทียบและคัดเลือกผู้จำหน่ายก่อนสร้างใบสั่งซื้อ' },
        { status: 400 }
      );
    }

    const winner = rfq.quotations.find((q) => q.id === rfq.selectedQuotationId);
    if (!winner) return NextResponse.json({ error: 'ไม่พบใบเสนอราคาที่ได้รับคัดเลือก' }, { status: 400 });

    const poNumber = await generateDocumentNumber('PO');
    const leadTime = (winner.deliveryDays || 7) * 24 * 3600 * 1000;

    const po = await prisma.$transaction(async (tx) => {
      const newPO = await tx.procurementPO.create({
        data: {
          poNumber,
          prId: rfq.prId,
          prNumber: rfq.prNumber,
          rfqId: rfq.id,
          rfqNumber: rfq.rfqNumber,
          supplierId: winner.supplierId,
          orderDate: new Date(),
          expectedDate: expectedDate ? new Date(expectedDate) : new Date(Date.now() + leadTime),
          totalAmount: winner.totalAmount,
          status: 'PENDING_APPROVAL',
          remarks:
            remarks ||
            `สร้างจากผลเปรียบเทียบราคา ${rfq.rfqNumber} (ใบเสนอราคา ${winner.quotationNumber})`,
          createdBy: createdBy || 'เจ้าหน้าที่จัดซื้อ',
          lines: {
            create: winner.lines.map((l) => ({
              itemId: l.itemId,
              orderedQty: l.quantity,
              receivedQty: 0,
              remainingQty: l.quantity,
              unitPrice: l.unitPrice,
              totalAmount: l.totalAmount,
              status: 'PENDING',
            })),
          },
        },
      });

      await tx.rFQ.update({
        where: { id: rfq.id },
        data: { status: 'PO_CREATED', poId: newPO.id, poNumber: newPO.poNumber },
      });

      if (rfq.prId) {
        await tx.purchaseRequisition.update({
          where: { id: rfq.prId },
          data: { status: 'PO_CREATED' },
        });
      }

      return newPO;
    });

    await logAudit({
      action: 'CREATE_PO_FROM_RFQ',
      module: 'PROCUREMENT_PO',
      entityId: po.id,
      user: createdBy,
      remarks: `สร้างใบสั่งซื้อ ${po.poNumber} จาก ${rfq.rfqNumber} ผู้จำหน่าย ${winner.supplier?.name} มูลค่า ${po.totalAmount.toLocaleString()} บาท (รออนุมัติ PO)`,
    });

    return NextResponse.json({ success: true, po }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating PO from RFQ:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
