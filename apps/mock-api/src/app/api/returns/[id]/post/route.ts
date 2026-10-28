export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncStockBalance } from '@/lib/stock-service';
import { logAudit } from '@/lib/audit';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const postedBy = body.userName || 'เจ้าหน้าที่ตรวจรับคืน';

    const result = await prisma.$transaction(async (tx) => {
      const ret = await tx.stockReturn.findUnique({
        where: { id: params.id },
        include: { lines: { include: { item: true } } },
      });

      if (!ret) throw new Error('ไม่พบใบคืนสินค้า');
      if (ret.status === 'POSTED') throw new Error('ใบคืนสินค้านี้บันทึกรับเข้าคลังไปแล้ว');

      for (const line of ret.lines) {
        const accepted = line.acceptedQty > 0 ? line.acceptedQty : line.returnQty;

        if (ret.returnType === 'DEPT_RETURN') {
          // Returning back into warehouse
          await tx.lot.create({
            data: {
              itemId: line.itemId,
              warehouseId: ret.warehouseId,
              lotNumber: line.lotNumber || `RET-LOT-${Date.now().toString().slice(-4)}`,
              expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
              initialQty: accepted,
              currentQty: accepted,
              unitCost: line.item.standardCost,
              status: line.condition === 'DAMAGED' ? 'DAMAGED' : 'ACTIVE',
            },
          });

          await syncStockBalance(tx, line.itemId, ret.warehouseId);

          const movCount = await tx.stockMovement.count();
          const movNumber = `MOV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(movCount + 1).padStart(4, '0')}`;
          await tx.stockMovement.create({
            data: {
              movementNumber: movNumber,
              movementType: 'RETURN_DEPT',
              documentType: 'RETURN',
              documentNumber: ret.returnNumber,
              itemId: line.itemId,
              warehouseId: ret.warehouseId,
              lotNumber: line.lotNumber,
              quantity: accepted,
              unitCost: line.item.standardCost,
              totalCost: accepted * line.item.standardCost,
              remark: `รับคืนสินค้าจากแผนก (${ret.reason || '-'})`,
              createdBy: postedBy,
            },
          });
        }
      }

      const updated = await tx.stockReturn.update({
        where: { id: params.id },
        data: {
          status: 'POSTED',
          postedBy,
          postedAt: new Date(),
          inspectionResult: body.inspectionResult || 'ผ่านการตรวจสอบสภาพสินค้าเรียบร้อย',
        },
      });

      await logAudit({
        userName: postedBy,
        action: 'POST',
        module: 'RETURN',
        recordId: ret.id,
        details: `ตรวจรับคืนและบันทึกสต็อกใบคืนสินค้าเลขที่ ${ret.returnNumber}`,
      });

      return updated;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
