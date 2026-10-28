export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const search = searchParams.get('search') || '';

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(module ? { module } : {}),
        ...(search
          ? {
              OR: [
                { userName: { contains: search } },
                { details: { contains: search } },
                { action: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
