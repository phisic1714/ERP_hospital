import { prisma } from './prisma';
import { logAudit } from './audit';

// Helper to recalculate and update StockBalance
export async function syncStockBalance(
  tx: any,
  itemId: string,
  warehouseId: string
) {
  // Aggregate from active lots for this item & warehouse
  const lots = await tx.lot.findMany({
    where: { itemId, warehouseId },
  });

  let totalOnHand = 0;
  let totalReserved = 0;
  let totalQuarantine = 0;
  let totalDamaged = 0;
  let totalExpired = 0;

  const now = new Date();

  for (const l of lots) {
    totalOnHand += l.currentQty;
    totalReserved += l.reservedQty || 0;
    totalQuarantine += l.quarantineQty || 0;
    totalDamaged += l.damagedQty || 0;
    
    // Check if lot is expired
    if (new Date(l.expiryDate) < now) {
      totalExpired += Math.max(0, l.currentQty - (l.damagedQty || 0) - (l.quarantineQty || 0));
    } else {
      totalExpired += l.expiredQty || 0;
    }
  }

  // Critical Formula: Available = On Hand - Reserved - Quarantine - Damaged - Expired
  const eligibleOnHand = Math.max(0, totalOnHand - totalQuarantine - totalDamaged - totalExpired);
  const available = Math.max(0, eligibleOnHand - totalReserved);

  // Upsert StockBalance
  const currentBal = await tx.stockBalance.findUnique({
    where: {
      itemId_warehouseId: { itemId, warehouseId },
    },
  });

  const inTransit = currentBal?.inTransit || 0;

  const updatedBalance = await tx.stockBalance.upsert({
    where: {
      itemId_warehouseId: { itemId, warehouseId },
    },
    update: {
      onHand: totalOnHand,
      reserved: totalReserved,
      available,
      quarantine: totalQuarantine,
      damaged: totalDamaged,
      expired: totalExpired,
      lastMovementAt: new Date(),
    },
    create: {
      itemId,
      warehouseId,
      onHand: totalOnHand,
      reserved: totalReserved,
      available,
      inTransit,
      quarantine: totalQuarantine,
      damaged: totalDamaged,
      expired: totalExpired,
      lastMovementAt: new Date(),
    },
  });

  return updatedBalance;
}

