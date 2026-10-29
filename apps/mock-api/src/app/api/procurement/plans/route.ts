export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const plans = await prisma.procurementPlan.findMany({
      include: {
        lines: {
          include: {
            item: true,
          },
        },
        requisitions: {
          select: {
            id: true,
            prNumber: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(plans);
  } catch (error: any) {
    console.error('Error fetching procurement plans:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fiscalYear,
      name,
      categoryCode,
      departmentId,
      departmentName,
      allocationId,
      budgetCode,
      targetBudget,
      allocatedBudget,
      startDate,
      endDate,
      remarks,
      lines,
      createdBy,
    } = body;

    const planNumber = await generateDocumentNumber('PP');

    const totalAllocated = Number(allocatedBudget) || 0;
    const planTargetBudget = Number(targetBudget) || totalAllocated;

    const plan = await prisma.procurementPlan.create({
      data: {
        planNumber,
        fiscalYear: Number(fiscalYear) || 2569,
        name,
        categoryCode: categoryCode || 'ALL',
        departmentId: departmentId || null,
        departmentName: departmentName || null,
        allocationId: allocationId || null,
        budgetCode: budgetCode || null,
        targetBudget: planTargetBudget,
        allocatedBudget: totalAllocated,
        committedBudget: 0,
        remainingBudget: planTargetBudget,
        status: 'ACTIVE',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        remarks: remarks || '',
        createdBy: createdBy || 'เจ้าหน้าที่จัดซื้อ',
        lines: {
          create: (lines || []).map((l: any) => ({
            itemId: l.itemId,
            targetQuantity: Number(l.targetQuantity) || 0,
            estimatedUnitPrice: Number(l.estimatedUnitPrice) || 0,
            estimatedTotal: (Number(l.targetQuantity) || 0) * (Number(l.estimatedUnitPrice) || 0),
            usedQuantity: 0,
            usedBudget: 0,
          })),
        },
      },
      include: {
        lines: true,
      },
    });

    await logAudit({
      action: 'CREATE',
      module: 'PROCUREMENT_PLAN',
      entityId: plan.id,
      entityNumber: plan.planNumber,
      user: createdBy || 'เจ้าหน้าที่จัดซื้อ',
      newValues: { planNumber: plan.planNumber, name: plan.name, allocatedBudget: plan.allocatedBudget },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error: any) {
    console.error('Error creating procurement plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
