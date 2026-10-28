export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const pos = await prisma.procurementPO.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      include: {
        supplier: true,
        requisition: {
          include: {
            plan: true,
            department: true,
          },
        },
        rfq: {
          select: { id: true, rfqNumber: true, title: true, status: true },
        },
        quotation: {
          select: {
            id: true,
            quotationNumber: true,
            supplierQuoteRef: true,
            deliveryDays: true,
            paymentTerm: true,
            warranty: true,
            qualityScore: true,
          },
        },
        lines: {
          include: {
            item: {
              include: { category: true },
            },
          },
        },
        goodsReceipts: {
          select: {
            id: true,
            grNumber: true,
            status: true,
            receivingDate: true,
            totalAccepted: true,
          },
          orderBy: { receivingDate: 'desc' },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    return NextResponse.json(pos);
  } catch (error: any) {
    console.error('Error fetching POs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      supplierId,
      prId,
      prNumber,
      rfqId,
      rfqNumber,
      quotationId,
      quotationNumber,
      supplierQuoteRef,
      orderDate,
      expectedDate,
      deliveryLocation,
      paymentTerms,
      creditDays,
      budgetReference,
      remarks,
      attachmentName,
      attachmentUrl,
      createdBy,
      status,
      lines,
    } = body;

    if (!supplierId) {
      return NextResponse.json({ error: 'กรุณาเลือกผู้จัดจำหน่าย (Supplier)' }, { status: 400 });
    }

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'กรุณาระบุรายการสินค้าในใบสั่งซื้ออย่างน้อย 1 รายการ' }, { status: 400 });
    }

    const poNumber = await generateDocumentNumber('PO');

    // Calculate financials
    let subtotal = 0;
    let totalDiscount = 0;
    const formattedLines = lines.map((l: any) => {
      const qty = parseFloat(l.orderedQty) || 0;
      const price = parseFloat(l.unitPrice) || 0;
      const lineDisc = parseFloat(l.discount) || 0;
      const lineBase = qty * price - lineDisc;
      const lineVat = Math.round(lineBase * 0.07 * 100) / 100;
      const lineNet = lineBase + lineVat;
      subtotal += qty * price;
      totalDiscount += lineDisc;
      return {
        itemId: l.itemId,
        prLineId: l.prLineId || null,
        specification: l.specification || null,
        orderedQty: qty,
        receivedQty: 0,
        remainingQty: qty,
        unitPrice: price,
        discount: lineDisc,
        taxRate: 7.0,
        vatAmount: lineVat,
        netAmount: lineNet,
        totalAmount: lineBase,
        expectedDate: l.expectedDate ? new Date(l.expectedDate) : null,
        remark: l.remark || null,
        status: 'PENDING',
      };
    });

    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const vatAmount = Math.round(taxableAmount * 0.07 * 100) / 100;
    const netAmount = taxableAmount + vatAmount;

    const po = await prisma.procurementPO.create({
      data: {
        poNumber,
        prId: prId || null,
        prNumber: prNumber || null,
        rfqId: rfqId || null,
        rfqNumber: rfqNumber || null,
        quotationId: quotationId || null,
        quotationNumber: quotationNumber || null,
        supplierQuoteRef: supplierQuoteRef || null,
        supplierId,
        orderDate: new Date(orderDate || Date.now()),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        deliveryLocation: deliveryLocation || 'คลังยาและเวชภัณฑ์กลาง อาคารเภสัชกรรม ชั้น 1',
        paymentTerms: paymentTerms || 'Credit 30 วัน',
        creditDays: Number(creditDays) || 30,
        budgetReference: budgetReference || null,
        subtotal,
        discount: totalDiscount,
        taxRate: 7.0,
        vatAmount,
        netAmount,
        totalAmount: taxableAmount,
        status: status || 'PENDING_APPROVAL',
        remarks: remarks || null,
        attachmentName: attachmentName || null,
        attachmentUrl: attachmentUrl || null,
        createdBy: createdBy || body.userName || 'เจ้าหน้าที่จัดซื้อ',
        lines: {
          create: formattedLines,
        },
      },
      include: {
        supplier: true,
        lines: {
          include: { item: true },
        },
      },
    });

    await logAudit({
      userName: po.createdBy,
      action: 'CREATE',
      module: 'PO',
      recordId: po.id,
      details:
        po.status === 'APPROVED'
          ? `สร้างใบสั่งซื้อ PO เลขที่ ${poNumber} สำหรับ ${po.supplier?.name} มูลค่า ฿${netAmount.toLocaleString()} บาท (รวม VAT 7%)`
          : `สร้างใบสั่งซื้อ PO เลขที่ ${poNumber} สำหรับ ${po.supplier?.name} (สถานะ: รออนุมัติ PO)`,
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error: any) {
    console.error('Error creating PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
