export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, approvedBy, rejectReason, returnReason } = body; // action: 'APPROVE' | 'REJECT' | 'RETURN'

    const pr = await prisma.purchaseRequisition.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!pr) {
      return NextResponse.json({ error: 'ไม่พบใบขอซื้อที่ระบุ' }, { status: 404 });
    }

    if (pr.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ error: `ไม่สามารถดำเนินการได้ เอกสารอยู่ในสถานะ ${pr.status}` }, { status: 400 });
    }

    if (action === 'RETURN') {
      // Return for revision (as shown in Workflow Diagram 1)
      await prisma.$transaction(async (tx) => {
        await tx.purchaseRequisition.update({
          where: { id },
          data: {
            status: 'RETURNED',
            returnReason: returnReason || 'ส่งกลับแก้ไข',
            returnedBy: approvedBy || 'ผู้อนุมัติ',
            returnedAt: new Date(),
          },
        });

        // Temporarily release committed budget while revising
        if (pr.planId) {
          await tx.procurementPlan.update({
            where: { id: pr.planId },
            data: {
              committedBudget: { decrement: pr.totalAmount },
              remainingBudget: { increment: pr.totalAmount },
            },
          });
        }
      });

      await logAudit({
        action: 'RETURN_FOR_REVISION',
        module: 'PURCHASE_REQUISITION',
        entityId: pr.id,
        entityNumber: pr.prNumber,
        user: approvedBy || 'ผู้อนุมัติ',
        remarks: returnReason || 'ส่งกลับแก้ไขข้อมูลใบขอซื้อ',
      });

      return NextResponse.json({ success: true, message: 'ส่งกลับใบขอซื้อเพื่อแก้ไขเรียบร้อยแล้ว' });
    }

    if (action === 'REJECT') {
      // If rejected, restore committed budget to plan
      await prisma.$transaction(async (tx) => {
        await tx.purchaseRequisition.update({
          where: { id },
          data: {
            status: 'REJECTED',
            rejectReason: rejectReason || 'ไม่อนุมัติ',
          },
        });

        if (pr.planId) {
          await tx.procurementPlan.update({
            where: { id: pr.planId },
            data: {
              committedBudget: { decrement: pr.totalAmount },
              remainingBudget: { increment: pr.totalAmount },
            },
          });
        }
      });

      await logAudit({
        action: 'REJECT',
        module: 'PURCHASE_REQUISITION',
        entityId: pr.id,
        entityNumber: pr.prNumber,
        user: approvedBy || 'ผู้อนุมัติ',
        remarks: rejectReason || 'ไม่อนุมัติคำขอซื้อ',
      });

      return NextResponse.json({ success: true, message: 'ปฏิเสธใบขอซื้อเรียบร้อยแล้ว' });
    }

    // Approve
    const updated = await prisma.purchaseRequisition.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || 'ผู้อนุมัติ',
        approvedAt: new Date(),
      },
    });

    await logAudit({
      action: 'APPROVE',
      module: 'PURCHASE_REQUISITION',
      entityId: pr.id,
      entityNumber: pr.prNumber,
      user: approvedBy || 'ผู้อนุมัติ',
      remarks: 'อนุมัติใบขอซื้อเรียบร้อย พร้อมออกใบสั่งซื้อ (PO)',
    });

    return NextResponse.json({ success: true, requisition: updated });
  } catch (error: any) {
    console.error('Error approving PR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
