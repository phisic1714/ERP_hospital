export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const returns = await prisma.stockReturn.findMany({
      include: {
        department: true,
        supplier: true,
        warehouse: true,
        lines: {
          include: { item: true },
        },
      },
      orderBy: { returnDate: 'desc' },
    });
    return NextResponse.json(returns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const returnNumber = await generateDocumentNumber('RET');

    const ret = await prisma.stockReturn.create({
      data: {
        returnNumber,
        returnType: body.returnType || 'DEPT_RETURN',
        departmentId: body.departmentId || null,
        supplierId: body.supplierId || null,
        warehouseId: body.warehouseId,
        originalDocumentNumber: body.originalDocumentNumber || null,
        returnDate: new Date(body.returnDate || Date.now()),
        status: 'PENDING_INSPECTION',
        reason: body.reason,
        createdBy: body.userName || 'เจ้าหน้าที่',
        lines: {
          create: (body.lines || []).map((l: any) => ({
            itemId: l.itemId,
            lotNumber: l.lotNumber || null,
            returnQty: parseFloat(l.returnQty),
            acceptedQty: 0,
            rejectedQty: 0,
            condition: l.condition || 'GOOD',
            reason: l.reason || body.reason,
            remark: l.remark,
          })),
        },
      },
      include: { lines: true },
    });

    await logAudit({
      userName: body.userName || 'เจ้าหน้าที่',
      action: 'CREATE',
      module: 'RETURN',
      recordId: ret.id,
      details: `สร้างใบคืนสินค้าเลขที่ ${returnNumber} (${body.returnType === 'DEPT_RETURN' ? 'คืนจากแผนก' : 'คืนให้คู่ค้า'})`,
    });

    return NextResponse.json(ret);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
