import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const youth = await prisma.youth.findUnique({
    where: { id: params.id },
    include: { 
      pointsLogs: { orderBy: { createdAt: 'desc' } } 
    }
  });
  return NextResponse.json(youth);
}
