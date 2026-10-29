export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const requisitions = await prisma.purchaseRequisition.findMany({
      include: {
        plan: true,
        department: true,
        lines: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
        purchaseOrders: {
          select: {
            id: true,
            poNumber: true,
            status: true,
            totalAmount: true,
            supplier: {
              select: { name: true, code: true },
            },
          },
        },
        rfqs: {
          select: { id: true, rfqNumber: true, status: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requisitions);
  } catch (error: any) {
    console.error('Error fetching purchase requisitions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      planId,
      planNumber,
      departmentId,
      departmentName,
      allocationId,
      budgetCode,
      warehouseId,
      requiredDate,
      urgency,
      purchaseType,
      budgetYear,
      isUnplanned,
      unplannedReason,
      attachmentName,
      attachmentUrl,
      justification,
      requesterName,
      lines,
    } = body;

    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: 'กรุณาระบุรายการสินค้าที่ต้องการขอซื้ออย่างน้อย 1 รายการ' }, { status: 400 });
    }

    if (isUnplanned && (!unplannedReason || !unplannedReason.trim())) {
      return NextResponse.json({ error: 'กรณีขอซื้อนอกแผนงบประมาณ กรุณาระบุเหตุผลความจำเป็นเร่งด่วน' }, { status: 400 });
    }

    // Calculate total
    let totalAmount = 0;
    const formattedLines = lines.map((l: any) => {
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

    // Check Plan Budget if linked
    let fiscalYear = budgetYear ? Number(budgetYear) : new Date().getFullYear() + 543;
    let effectivePlanNumber = planNumber || null;
    let effectiveDeptName = departmentName || null;
    let effectiveAllocationId = allocationId || null;
    let effectiveBudgetCode = budgetCode || null;

    if (!isUnplanned && planId) {
      const plan = await prisma.procurementPlan.findUnique({ where: { id: planId } });
      if (plan) {
        fiscalYear = plan.fiscalYear;
        effectivePlanNumber = plan.planNumber;
        if (plan.departmentName) effectiveDeptName = plan.departmentName;
        if (plan.allocationId) effectiveAllocationId = plan.allocationId;
        if (plan.budgetCode) effectiveBudgetCode = plan.budgetCode;

        if (plan.remainingBudget < totalAmount) {
          return NextResponse.json(
            {
              error: `ยอดเงินขอซื้อ (${totalAmount.toLocaleString()} บาท) เกินงบประมาณคงเหลือของแผน (${plan.remainingBudget.toLocaleString()} บาท)`,
            },
            { status: 400 }
          );
        }
      }
    }

    const prNumber = await generateDocumentNumber('PR');

    const pr = await prisma.$transaction(async (tx) => {
      const newPR = await tx.purchaseRequisition.create({
        data: {
          prNumber,
          planId: isUnplanned ? null : planId || null,
          planNumber: effectivePlanNumber,
          departmentId: departmentId || null,
          departmentName: effectiveDeptName,
          allocationId: effectiveAllocationId,
          budgetCode: effectiveBudgetCode,
          warehouseId: warehouseId || null,
          requiredDate: requiredDate ? new Date(requiredDate) : null,
          urgency: urgency || 'NORMAL',
          purchaseType: purchaseType || 'GENERAL',
          budgetYear: fiscalYear,
          isUnplanned: Boolean(isUnplanned),
          unplannedReason: isUnplanned ? unplannedReason : null,
          attachmentName: attachmentName || null,
          attachmentUrl: attachmentUrl || null,
          totalAmount,
          status: 'PENDING_APPROVAL',
          justification: justification || '',
          requesterName: requesterName || 'เจ้าหน้าที่ผู้ขอซื้อ',
          lines: {
            create: formattedLines,
          },
        },
        include: {
          department: true,
          plan: true,
          lines: {
            include: {
              item: {
                include: { category: true },
              },
            },
          },
        },
      });

      // Update plan budget commitment if planned
      if (!isUnplanned && planId) {
        await tx.procurementPlan.update({
          where: { id: planId },
          data: {
            committedBudget: { increment: totalAmount },
            remainingBudget: { decrement: totalAmount },
          },
        });
      }

      return newPR;
    });

    await logAudit({
      action: 'CREATE',
      module: 'PURCHASE_REQUISITION',
      entityId: pr.id,
      entityNumber: pr.prNumber,
      user: requesterName || 'เจ้าหน้าที่ผู้ขอซื้อ',
      newValues: { prNumber: pr.prNumber, totalAmount, urgency: pr.urgency, isUnplanned: pr.isUnplanned },
    });

    return NextResponse.json(pr, { status: 201 });
  } catch (error: any) {
    console.error('Error creating purchase requisition:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
