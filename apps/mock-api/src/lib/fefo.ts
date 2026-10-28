import { prisma } from './prisma';

export interface LotAllocationResult {
  lotId: string;
  lotNumber: string;
  expiryDate: Date;
  allocateQty: number;
  availableInLot: number;
}

export async function allocateLotsFEFO(
  itemId: string,
  warehouseId: string,
  requiredQty: number
): Promise<{
  success: boolean;
  allocations: LotAllocationResult[];
  allocatedTotal: number;
  remainingShortage: number;
  error?: string;
}> {
  const now = new Date();

  // Fetch all active lots for this item & warehouse that are NOT expired and have available quantity
  const lots = await prisma.lot.findMany({
    where: {
      itemId,
      warehouseId,
      status: 'ACTIVE',
      currentQty: {
        gt: 0,
      },
      expiryDate: {
        gt: now, // Strict rule: Expired items CANNOT be issued!
      },
    },
    orderBy: {
      expiryDate: 'asc', // FEFO: Earliest expiry date first
    },
  });

  let remainingToAllocate = requiredQty;
  const allocations: LotAllocationResult[] = [];

  for (const lot of lots) {
    if (remainingToAllocate <= 0) break;

    // Available in this lot = currentQty - reservedQty - quarantineQty - damagedQty - expiredQty
    const availableInLot = Math.max(
      0,
      lot.currentQty -
        (lot.reservedQty || 0) -
        (lot.quarantineQty || 0) -
        (lot.damagedQty || 0) -
        (lot.expiredQty || 0)
    );

    if (availableInLot <= 0) continue;

    const takeQty = Math.min(remainingToAllocate, availableInLot);
    allocations.push({
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      expiryDate: lot.expiryDate,
      allocateQty: takeQty,
      availableInLot,
    });

    remainingToAllocate -= takeQty;
  }

  const allocatedTotal = requiredQty - remainingToAllocate;

  if (remainingToAllocate > 0) {
    return {
      success: false,
      allocations,
      allocatedTotal,
      remainingShortage: remainingToAllocate,
      error: `สต็อกพร้อมจ่ายตามหลัก FEFO มีไม่เพียงพอ (ต้องการ ${requiredQty}, จัดสรรได้ ${allocatedTotal}, ขาด ${remainingToAllocate})`,
    };
  }

  return {
    success: true,
    allocations,
    allocatedTotal,
    remainingShortage: 0,
  };
}
