export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      supplierId,
      expectedDate,
      deliveryLocation,
      paymentTerms,
      creditDays,
      remarks,
      createdBy,
      selectedLineIds, // Array of line IDs if converting specific items
    } = body;

    if (!supplierId) {
      return NextResponse.json({ error: 'กรุณาเลือกผู้จัดจำหน่าย (Supplier)' }, { status: 400 });
    }

    const pr = await prisma.purchaseRequisition.findUnique({
      where: { id },
      include: {
        plan: true,
        department: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!pr) {
      return NextResponse.json({ error: 'ไม่พบใบขอซื้อที่ระบุ' }, { status: 404 });
    }

    if (pr.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `ใบขอซื้อต้องได้รับการอนุมัติ (APPROVED) ก่อนสร้างใบสั่งซื้อ (ปัจจุบัน: ${pr.status})` },
        { status: 400 }
      );
    }

    const activeRfq = await prisma.rFQ.findFirst({
      where: { prId: pr.id, status: { not: 'CANCELLED' } },
      select: { rfqNumber: true },
    });
    if (activeRfq) {
      return NextResponse.json(
        { error: `ใบขอซื้อนี้อยู่ระหว่างขอใบเสนอราคา (${activeRfq.rfqNumber}) กรุณาสร้าง PO จากหน้าเปรียบเทียบใบเสนอราคา` },
        { status: 400 }
      );
    }

    // Determine lines to convert (supports splitting PR across multiple POs / suppliers)
    const linesToConvert = Array.isArray(selectedLineIds) && selectedLineIds.length > 0
      ? pr.lines.filter((l) => selectedLineIds.includes(l.id))
      : pr.lines.filter((l) => (l.approvedQty || l.requestedQty) > (l.orderedQty || 0));

    if (linesToConvert.length === 0) {
      return NextResponse.json({ error: 'ทุกรายการในใบขอซื้อนี้ถูกออกใบสั่งซื้อครบแล้ว' }, { status: 400 });
    }

    const poNumber = await generateDocumentNumber('PO');

    // Calculate subtotal, discount, VAT 7%, and net total
    let subtotal = 0;
    const poLinesData = linesToConvert.map((l) => {
      const remainingToOrder = Math.max(0, (l.approvedQty || l.requestedQty) - (l.orderedQty || 0));
      const orderedQty = remainingToOrder > 0 ? remainingToOrder : (l.approvedQty || l.requestedQty);
      const unitPrice = l.estimatedUnitPrice;
      const lineSubtotal = orderedQty * unitPrice;
      const lineVat = Math.round(lineSubtotal * 0.07 * 100) / 100;
      const lineNet = lineSubtotal + lineVat;
      subtotal += lineSubtotal;
      return {
        itemId: l.itemId,
        prLineId: l.id,
        specification: l.specification || null,
        orderedQty,
        receivedQty: 0,
        remainingQty: orderedQty,
        unitPrice,
        discount: 0,
        taxRate: 7.0,
        vatAmount: lineVat,
        netAmount: lineNet,
        totalAmount: lineSubtotal,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        remark: l.remark || null,
        status: 'PENDING',
      };
    });

    const vatAmount = Math.round(subtotal * 0.07 * 100) / 100;
    const netAmount = subtotal + vatAmount;

    const budgetRef = pr.plan
      ? `${pr.plan.planNumber} • ${pr.plan.name} (${pr.plan.fiscalYear})`
      : pr.isUnplanned
      ? 'นอกแผนงบประมาณ (Unplanned)'
      : 'งบประมาณดำเนินการทั่วไป';

    const po = await prisma.$transaction(async (tx) => {
      // 1. Create PO with full financial fields & references
      const newPO = await tx.procurementPO.create({
        data: {
          poNumber,
          prId: pr.id,
          prNumber: pr.prNumber,
          supplierId,
          orderDate: new Date(),
          expectedDate: expectedDate ? new Date(expectedDate) : new Date(Date.now() + 7 * 24 * 3600 * 1000),
          deliveryLocation: deliveryLocation || 'คลังยาและเวชภัณฑ์กลาง อาคารเภสัชกรรม ชั้น 1',
          paymentTerms: paymentTerms || 'Credit 30 วัน',
          creditDays: Number(creditDays) || 30,
          budgetReference: budgetRef,
          subtotal,
          discount: 0,
          taxRate: 7.0,
          vatAmount,
          netAmount,
          totalAmount: subtotal, // Contract base
          status: 'PENDING_APPROVAL',
          remarks: remarks || `สร้างจากใบขอซื้อเลขที่ ${pr.prNumber}`,
          createdBy: createdBy || 'เจ้าหน้าที่จัดซื้อ',
          lines: {
            create: poLinesData,
          },
        },
        include: {
          lines: true,
          supplier: true,
        },
      });

      // 2. Increment orderedQty on converted PR lines
      for (const line of linesToConvert) {
        const remainingToOrder = Math.max(0, (line.approvedQty || line.requestedQty) - (line.orderedQty || 0));
        await tx.purchaseRequisitionLine.update({
          where: { id: line.id },
          data: {
            orderedQty: { increment: remainingToOrder > 0 ? remainingToOrder : line.approvedQty || line.requestedQty },
          },
        });
      }

      // 3. Check if all PR lines are now fully ordered
      const updatedPrLines = await tx.purchaseRequisitionLine.findMany({ where: { prId: pr.id } });
      const allDone = updatedPrLines.every((l) => (l.orderedQty || 0) >= (l.approvedQty || l.requestedQty));

      if (allDone) {
        await tx.purchaseRequisition.update({
          where: { id: pr.id },
          data: { status: 'PO_CREATED' },
        });
      }

      return newPO;
    });

    await logAudit({
      action: 'CONVERT_PR_TO_PO',
      module: 'PROCUREMENT_PO',
      entityId: po.id,
      entityNumber: po.poNumber,
      user: createdBy || 'เจ้าหน้าที่จัดซื้อ',
      remarks: `แปลงใบขอซื้อ ${pr.prNumber} เป็นใบสั่งซื้อ ${po.poNumber} (${poLinesData.length} รายการ มูลค่า ฿${netAmount.toLocaleString()} บาท รวม VAT)`,
    });

    return NextResponse.json({ success: true, po }, { status: 201 });
  } catch (error: any) {
    console.error('Error converting PR to PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
