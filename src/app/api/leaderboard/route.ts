import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const youthList = await prisma.youth.findMany({
      orderBy: { totalPoints: 'desc' },
    });
    return NextResponse.json(youthList);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
