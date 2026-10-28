export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postStockIssue } from '@/lib/stock-service';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const postedBy = body.userName || 'เจ้าหน้าที่จ่ายพัสดุ';

    // Optionally update lot numbers or approved quantities before posting
    if (body.lines && Array.isArray(body.lines)) {
      for (const l of body.lines) {
        if (l.id) {
          await prisma.stockIssueLine.update({
            where: { id: l.id },
            data: {
              approvedQty: parseFloat(l.approvedQty || l.requestedQty || '0'),
              lotNumber: l.lotNumber || null,
            },
          });
        }
      }
    }

    const updated = await postStockIssue(params.id, postedBy);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Post Issue Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
