export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncStockBalance } from '@/lib/stock-service';
import { logAudit } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const count = await prisma.stockCount.findUnique({
      where: { id: params.id },
      include: {
        warehouse: true,
        lines: {
          include: { item: true },
        },
      },
    });
    if (!count) return NextResponse.json({ error: 'ไม่พบรายการตรวจนับ' }, { status: 404 });
    return NextResponse.json(count);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const action = body.action; // 'SAVE_COUNT' or 'CLOSE_AND_ADJUST'
    const userName = body.userName || 'เจ้าหน้าที่ตรวจนับ';

    if (action === 'SAVE_COUNT') {
      // Update lines
      for (const l of body.lines || []) {
        if (l.id) {
          const sys = parseFloat(l.systemQty || '0');
          const cnt = parseFloat(l.countedQty || '0');
          const variance = cnt - sys;
          const variancePct = sys > 0 ? (variance / sys) * 100 : 0;

          await prisma.stockCountLine.update({
            where: { id: l.id },
            data: {
              countedQty: cnt,
              varianceQty: variance,
              variancePercentage: variancePct,
              recountRequired: Boolean(l.recountRequired),
              notes: l.notes,
            },
          });
        }
      }

      const updated = await prisma.stockCount.update({
        where: { id: params.id },
        data: {
          status: 'COUNTED',
          remark: body.remark,
        },
      });

      return NextResponse.json(updated);
    }

    if (action === 'CLOSE_AND_ADJUST') {
      // Close count and post automated stock adjustments for variances
      const count = await prisma.stockCount.findUnique({
        where: { id: params.id },
        include: { lines: { include: { item: true } } },
      });

      if (!count) throw new Error('ไม่พบรายการตรวจนับ');

      await prisma.$transaction(async (tx) => {
        for (const line of count.lines) {
          if (line.varianceQty !== 0) {
            // Update lot or create adjustment lot
            if (line.varianceQty > 0) {
              await tx.lot.create({
                data: {
                  itemId: line.itemId,
                  warehouseId: count.warehouseId,
                  lotNumber: `CNT-ADJ-${Date.now().toString().slice(-4)}`,
                  expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
                  initialQty: line.varianceQty,
                  currentQty: line.varianceQty,
                  unitCost: line.item.standardCost,
                  status: 'ACTIVE',
                },
              });
            } else {
              // Deduct negative variance
              let rem = Math.abs(line.varianceQty);
              const lots = await tx.lot.findMany({
                where: { itemId: line.itemId, warehouseId: count.warehouseId, currentQty: { gt: 0 } },
              });
              for (const lot of lots) {
                if (rem <= 0) break;
                const take = Math.min(lot.currentQty, rem);
                await tx.lot.update({
                  where: { id: lot.id },
                  data: {
                    currentQty: lot.currentQty - take,
                    status: lot.currentQty - take === 0 ? 'DEPLETED' : lot.status,
                  },
                });
                rem -= take;
              }
            }

            await syncStockBalance(tx, line.itemId, count.warehouseId);

            // Record Movement
            const movCount = await tx.stockMovement.count();
            const movNumber = `MOV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(movCount + 1).padStart(4, '0')}`;
            await tx.stockMovement.create({
              data: {
                movementNumber: movNumber,
                movementType: 'COUNT_ADJUST',
                documentType: 'COUNT',
                documentNumber: count.countNumber,
                itemId: line.itemId,
                warehouseId: count.warehouseId,
                quantity: line.varianceQty,
                unitCost: line.item.standardCost,
                totalCost: Math.abs(line.varianceQty) * line.item.standardCost,
                remark: `ปรับยอดผลต่างตรวจนับตาม ${count.countNumber}`,
                createdBy: userName,
              },
            });
          }
        }

        await tx.stockCount.update({
          where: { id: params.id },
          data: {
            status: 'CLOSED',
            approvedBy: userName,
            approvedAt: new Date(),
            closedAt: new Date(),
          },
        });
      }, {
        maxWait: 15000,
        timeout: 30000,
      });

      await logAudit({
        userName,
        action: 'APPROVE',
        module: 'COUNT',
        recordId: count.id,
        details: `อนุมัติผลและปิดรายการตรวจนับ ${count.countNumber} พร้อมปรับยอดคงคลังให้ตรงจริง`,
      });

      return NextResponse.json({ success: true, message: 'ปิดรายการตรวจนับและปรับปรุงยอดเรียบร้อย' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
