import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { youthId, reason, points, servantName } = body;
  
  const log = await prisma.pointsLog.create({
    data: { youthId, reason, points: Number(points), servantName }
  });
  
  await prisma.youth.update({
    where: { id: youthId },
    data: { totalPoints: { increment: Number(points) } }
  });

  return NextResponse.json(log);
}
