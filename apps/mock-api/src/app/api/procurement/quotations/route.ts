export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        supplier: true,
        rfq: { select: { id: true, rfqNumber: true, title: true, status: true, prNumber: true } },
        lines: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(quotations);
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Record a supplier quotation against an RFQ.
 * Body: { rfqId, supplierId, supplierQuoteRef?, quoteDate?, validUntil?, deliveryDays, paymentTerm?, warranty?,
 *         qualityScore?, remarks?, createdBy, lines: [{ rfqLineId, unitPrice, brand?, remark? }] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      rfqId,
      supplierId,
      supplierQuoteRef,
      quoteDate,
      validUntil,
      deliveryDays,
      paymentTerm,
      warranty,
      qualityScore,
      remarks,
      attachmentName,
      attachmentUrl,
      createdBy,
      lines,
    } = body;

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { lines: true, suppliers: true, quotations: true },
    });
    if (!rfq) return NextResponse.json({ error: 'ไม่พบคำขอใบเสนอราคา' }, { status: 404 });

    if (!['SENT', 'QUOTING'].includes(rfq.status)) {
      return NextResponse.json(
        { error: `บันทึกใบเสนอราคาได้เฉพาะ RFQ ที่ส่งแล้ว (ปัจจุบัน: ${rfq.status})` },
        { status: 400 }
      );
    }

    if (!supplierId) {
      return NextResponse.json({ error: 'กรุณาเลือกผู้จำหน่าย' }, { status: 400 });
    }

    if (rfq.quotations.some((q) => q.supplierId === supplierId && q.status !== 'CANCELLED')) {
      return NextResponse.json(
        { error: 'ผู้จำหน่ายรายนี้มีใบเสนอราคาสำหรับ RFQ นี้แล้ว' },
        { status: 400 }
      );
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'กรุณาระบุราคาต่อหน่วยของสินค้า' }, { status: 400 });
    }

    const priceByLine = new Map<string, any>(lines.map((l: any) => [l.rfqLineId, l]));
    const quoteLines = rfq.lines
      .filter((rl) => priceByLine.has(rl.id))
      .map((rl) => {
        const input = priceByLine.get(rl.id);
        const unitPrice = Number(input.unitPrice) || 0;
        return {
          rfqLineId: rl.id,
          itemId: rl.itemId,
          quantity: rl.quantity,
          unitPrice,
          totalAmount: unitPrice * rl.quantity,
          brand: input.brand || null,
          remark: input.remark || null,
        };
      });

    if (quoteLines.some((l) => l.unitPrice <= 0)) {
      return NextResponse.json({ error: 'ราคาต่อหน่วยต้องมากกว่า 0 ทุกรายการ' }, { status: 400 });
    }

    const totalAmount = quoteLines.reduce((s, l) => s + l.totalAmount, 0);
    const quotationNumber = await generateDocumentNumber('QT');

    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quotationNumber,
          supplierQuoteRef: supplierQuoteRef || null,
          rfqId: rfq.id,
          supplierId,
          quoteDate: quoteDate ? new Date(quoteDate) : new Date(),
          validUntil: validUntil ? new Date(validUntil) : null,
          deliveryDays: Number(deliveryDays) || 7,
          paymentTerm: paymentTerm || null,
          warranty: warranty || null,
          qualityScore: Math.min(5, Math.max(0, Number(qualityScore) || 0)),
          totalAmount,
          remarks: remarks || null,
          attachmentName: attachmentName || null,
          attachmentUrl: attachmentUrl || null,
          createdBy: createdBy || 'เจ้าหน้าที่จัดซื้อ',
          lines: { create: quoteLines },
        },
        include: { supplier: true },
      });

      // Mark invited supplier as responded (or add as walk-in supplier)
      const invited = rfq.suppliers.find((s) => s.supplierId === supplierId);
      if (invited) {
        await tx.rFQSupplier.update({ where: { id: invited.id }, data: { status: 'RESPONDED' } });
      } else {
        await tx.rFQSupplier.create({
          data: { rfqId: rfq.id, supplierId, status: 'RESPONDED' },
        });
      }

      if (rfq.status === 'SENT') {
        await tx.rFQ.update({ where: { id: rfq.id }, data: { status: 'QUOTING' } });
      }

      return q;
    });

    await logAudit({
      action: 'CREATE',
      module: 'QUOTATION',
      entityId: quotation.id,
      user: createdBy,
      remarks: `บันทึกใบเสนอราคา ${quotation.quotationNumber} จาก ${quotation.supplier?.name} สำหรับ ${rfq.rfqNumber} มูลค่า ${totalAmount.toLocaleString()} บาท`,
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
