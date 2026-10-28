export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dispatchStockTransfer } from '@/lib/stock-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const dispatchedBy = body.userName || 'เจ้าหน้าที่คลังต้นทาง';

    const updated = await dispatchStockTransfer(params.id, dispatchedBy);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
