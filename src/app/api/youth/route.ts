import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const youthList = await prisma.youth.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(youthList);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, grade, gender } = body;
  const youth = await prisma.youth.create({
    data: { name, grade, gender: gender || "ولد", totalPoints: 0 }
  });
  return NextResponse.json(youth);
}
