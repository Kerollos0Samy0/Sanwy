import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const youth = await prisma.youth.findUnique({
    where: { id },
    include: { 
      pointsLogs: { orderBy: { createdAt: 'desc' } } 
    }
  });
  return NextResponse.json(youth);
}
