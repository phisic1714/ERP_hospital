export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const issue = await prisma.stockIssue.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        sourceWarehouse: true,
        lines: {
          include: {
            item: {
              include: {
                lots: {
                  where: { currentQty: { gt: 0 } },
                  orderBy: { expiryDate: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'ไม่พบใบเบิกพัสดุ' }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
