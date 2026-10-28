export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const userName = body.userName || 'ผู้อนุมัติจัดซื้อ';
    const action = body.action || 'APPROVE'; // APPROVE | SEND_TO_SUPPLIER | REJECT | CLOSE

    const po = await prisma.procurementPO.findUnique({
      where: { id: params.id },
      include: {
        supplier: true,
        lines: {
          include: { item: true },
        },
      },
    });

    if (!po) {
      return NextResponse.json({ error: 'ไม่พบใบสั่งซื้อนี้' }, { status: 404 });
    }

    if (action === 'SEND_TO_SUPPLIER') {
      if (po.status !== 'APPROVED') {
        return NextResponse.json({ error: 'สามารถส่งให้ผู้ขายได้เฉพาะใบสั่งซื้อที่อนุมัติแล้วเท่านั้น' }, { status: 400 });
      }
      const updatedPO = await prisma.procurementPO.update({
        where: { id: params.id },
        data: {
          status: 'ORDERED',
          sentToSupplierAt: new Date(),
        },
        include: { supplier: true, lines: { include: { item: true } } },
      });
      await logAudit({
        userName,
        action: 'SEND_TO_SUPPLIER',
        module: 'PO',
        recordId: po.id,
        details: `ส่งใบสั่งซื้อ ${po.poNumber} ให้ผู้ขาย ${po.supplier?.name} เรียบร้อย (รอส่งมอบสินค้า)`,
      });
      return NextResponse.json({ success: true, message: 'ส่งใบสั่งซื้อให้ผู้จำหน่ายเรียบร้อยแล้ว', po: updatedPO });
    }

    if (action === 'CLOSE') {
      const updatedPO = await prisma.procurementPO.update({
        where: { id: params.id },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
        include: { supplier: true, lines: { include: { item: true } } },
      });
      await logAudit({
        userName,
        action: 'CLOSE',
        module: 'PO',
        recordId: po.id,
        details: `ปิดเอกสารใบสั่งซื้อ ${po.poNumber} สมบูรณ์`,
      });
      return NextResponse.json({ success: true, message: 'ปิดเอกสารใบสั่งซื้อเรียบร้อยแล้ว', po: updatedPO });
    }

    if (action === 'REJECT') {
      const updatedPO = await prisma.procurementPO.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
        include: { supplier: true, lines: { include: { item: true } } },
      });
      await logAudit({
        userName,
        action: 'REJECT',
        module: 'PO',
        recordId: po.id,
        details: `ไม่อนุมัติใบสั่งซื้อ ${po.poNumber}: ${body.reason || '-'}`,
      });
      return NextResponse.json({ success: true, message: 'ปฏิเสธใบสั่งซื้อเรียบร้อยแล้ว', po: updatedPO });
    }

    // Default: APPROVE
    if (po.status === 'APPROVED' || po.status === 'ORDERED') {
      return NextResponse.json({ message: 'ใบสั่งซื้อนี้ได้รับการอนุมัติแล้ว', po });
    }

    const updatedPO = await prisma.procurementPO.update({
      where: { id: params.id },
      data: {
        status: 'APPROVED',
        approvedBy: userName,
        approvedAt: new Date(),
      },
      include: {
        supplier: true,
        lines: {
          include: { item: true },
        },
      },
    });

    await logAudit({
      userName,
      action: 'APPROVE',
      module: 'PO',
      recordId: po.id,
      details: `อนุมัติใบสั่งซื้อเลขที่ ${po.poNumber} สำหรับผู้ขาย ${po.supplier?.name || '-'} พร้อมส่งตรวจรับคลังสินค้า`,
    });

    // Auto-create Goods Receipt (GR) draft for warehouse inspection
    let draftGR = await prisma.goodsReceipt.findFirst({
      where: {
        poId: po.id,
        status: { in: ['DRAFT', 'PENDING_APPROVAL', 'INSPECTION'] },
      },
    });

    if (!draftGR) {
      const defaultWh = await prisma.warehouse.findFirst({
        where: { active: true },
        orderBy: { code: 'asc' },
      });
      const warehouseId = defaultWh?.id || 'wh-main-01';

      const { generateDocumentNumber } = await import('@/lib/doc-sequence');
      const grNumber = await generateDocumentNumber('GR');

      const linesToReceive = po.lines.filter(
        (l) => (l.remainingQty ?? (l.orderedQty - (l.receivedQty || 0))) > 0
      );

      if (linesToReceive.length > 0) {
        draftGR = await prisma.goodsReceipt.create({
          data: {
            grNumber,
            poId: po.id,
            poNumber: po.poNumber,
            supplierId: po.supplierId,
            warehouseId,
            receivingDate: new Date(),
            status: 'DRAFT',
            inspectionNotes: `ส่งข้อมูลรอตรวจรับอัตโนมัติจากการอนุมัติใบสั่งซื้อ ${po.poNumber}`,
            remark: 'ส่งข้อมูลอัตโนมัติเมื่ออนุมัติ PO เพื่อรอเจ้าหน้าที่คลังตรวจรับ',
            createdBy: userName,
            lines: {
              create: linesToReceive.map((l, idx) => {
                const rem = l.remainingQty ?? (l.orderedQty - (l.receivedQty || 0));
                const cleanCode = (l.item?.itemCode || 'MED').replace(/[^a-zA-Z0-9]/g, '').slice(-3);
                const autoLot = `LOT-${cleanCode}-${Date.now().toString().slice(-4)}${idx + 1}`;
                return {
                  poLineId: l.id,
                  itemId: l.itemId,
                  orderedQty: l.orderedQty,
                  previouslyReceived: l.receivedQty || 0,
                  remainingQty: rem,
                  receivedQty: rem,
                  acceptedQty: rem,
                  rejectedQty: 0,
                  quarantineQty: 0,
                  unitPrice: l.unitPrice,
                  lotNumber: autoLot,
                  expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 2), // default 2 years
                  remark: 'ร่างตรวจรับอัตโนมัติจากการอนุมัติ PO',
                };
              }),
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `อนุมัติใบสั่งซื้อ ${po.poNumber} สำเร็จ`,
      po: updatedPO,
      gr: draftGR,
    });
  } catch (error: any) {
    console.error('Error approving PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
