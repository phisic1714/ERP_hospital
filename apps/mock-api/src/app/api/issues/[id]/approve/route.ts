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
    const action = body.action || 'APPROVE'; // APPROVE or REJECT
    const approverName = body.userName || 'หัวหน้าแผนกผู้มีอำนาจอนุมัติ';

    const issue = await prisma.stockIssue.findUnique({
      where: { id: params.id },
    });
    if (!issue) return NextResponse.json({ error: 'ไม่พบเอกสาร' }, { status: 404 });

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.stockIssue.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        approvedBy: approverName,
        approvedAt: new Date(),
        approvalNotes: body.comment || (action === 'APPROVE' ? 'อนุมัติเรียบร้อย' : 'ไม่อนุมัติ'),
      },
    });

    await prisma.approvalTransaction.create({
      data: {
        documentType: 'ISSUE',
        documentId: issue.id,
        documentNumber: issue.issueNumber,
        roleRequired: 'DEPT_APPROVER',
        approverName,
        action: newStatus,
        comment: body.comment,
      },
    });

    await logAudit({
      userName: approverName,
      action: action === 'APPROVE' ? 'APPROVE' : 'REJECT',
      module: 'ISSUE',
      recordId: issue.id,
      details: `${action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}ใบขอเบิกเลขที่ ${issue.issueNumber}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
