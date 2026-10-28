export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const pr = await prisma.purchaseRequisition.findUnique({
      where: { id: params.id },
      include: {
        plan: true,
        department: true,
        lines: {
          include: {
            item: {
              include: { category: true },
            },
          },
        },
        purchaseOrders: {
          include: {
            supplier: true,
            goodsReceipts: {
              select: { id: true, grNumber: true, status: true, totalAccepted: true },
            },
          },
        },
        rfqs: {
          include: {
            suppliers: { include: { supplier: true } },
            quotations: { include: { supplier: true } },
          },
        },
      },
    });

    if (!pr) return NextResponse.json({ error: 'ไม่พบใบขอซื้อที่ระบุ' }, { status: 404 });
    return NextResponse.json(pr);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Update / Resubmit PR:
 * Allowed only when PR is in DRAFT or RETURNED status.
 * Once APPROVED or PO_CREATED, direct edits are blocked (per hospital compliance policy).
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const pr = await prisma.purchaseRequisition.findUnique({
      where: { id: params.id },
      include: { lines: true },
    });

    if (!pr) return NextResponse.json({ error: 'ไม่พบใบขอซื้อที่ระบุ' }, { status: 404 });

    if (!['DRAFT', 'RETURNED'].includes(pr.status)) {
      return NextResponse.json(
        {
          error: `ไม่อนุญาตให้แก้ไขใบขอซื้อโดยตรงเมื่ออยู่ในสถานะ ${pr.status} (ต้องส่งกลับแก้ไข หรือทำเอกสารใหม่ตามระเบียบจัดซื้อ)`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      departmentId,
      requiredDate,
      urgency,
      purchaseType,
      justification,
      lines,
      resubmit,
      userName,
    } = body;

    let totalAmount = 0;
    const formattedLines = (lines || pr.lines).map((l: any) => {
      const qty = Number(l.requestedQty) || 0;
      const unitPrice = Number(l.estimatedUnitPrice) || 0;
      const lineTotal = qty * unitPrice;
      totalAmount += lineTotal;
      return {
        itemId: l.itemId,
        specification: l.specification || null,
        remark: l.remark || null,
        currentStock: Number(l.currentStock) || 0,
        reorderPoint: Number(l.reorderPoint) || 0,
        requestedQty: qty,
        approvedQty: qty,
        orderedQty: 0,
        estimatedUnitPrice: unitPrice,
        estimatedTotal: lineTotal,
        status: 'PENDING',
      };
    });

    // Re-check plan budget if linked
    if (pr.planId) {
      const plan = await prisma.procurementPlan.findUnique({ where: { id: pr.planId } });
      if (plan && plan.remainingBudget < totalAmount) {
        return NextResponse.json(
          {
            error: `ยอดเงินขอซื้อแก้ไข (${totalAmount.toLocaleString()} บาท) เกินงบประมาณคงเหลือของแผน (${plan.remainingBudget.toLocaleString()} บาท)`,
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old lines and re-create if lines provided
      if (Array.isArray(lines) && lines.length > 0) {
        await tx.purchaseRequisitionLine.deleteMany({ where: { prId: pr.id } });
      }

      const nextStatus = resubmit ? 'PENDING_APPROVAL' : pr.status;

      const p = await tx.purchaseRequisition.update({
        where: { id: pr.id },
        data: {
          departmentId: departmentId ?? pr.departmentId,
          requiredDate: requiredDate ? new Date(requiredDate) : pr.requiredDate,
          urgency: urgency || pr.urgency,
          purchaseType: purchaseType || pr.purchaseType,
          justification: justification ?? pr.justification,
          totalAmount,
          status: nextStatus,
          lines:
            Array.isArray(lines) && lines.length > 0
              ? {
                  create: formattedLines,
                }
              : undefined,
        },
        include: { lines: true, department: true, plan: true },
      });

      // If resubmitting with plan, re-commit budget
      if (resubmit && pr.planId) {
        await tx.procurementPlan.update({
          where: { id: pr.planId },
          data: {
            committedBudget: { increment: totalAmount },
            remainingBudget: { decrement: totalAmount },
          },
        });
      }

      return p;
    });

    await logAudit({
      action: resubmit ? 'RESUBMIT' : 'UPDATE',
      module: 'PURCHASE_REQUISITION',
      entityId: pr.id,
      entityNumber: pr.prNumber,
      user: userName || 'ผู้ขอซื้อ',
      remarks: resubmit
        ? `แก้ไขและส่งอนุมัติใบขอซื้อ ${pr.prNumber} ใหม่อีกครั้ง (ยอดเงิน ${totalAmount.toLocaleString()} บาท)`
        : `บันทึกการแก้ไขใบขอซื้อ ${pr.prNumber}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating PR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
