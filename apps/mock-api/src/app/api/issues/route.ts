export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    const issues = await prisma.stockIssue.findMany({
      where: {
        ...(departmentId ? { departmentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        department: true,
        sourceWarehouse: true,
        lines: {
          include: { item: true },
        },
      },
      orderBy: { requestDate: 'desc' },
    });

    return NextResponse.json(issues);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const issueNumber = await generateDocumentNumber('ISS');

    const issue = await prisma.stockIssue.create({
      data: {
        issueNumber,
        issueType: body.issueType || 'DIRECT',
        requesterName: body.requesterName || 'เจ้าหน้าที่แผนก',
        departmentId: body.departmentId,
        sourceWarehouseId: body.sourceWarehouseId,
        requestDate: new Date(body.requestDate || Date.now()),
        requiredDate: body.requiredDate ? new Date(body.requiredDate) : null,
        status: 'PENDING_APPROVAL', // Starts awaiting department approval
        remark: body.remark,
        createdBy: body.userName || body.requesterName || 'ผู้ขอเบิก',
        lines: {
          create: (body.lines || []).map((l: any) => ({
            itemId: l.itemId,
            requestedQty: parseFloat(l.requestedQty),
            approvedQty: parseFloat(l.approvedQty || l.requestedQty),
            issuedQty: 0,
            lotNumber: l.lotNumber || null,
            unit: l.unit || 'Unit',
            remark: l.remark,
          })),
        },
      },
      include: {
        lines: true,
      },
    });

    await logAudit({
      userName: body.userName || body.requesterName || 'ผู้ขอเบิก',
      action: 'CREATE',
      module: 'ISSUE',
      recordId: issue.id,
      details: `สร้างใบขอเบิกพัสดุเลขที่ ${issueNumber} (${body.issueType === 'DIRECT' ? 'เบิกใช้งานตรง' : 'เบิกเติมคลังย่อย'})`,
    });

    return NextResponse.json(issue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
