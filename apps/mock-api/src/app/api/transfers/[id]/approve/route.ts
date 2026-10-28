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
    const action = body.action || 'APPROVE';
    const approverName = body.userName || 'ผู้จัดการฝ่ายคลังสินค้า';

    const trf = await prisma.stockTransfer.findUnique({ where: { id: params.id } });
    if (!trf) return NextResponse.json({ error: 'ไม่พบเอกสาร' }, { status: 404 });

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updated = await prisma.stockTransfer.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        approvedBy: approverName,
      },
    });

    await prisma.approvalTransaction.create({
      data: {
        documentType: 'TRANSFER',
        documentId: trf.id,
        documentNumber: trf.transferNumber,
        roleRequired: 'INVENTORY_MGR',
        approverName,
        action: newStatus,
        comment: body.comment,
      },
    });

    await logAudit({
      userName: approverName,
      action: action === 'APPROVE' ? 'APPROVE' : 'REJECT',
      module: 'TRANSFER',
      recordId: trf.id,
      details: `${action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'}การโอนย้ายพัสดุเลขที่ ${trf.transferNumber}`,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
