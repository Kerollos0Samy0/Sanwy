import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs = await prisma.pointsLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { youth: true }
  });
  return NextResponse.json(logs);
}