// -------------------------------------------------------------
// GOODS RECEIPT (GR) POSTING
// -------------------------------------------------------------
export async function postGoodsReceipt(grId: string, postedBy: string) {
  return await prisma.$transaction(
    async (tx) => {
      const gr = await tx.goodsReceipt.findUnique({
        where: { id: grId },
        include: {
          po: true,
          lines: {
            include: { item: true },
          },
        },
      });

      if (!gr) throw new Error('ไม่พบเอกสารใบรับสินค้า (Goods Receipt not found)');
      if (gr.status === 'POSTED') throw new Error('เอกสารนี้ถูกบันทึกรับเข้าคลังไปแล้ว (Already posted)');

      let grTotalAccepted = 0;
      let grTotalRejected = 0;
      let grTotalQuarantine = 0;

      // Optimize: Query base movement count once before loop
      let baseMovCount = await tx.stockMovement.count();

      for (const line of gr.lines) {
        grTotalAccepted += line.acceptedQty;
        grTotalRejected += line.rejectedQty;
        grTotalQuarantine += line.quarantineQty;

        // 1. Create or update Lot for Accepted Goods
        if (line.acceptedQty > 0) {
          const lot = await tx.lot.create({
            data: {
              itemId: line.itemId,
              warehouseId: gr.warehouseId,
              locationId: line.locationId,
              lotNumber: line.lotNumber,
              expiryDate: new Date(line.expiryDate),
              initialQty: line.acceptedQty,
              currentQty: line.acceptedQty,
              unitCost: line.unitPrice || line.item.standardCost,
              status: 'ACTIVE',
            },
          });

          // Current balance before
          const balBefore =
            (
              await tx.stockBalance.findUnique({
                where: { itemId_warehouseId: { itemId: line.itemId, warehouseId: gr.warehouseId } },
              })
            )?.onHand || 0;

          // Record Stock Movement
          baseMovCount++;
          const movNumber = `MOV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(baseMovCount).padStart(4, '0')}`;

          await tx.stockMovement.create({
            data: {
              movementNumber: movNumber,
              movementType: 'RECEIVE',
              documentType: 'GR',
              documentNumber: gr.grNumber,
              itemId: line.itemId,
              warehouseId: gr.warehouseId,
              lotId: lot.id,
              lotNumber: lot.lotNumber,
              quantity: line.acceptedQty,
              balanceBefore: balBefore,
              balanceAfter: balBefore + line.acceptedQty,
              unitCost: line.unitPrice || line.item.standardCost,
              totalCost: line.acceptedQty * (line.unitPrice || line.item.standardCost),
              remark: `รับเข้าจาก ${gr.grNumber} (PO: ${gr.poNumber || '-'})`,
              createdBy: postedBy,
            },
          });
        }

        // 2. Quarantine items (segregated from available stock)
        if (line.quarantineQty > 0) {
          await tx.lot.create({
            data: {
              itemId: line.itemId,
              warehouseId: gr.warehouseId,
              locationId: line.locationId,
              lotNumber: line.lotNumber,
              expiryDate: new Date(line.expiryDate),
              initialQty: line.quarantineQty,
              currentQty: line.quarantineQty,
              quarantineQty: line.quarantineQty,
              unitCost: line.unitPrice || line.item.standardCost,
              status: 'QUARANTINE',
            },
          });
        }

        // 3. Update PO lines if linked to PO
        if (line.poLineId) {
          const poLine = await tx.procurementPOLine.findUnique({
            where: { id: line.poLineId },
          });

          if (poLine) {
            const newRecQty = poLine.receivedQty + line.acceptedQty;
            const newRemQty = Math.max(0, poLine.orderedQty - newRecQty);
            await tx.procurementPOLine.update({
              where: { id: line.poLineId },
              data: {
                receivedQty: newRecQty,
                remainingQty: newRemQty,
                status: newRemQty === 0 ? 'COMPLETED' : 'PARTIAL',
              },
            });
          }
        }

        // Recalculate balance for item in warehouse
        await syncStockBalance(tx, line.itemId, gr.warehouseId);
      }

      // Check PO status
      if (gr.poId) {
        const allLines = await tx.procurementPOLine.findMany({
          where: { poId: gr.poId },
        });
        const allDone = allLines.every((l: any) => l.remainingQty === 0);
        await tx.procurementPO.update({
          where: { id: gr.poId },
          data: {
            status: allDone ? 'COMPLETED' : 'PARTIALLY_RECEIVED',
          },
        });

        // Step 10: Auto-update linked PR to COMPLETED if all PO goods received
        if (allDone && gr.po?.prId) {
          await tx.purchaseRequisition.update({
            where: { id: gr.po.prId },
            data: { status: 'COMPLETED' },
          });
        }
      }

      // Mark GR as POSTED
      const updatedGR = await tx.goodsReceipt.update({
        where: { id: grId },
        data: {
          status: 'POSTED',
          postedBy,
          postedAt: new Date(),
          totalAccepted: grTotalAccepted,
          totalRejected: grTotalRejected,
          totalQuarantine: grTotalQuarantine,
        },
      });

      await logAudit({
        userName: postedBy,
        action: 'POST',
        module: 'GR',
        recordId: gr.id,
        details: `บันทึกรับเข้าคลังเลขที่ ${gr.grNumber} ยอดรับ ${grTotalAccepted} หน่วย, กักกัน ${grTotalQuarantine} หน่วย, ปฏิเสธ ${grTotalRejected} หน่วย`,
      });

      return updatedGR;
    },
    {
      maxWait: 15000,
      timeout: 30000,
    }
  );
}

