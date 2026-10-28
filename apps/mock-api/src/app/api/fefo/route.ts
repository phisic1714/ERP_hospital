export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { allocateLotsFEFO } from '@/lib/fefo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, warehouseId, requiredQty } = body;

    if (!itemId || !warehouseId || !requiredQty) {
      return NextResponse.json(
        { error: 'ต้องระบุ itemId, warehouseId และ requiredQty' },
        { status: 400 }
      );
    }

    const result = await allocateLotsFEFO(
      itemId,
      warehouseId,
      parseFloat(requiredQty)
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
