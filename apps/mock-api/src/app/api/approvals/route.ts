export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module'); // ALL, ISSUE, TRANSFER, ADJUSTMENT, GR, RETURN

    const list: any[] = [];

    // 1. Pending Stock Issues
    if (!moduleFilter || moduleFilter === 'ALL' || moduleFilter === 'ISSUE') {
      const issues = await prisma.stockIssue.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: {
          department: true,
          sourceWarehouse: true,
          lines: { include: { item: true } },
        },
        orderBy: { requestDate: 'desc' },
      });
      for (const iss of issues) {
        const totalQty = iss.lines.reduce((s, l) => s + l.requestedQty, 0);
        list.push({
          id: iss.id,
          documentNumber: iss.issueNumber,
          documentType: 'ISSUE',
          typeLabel: 'ใบเบิกพัสดุ (Stock Issue)',
          module: 'ISSUE',
          requester: iss.requesterName,
          department: iss.department.name,
          sourceWarehouse: iss.sourceWarehouse.name,
          date: iss.requestDate,
          itemsCount: iss.lines.length,
          totalQty,
          status: iss.status,
          remark: iss.remark,
          lines: iss.lines,
          details: iss.lines.map((l) => `${l.item.itemName} (${l.requestedQty} ${l.unit})`).join(', '),
        });
      }
    }

    // 2. Pending Stock Transfers
    if (!moduleFilter || moduleFilter === 'ALL' || moduleFilter === 'TRANSFER') {
      const transfers = await prisma.stockTransfer.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: {
          sourceWarehouse: true,
          destWarehouse: true,
          lines: { include: { item: true } },
        },
        orderBy: { transferDate: 'desc' },
      });
      for (const trf of transfers) {
        const totalQty = trf.lines.reduce((s, l) => s + l.requestedQty, 0);
        list.push({
          id: trf.id,
          documentNumber: trf.transferNumber,
          documentType: 'TRANSFER',
          typeLabel: 'ใบโอนย้ายพัสดุ (Stock Transfer)',
          module: 'TRANSFER',
          requester: trf.createdBy,
          department: `${trf.sourceWarehouse.name} ➔ ${trf.destWarehouse.name}`,
          sourceWarehouse: trf.sourceWarehouse.name,
          destWarehouse: trf.destWarehouse.name,
          date: trf.transferDate,
          itemsCount: trf.lines.length,
          totalQty,
          status: trf.status,
          remark: trf.remark,
          lines: trf.lines,
          details: trf.lines.map((l) => `${l.item.itemName} (${l.requestedQty})`).join(', '),
        });
      }
    }

    // 3. Pending Stock Adjustments
    if (!moduleFilter || moduleFilter === 'ALL' || moduleFilter === 'ADJUSTMENT') {
      const adjs = await prisma.stockAdjustment.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: {
          warehouse: true,
          lines: { include: { item: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      for (const adj of adjs) {
        list.push({
          id: adj.id,
          documentNumber: adj.adjustmentNumber,
          documentType: 'ADJUSTMENT',
          typeLabel: `ใบปรับยอดพัสดุ (${adj.adjustmentType})`,
          module: 'ADJUSTMENT',
          requester: adj.requestedBy,
          department: adj.warehouse.name,
          warehouse: adj.warehouse.name,
          date: adj.createdAt,
          itemsCount: adj.lines.length,
          totalQty: adj.lines.reduce((s, l) => s + Math.abs(l.adjustmentQty), 0),
          status: adj.status,
          remark: adj.reason,
          lines: adj.lines,
          details: adj.lines.map((l) => `${l.item.itemName} (${l.adjustmentQty > 0 ? '+' : ''}${l.adjustmentQty})`).join(', '),
        });
      }
    }

    // 4. Pending Goods Receipts
    if (!moduleFilter || moduleFilter === 'ALL' || moduleFilter === 'GR') {
      const grs = await prisma.goodsReceipt.findMany({
        where: { status: 'DRAFT' },
        include: {
          supplier: true,
          warehouse: true,
          lines: { include: { item: true } },
        },
        orderBy: { receivingDate: 'desc' },
      });
      for (const gr of grs) {
        const totalQty = gr.lines.reduce((s, l) => s + l.receivedQty, 0);
        list.push({
          id: gr.id,
          documentNumber: gr.grNumber,
          documentType: 'GR',
          typeLabel: 'ใบรับสินค้าเข้าคลัง (Goods Receipt)',
          module: 'GR',
          requester: gr.createdBy,
          department: gr.supplier.name,
          supplier: gr.supplier.name,
          warehouse: gr.warehouse.name,
          date: gr.receivingDate,
          itemsCount: gr.lines.length,
          totalQty,
          status: gr.status,
          remark: gr.remark,
          lines: gr.lines,
          details: gr.lines.map((l) => `${l.item.itemName} (${l.receivedQty})`).join(', '),
        });
      }
    }

    // 5. Pending Purchase Requisitions (PR)
    if (!moduleFilter || moduleFilter === 'ALL' || moduleFilter === 'PR') {
      const prs = await prisma.purchaseRequisition.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: {
          plan: true,
          lines: { include: { item: true } },
        },
        orderBy: { requestDate: 'desc' },
      });
      for (const pr of prs) {
        const totalQty = pr.lines.reduce((s, l) => s + l.requestedQty, 0);
        list.push({
          id: pr.id,
          documentNumber: pr.prNumber,
          documentType: 'PR',
          typeLabel: `ใบขอซื้อพัสดุ (${pr.urgency === 'URGENT' ? 'ด่วน' : 'ปกติ'})`,
          module: 'PR',
          requester: pr.requesterName,
          department: pr.plan?.name || 'ฝ่ายจัดซื้อและพัสดุ',
          planName: pr.plan?.name,
          date: pr.requestDate,
          itemsCount: pr.lines.length,
          totalQty,
          totalAmount: pr.totalAmount,
          status: pr.status,
          remark: pr.justification,
          lines: pr.lines,
          details: pr.lines.map((l) => `${l.item.itemName} (${l.requestedQty} ${l.item.unit})`).join(', '),
        });
      }
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
