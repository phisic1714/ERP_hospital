export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';
import { rfqInclude } from '@/lib/rfq';

export async function GET() {
  try {
    const rfqs = await prisma.rFQ.findMany({
      include: rfqInclude,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(rfqs);
  } catch (error: any) {
    console.error('Error fetching RFQs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Create RFQ either from an APPROVED PR (prId) or manually (lines).
 * Body: { prId?, title, dueDate?, remarks?, supplierIds: string[], lines?: [{itemId, quantity, estimatedUnitPrice, specification}], createdBy, send?: boolean }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prId, title, dueDate, remarks, supplierIds, createdBy, send } = body;
    let { lines } = body;

    if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json({ error: 'กรุณาเลือกผู้จำหน่ายที่จะส่งคำขอใบเสนอราคาอย่างน้อย 1 ราย' }, { status: 400 });
    }

    let pr: any = null;
    if (prId) {
      pr = await prisma.purchaseRequisition.findUnique({
        where: { id: prId },
        include: { lines: true, rfqs: { select: { id: true, rfqNumber: true, status: true } } },
      });
      if (!pr) return NextResponse.json({ error: 'ไม่พบใบขอซื้อที่ระบุ' }, { status: 404 });
      if (pr.status !== 'APPROVED') {
        return NextResponse.json(
          { error: `ใบขอซื้อต้องอยู่ในสถานะอนุมัติแล้ว จึงจะขอใบเสนอราคาได้ (ปัจจุบัน: ${pr.status})` },
          { status: 400 }
        );
      }
      const activeRfq = pr.rfqs.find((r: any) => r.status !== 'CANCELLED');
      if (activeRfq) {
        return NextResponse.json(
          { error: `ใบขอซื้อนี้มีคำขอใบเสนอราคา ${activeRfq.rfqNumber} อยู่แล้ว` },
          { status: 400 }
        );
      }
      lines = pr.lines.map((l: any) => ({
        itemId: l.itemId,
        quantity: l.approvedQty || l.requestedQty,
        estimatedUnitPrice: l.estimatedUnitPrice,
      }));
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'กรุณาระบุรายการสินค้าที่ต้องการขอราคา' }, { status: 400 });
    }

    const rfqNumber = await generateDocumentNumber('RFQ');
    const uniqueSupplierIds = Array.from(new Set<string>(supplierIds));

    const rfq = await prisma.rFQ.create({
      data: {
        rfqNumber,
        prId: pr?.id || null,
        prNumber: pr?.prNumber || null,
        title: title || (pr ? `ขอใบเสนอราคาตามใบขอซื้อ ${pr.prNumber}` : 'ขอใบเสนอราคา'),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 3600 * 1000),
        status: send ? 'SENT' : 'DRAFT',
        remarks: remarks || null,
        createdBy: createdBy || 'เจ้าหน้าที่จัดซื้อ',
        lines: {
          create: lines.map((l: any) => ({
            itemId: l.itemId,
            quantity: Number(l.quantity) || 0,
            estimatedUnitPrice: Number(l.estimatedUnitPrice) || 0,
            specification: l.specification || null,
          })),
        },
        suppliers: {
          create: uniqueSupplierIds.map((sid) => ({ supplierId: sid })),
        },
      },
      include: { lines: true, suppliers: true },
    });

    await logAudit({
      action: 'CREATE',
      module: 'RFQ',
      entityId: rfq.id,
      user: createdBy || 'เจ้าหน้าที่จัดซื้อ',
      remarks: `สร้างคำขอใบเสนอราคา ${rfq.rfqNumber}${pr ? ` อ้างอิงใบขอซื้อ ${pr.prNumber}` : ''} ส่งถึงผู้จำหน่าย ${uniqueSupplierIds.length} ราย`,
    });

    return NextResponse.json(rfq, { status: 201 });
  } catch (error: any) {
    console.error('Error creating RFQ:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
