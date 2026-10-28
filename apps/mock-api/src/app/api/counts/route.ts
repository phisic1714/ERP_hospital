export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber } from '@/lib/doc-sequence';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const counts = await prisma.stockCount.findMany({
      include: {
        warehouse: true,
        lines: {
          include: { item: true },
        },
      },
      orderBy: { countDate: 'desc' },
    });
    return NextResponse.json(counts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const countNumber = await generateDocumentNumber('CNT');

    // If lines not provided, pull items from warehouse lots/balances
    let linesData = body.lines;
    if (!linesData || linesData.length === 0) {
      const balances = await prisma.stockBalance.findMany({
        where: { warehouseId: body.warehouseId },
        include: { item: true },
      });
      linesData = balances.map((b) => ({
        itemId: b.itemId,
        systemQty: b.onHand,
        countedQty: b.onHand, // default to match
        varianceQty: 0,
        variancePercentage: 0,
      }));
    }

    const count = await prisma.stockCount.create({
      data: {
        countNumber,
        warehouseId: body.warehouseId,
        countPlanName: body.countPlanName || 'แผนตรวจนับพัสดุประจำงวด',
        isBlindCount: body.isBlindCount || false,
        countDate: new Date(body.countDate || Date.now()),
        status: 'IN_PROGRESS',
        counterName: body.counterName || body.userName || 'เจ้าหน้าที่ตรวจนับ',
        remark: body.remark,
        createdBy: body.userName || 'เจ้าหน้าที่คลัง',
        lines: {
          create: linesData.map((l: any) => ({
            itemId: l.itemId,
            lotNumber: l.lotNumber || null,
            systemQty: parseFloat(l.systemQty || '0'),
            countedQty: parseFloat(l.countedQty || '0'),
            varianceQty: parseFloat(l.countedQty || '0') - parseFloat(l.systemQty || '0'),
            variancePercentage:
              parseFloat(l.systemQty || '0') > 0
                ? ((parseFloat(l.countedQty || '0') - parseFloat(l.systemQty || '0')) /
                    parseFloat(l.systemQty || '0')) *
                  100
                : 0,
            notes: l.notes,
          })),
        },
      },
      include: { lines: true },
    });

    await logAudit({
      userName: body.userName || 'เจ้าหน้าที่คลัง',
      action: 'CREATE',
      module: 'COUNT',
      recordId: count.id,
      details: `เปิดแผนตรวจนับสินค้าเลขที่ ${countNumber} (คลัง ${body.warehouseId})`,
    });

    return NextResponse.json(count);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