// -------------------------------------------------------------
// STOCK ISSUE POSTING
// -------------------------------------------------------------
export async function postStockIssue(issueId: string, postedBy: string) {
  return await prisma.$transaction(async (tx) => {
    const issue = await tx.stockIssue.findUnique({
      where: { id: issueId },
      include: {
        lines: {
          include: { item: true },
        },
      },
    });

    if (!issue) throw new Error('ไม่พบเอกสารใบเบิกสินค้า (Stock Issue not found)');
    if (issue.status === 'POSTED') throw new Error('เอกสารนี้จ่ายสินค้าและบันทึกตัดสต็อกไปแล้ว');
    if (issue.status !== 'APPROVED') throw new Error('เอกสารต้องได้รับการอนุมัติก่อนตัดจ่ายสินค้า');

    for (const line of issue.lines) {
      const qtyToIssue = line.approvedQty || line.requestedQty;
      if (qtyToIssue <= 0) continue;

      // Find lot to deduct
      let remainingQty = qtyToIssue;

      if (line.lotNumber) {
        // Specific lot chosen
        const lot = await tx.lot.findFirst({
          where: {
            itemId: line.itemId,
            warehouseId: issue.sourceWarehouseId,
            lotNumber: line.lotNumber,
            currentQty: { gt: 0 },
          },
        });

        if (lot) {
          const deduct = Math.min(lot.currentQty, remainingQty);
          await tx.lot.update({
            where: { id: lot.id },
            data: {
              currentQty: lot.currentQty - deduct,
              reservedQty: Math.max(0, (lot.reservedQty || 0) - deduct),
              status: lot.currentQty - deduct === 0 ? 'DEPLETED' : lot.status,
            },
          });
          remainingQty -= deduct;
        }
      }

      // If still remaining, deduct using FEFO order
      if (remainingQty > 0) {
        const activeLots = await tx.lot.findMany({
          where: {
            itemId: line.itemId,
            warehouseId: issue.sourceWarehouseId,
            status: 'ACTIVE',
            currentQty: { gt: 0 },
            expiryDate: { gt: new Date() },
          },
          orderBy: { expiryDate: 'asc' },
        });

        for (const lot of activeLots) {
          if (remainingQty <= 0) break;
          const deduct = Math.min(lot.currentQty, remainingQty);
          await tx.lot.update({
            where: { id: lot.id },
            data: {
              currentQty: lot.currentQty - deduct,
              reservedQty: Math.max(0, (lot.reservedQty || 0) - deduct),
              status: lot.currentQty - deduct === 0 ? 'DEPLETED' : lot.status,
            },
          });
          remainingQty -= deduct;
        }
      }

      // Record Stock Movement
      const balBefore = (await tx.stockBalance.findUnique({
        where: { itemId_warehouseId: { itemId: line.itemId, warehouseId: issue.sourceWarehouseId } },
      }))?.onHand || 0;

      const movCount = await tx.stockMovement.count();
      const movNumber = `MOV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(movCount + 1).padStart(4, '0')}`;

      await tx.stockMovement.create({
        data: {
          movementNumber: movNumber,
          movementType: 'ISSUE_DIRECT',
          documentType: 'ISSUE',
          documentNumber: issue.issueNumber,
          itemId: line.itemId,
          warehouseId: issue.sourceWarehouseId,
          lotNumber: line.lotNumber,
          quantity: -qtyToIssue,
          balanceBefore: balBefore,
          balanceAfter: balBefore - qtyToIssue,
          unitCost: line.item.standardCost,
          totalCost: qtyToIssue * line.item.standardCost,
          remark: `จ่ายสินค้าตามใบเบิก ${issue.issueNumber} (${issue.requesterName})`,
          createdBy: postedBy,
        },
      });

      // Update line issuedQty
      await tx.stockIssueLine.update({
        where: { id: line.id },
        data: { issuedQty: qtyToIssue },
      });

      // Recalculate balance
      await syncStockBalance(tx, line.itemId, issue.sourceWarehouseId);
    }

    const updatedIssue = await tx.stockIssue.update({
      where: { id: issueId },
      data: {
        status: 'POSTED',
        postedBy,
        postedAt: new Date(),
      },
    });

    await logAudit({
      userName: postedBy,
      action: 'POST',
      module: 'ISSUE',
      recordId: issue.id,
      details: `จ่ายสินค้าและตัดสต็อกตามใบเบิก ${issue.issueNumber} ให้แผนก`,
    });

    return updatedIssue;
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
}

// -------------------------------------------------------------
// STOCK TRANSFER DISPATCH & RECEIVE
// -------------------------------------------------------------
export async function dispatchStockTransfer(transferId: string, dispatchedBy: string) {
  return await prisma.$transaction(async (tx) => {
    const trf = await tx.stockTransfer.findUnique({
      where: { id: transferId },
      include: { lines: { include: { item: true } } },
    });

    if (!trf) throw new Error('ไม่พบเอกสารใบโอนย้าย');
    if (trf.status !== 'APPROVED') throw new Error('เอกสารต้องได้รับอนุมัติก่อนจัดส่ง (Dispatch)');

    for (const line of trf.lines) {
      const qty = line.requestedQty;

      // Deduct from Source Warehouse Lot
      let remaining = qty;
      const lots = await tx.lot.findMany({
        where: {
          itemId: line.itemId,
          warehouseId: trf.sourceWarehouseId,
          status: 'ACTIVE',
          currentQty: { gt: 0 },
          expiryDate: { gt: new Date() },
        },
        orderBy: { expiryDate: 'asc' },
      });

      for (const lot of lots) {
        if (remaining <= 0) break;
        const take = Math.min(lot.currentQty, remaining);
        await tx.lot.update({
          where: { id: lot.id },
          data: {
            currentQty: lot.currentQty - take,
            status: lot.currentQty - take === 0 ? 'DEPLETED' : lot.status,
          },
        });
        remaining -= take;
      }

      // Update Line dispatchedQty
      await tx.stockTransferLine.update({
        where: { id: line.id },
        data: { dispatchedQty: qty },
      });

      // Recalculate Source Balance
      const bal = await syncStockBalance(tx, line.itemId, trf.sourceWarehouseId);

      // Increase In Transit on Source Balance
      await tx.stockBalance.update({
        where: { id: bal.id },
        data: { inTransit: (bal.inTransit || 0) + qty },
      });

      // Record Movement
      const movCount = await tx.stockMovement.count();
      const movNumber = `MOV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(movCount + 1).padStart(4, '0')}`;
      await tx.stockMovement.create({
        data: {
          movementNumber: movNumber,
          movementType: 'TRANSFER_DISPATCH',
          documentType: 'TRANSFER',
          documentNumber: trf.transferNumber,
          itemId: line.itemId,
          warehouseId: trf.sourceWarehouseId,
          fromWarehouseId: trf.sourceWarehouseId,
          toWarehouseId: trf.destinationWarehouseId,
          quantity: -qty,
          balanceBefore: bal.onHand + qty,
          balanceAfter: bal.onHand,
          unitCost: line.item.standardCost,
          totalCost: qty * line.item.standardCost,
          remark: `โอนย้ายสินค้าไปยังคลังปลายทาง (In Transit)`,
          createdBy: dispatchedBy,
        },
      });
    }

    const updatedTrf = await tx.stockTransfer.update({
      where: { id: transferId },
      data: {
        status: 'IN_TRANSIT',
        dispatchedBy,
        dispatchedAt: new Date(),
      },
    });

    await logAudit({
      userName: dispatchedBy,
      action: 'DISPATCH',
      module: 'TRANSFER',
      recordId: trf.id,
      details: `จัดส่งสินค้าใบโอนย้าย ${trf.transferNumber} เข้าสู่สถานะ In Transit`,
    });

    return updatedTrf;
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
}

export async function receiveStockTransfer(
  transferId: string,
  receivedBy: string,
  receivedLineData?: { lineId: string; receivedQty: number }[]
) {
  return await prisma.$transaction(async (tx) => {
    const trf = await tx.stockTransfer.findUnique({
      where: { id: transferId },
      include: { lines: { include: { item: true } } },
    });

    if (!trf) throw new Error('ไม่พบเอกสารใบโอนย้าย');
    if (trf.status !== 'IN_TRANSIT') throw new Error('เอกสารต้องอยู่ในสถานะ In Transit จึงจะยืนยันรับเข้าได้');

    for (const line of trf.lines) {
      const customQty = receivedLineData?.find((d) => d.lineId === line.id)?.receivedQty;
      const qtyReceived = customQty !== undefined ? customQty : line.dispatchedQty;
      const discrepancy = line.dispatchedQty - qtyReceived;

      // Reduce In Transit from Source Balance
      const srcBal = await tx.stockBalance.findUnique({
        where: { itemId_warehouseId: { itemId: line.itemId, warehouseId: trf.sourceWarehouseId } },
      });
      if (srcBal) {
        await tx.stockBalance.update({
          where: { id: srcBal.id },
          data: { inTransit: Math.max(0, (srcBal.inTransit || 0) - line.dispatchedQty) },
        });
      }

      // Create new Lot in Destination Warehouse
      const d365 = new Date(Date.now() + 365 * 24 * 3600 * 1000);
      await tx.lot.create({
        data: {
          itemId: line.itemId,
          warehouseId: trf.destinationWarehouseId,
          lotNumber: line.lotNumber || `TRF-LOT-${Date.now().toString().slice(-4)}`,
          expiryDate: d365,
          initialQty: qtyReceived,
          currentQty: qtyReceived,
          unitCost: line.item.standardCost,
          status: 'ACTIVE',
        },
      });

      // Update line
      await tx.stockTransferLine.update({
        where: { id: line.id },
        data: {
          receivedQty: qtyReceived,
          discrepancyQty: discrepancy,
        },
      });

      // Recalculate Destination Balance
      const destBal = await syncStockBalance(tx, line.itemId, trf.destinationWarehouseId);

      // Record Movement
      const movCount = await tx.stockMovement.count();
      const movNumber = `MOV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(movCount + 1).padStart(4, '0')}`;
      await tx.stockMovement.create({
        data: {
          movementNumber: movNumber,
          movementType: 'TRANSFER_RECEIVE',
          documentType: 'TRANSFER',
          documentNumber: trf.transferNumber,
          itemId: line.itemId,
          warehouseId: trf.destinationWarehouseId,
          fromWarehouseId: trf.sourceWarehouseId,
          toWarehouseId: trf.destinationWarehouseId,
          quantity: qtyReceived,
          balanceBefore: destBal.onHand - qtyReceived,
          balanceAfter: destBal.onHand,
          unitCost: line.item.standardCost,
          totalCost: qtyReceived * line.item.standardCost,
          remark: `รับสินค้าจากการโอนย้าย ${trf.transferNumber}${discrepancy > 0 ? ` (ส่วนต่าง ${discrepancy})` : ''}`,
          createdBy: receivedBy,
        },
      });
    }

    const updatedTrf = await tx.stockTransfer.update({
      where: { id: transferId },
      data: {
        status: 'COMPLETED',
        receivedBy,
        receivedAt: new Date(),
      },
    });

    await logAudit({
      userName: receivedBy,
      action: 'RECEIVE',
      module: 'TRANSFER',
      recordId: trf.id,
      details: `คลังปลายทางยืนยันรับสินค้าจากการโอนย้าย ${trf.transferNumber} เรียบร้อย`,
    });

    return updatedTrf;
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
}

// -------------------------------------------------------------
// STOCK ADJUSTMENT POSTING
// -------------------------------------------------------------
export async function postStockAdjustment(adjustmentId: string, postedBy: string) {
  return await prisma.$transaction(async (tx) => {
    const adj = await tx.stockAdjustment.findUnique({
      where: { id: adjustmentId },
      include: { lines: { include: { item: true } } },
    });

    if (!adj) throw new Error('ไม่พบเอกสารใบปรับปรุงสต็อก');
    if (adj.status === 'POSTED') throw new Error('เอกสารนี้ผ่านการปรับปรุงยอดแล้ว');

    for (const line of adj.lines) {
      if (line.adjustmentQty === 0) continue;

      if (line.adjustmentQty > 0) {
        // Increase: create or add to lot
        await tx.lot.create({
          data: {
            itemId: line.itemId,
            warehouseId: adj.warehouseId,
            lotNumber: line.lotNumber || `ADJ-LOT-${Date.now().toString().slice(-4)}`,
            expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
            initialQty: line.adjustmentQty,
            currentQty: line.adjustmentQty,
            unitCost: line.unitCost || line.item.standardCost,
            status: 'ACTIVE',
          },
        });
      } else {
        // Decrease: reduce lot
        const deductTotal = Math.abs(line.adjustmentQty);
        let rem = deductTotal;

        const lots = await tx.lot.findMany({
          where: {
            itemId: line.itemId,
            warehouseId: adj.warehouseId,
            currentQty: { gt: 0 },
            ...(line.lotNumber ? { lotNumber: line.lotNumber } : {}),
          },
          orderBy: { expiryDate: 'asc' },
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

      // Sync balance
      const bal = await syncStockBalance(tx, line.itemId, adj.warehouseId);

      // Record movement
      const movCount = await tx.stockMovement.count();
      const movNumber = `MOV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(movCount + 1).padStart(4, '0')}`;
      await tx.stockMovement.create({
        data: {
          movementNumber: movNumber,
          movementType: 'ADJUSTMENT',
          documentType: 'ADJUSTMENT',
          documentNumber: adj.adjustmentNumber,
          itemId: line.itemId,
          warehouseId: adj.warehouseId,
          lotNumber: line.lotNumber,
          quantity: line.adjustmentQty,
          balanceBefore: bal.onHand - line.adjustmentQty,
          balanceAfter: bal.onHand,
          unitCost: line.unitCost || line.item.standardCost,
          totalCost: Math.abs(line.adjustmentQty) * (line.unitCost || line.item.standardCost),
          remark: `ปรับปรุงยอดประเภท ${adj.adjustmentType} เหตุผล: ${adj.reason}`,
          createdBy: postedBy,
        },
      });
    }

    const updatedAdj = await tx.stockAdjustment.update({
      where: { id: adjustmentId },
      data: {
        status: 'POSTED',
        postedBy,
        postedAt: new Date(),
      },
    });

    await logAudit({
      userName: postedBy,
      action: 'POST',
      module: 'ADJUSTMENT',
      recordId: adj.id,
      details: `อนุมัติและปรับปรุงยอดสต็อก ${adj.adjustmentNumber} (${adj.adjustmentType})`,
    });

    return updatedAdj;
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
}
