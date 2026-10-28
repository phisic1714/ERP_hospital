export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { receiveStockTransfer } from '@/lib/stock-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const receivedBy = body.userName || 'เจ้าหน้าที่คลังปลายทาง';
    const lines = body.lines; // optional custom received quantities

    const updated = await receiveStockTransfer(params.id, receivedBy, lines);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
