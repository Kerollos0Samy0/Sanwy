import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const youth = await prisma.youth.findUnique({
    where: { id },
    include: { pointsLogs: { orderBy: { createdAt: 'desc' } } }
  });
  return NextResponse.json(youth);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.youth.update({
    where: { id },
    data: {
      name: body.name,
      grade: body.grade,
      dateOfBirth: body.dateOfBirth,
      imageUrl: body.imageUrl
    }
  });
  return NextResponse.json(updated);
}
