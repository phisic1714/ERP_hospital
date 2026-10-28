export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const userName = body.userName || 'เจ้าหน้าที่จัดซื้อ/คลัง';

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

    // Check if there is already an active DRAFT GR for this PO
    const existingDraft = await prisma.goodsReceipt.findFirst({
      where: {
        poId: po.id,
        status: { in: ['DRAFT', 'PENDING_APPROVAL', 'INSPECTION'] },
      },
      include: {
        lines: { include: { item: true } },
      },
    });

    if (existingDraft) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        gr: existingDraft,
        message: `มีใบตรวจรับสินค้า ${existingDraft.grNumber} สำหรับ PO นี้อยู่แล้ว`,
      });
    }

    // Check remaining items to receive
    const remainingLines = po.lines.filter(
      (l) => (l.remainingQty ?? (l.orderedQty - (l.receivedQty || 0))) > 0
    );

    if (remainingLines.length === 0) {
      return NextResponse.json(
        { error: 'ใบสั่งซื้อนี้รับสินค้าครบตามจำนวนแล้ว ไม่มียอดค้างรับ' },
        { status: 400 }
      );
    }

    // Get default warehouse
    const defaultWh = await prisma.warehouse.findFirst({
      where: { active: true },
      orderBy: { code: 'asc' },
    });
    const warehouseId = defaultWh?.id || 'wh-main-01';

    const grNumber = await generateDocumentNumber('GR');

    const newGR = await prisma.goodsReceipt.create({
      data: {
        grNumber,
        poId: po.id,
        poNumber: po.poNumber,
        supplierId: po.supplierId,
        warehouseId,
        receivingDate: new Date(),
        status: 'DRAFT',
        inspectionNotes: `ส่งข้อมูลรอตรวจรับจากใบสั่งซื้อ ${po.poNumber} (${po.supplier?.name || '-'})`,
        remark: 'ส่งข้อมูลอัตโนมัติจากใบสั่งซื้อเพื่อรอตรวจรับเข้าคลัง',
        createdBy: userName,
        lines: {
          create: remainingLines.map((l, idx) => {
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
              lotNumber: autoLot,
              expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
              unitPrice: l.unitPrice || l.item?.standardCost || 0,
              remark: 'รอตรวจรับสภาพ/Lot/วันหมดอายุ',
            };
          }),
        },
      },
      include: {
        lines: { include: { item: true } },
      },
    });

    await logAudit({
      userName,
      action: 'CREATE',
      module: 'GR',
      recordId: newGR.id,
      details: `ส่งข้อมูลจากใบสั่งซื้อ ${po.poNumber} ไปยังใบรับสินค้าฉบับร่าง ${newGR.grNumber} เพื่อรอตรวจรับเข้าคลัง`,
    });

    return NextResponse.json({
      success: true,
      gr: newGR,
      message: `ส่งข้อมูลไปรอตรวจรับสินค้า ${newGR.grNumber} เรียบร้อยแล้ว`,
    });
  } catch (error: any) {
    console.error('Send to GR Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
