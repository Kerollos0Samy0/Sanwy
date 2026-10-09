import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const diff = now.getDate() - day;
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function POST(req: Request) {
  const body = await req.json();
  let { youthId, reason, points, servantName, preventDuplicateToday } = body;

  if (preventDuplicateToday) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const existingLog = await prisma.pointsLog.findFirst({
      where: {
        youthId,
        reason,
        createdAt: { gte: todayStart }
      }
    });
    if (existingLog) {
      return NextResponse.json({ error: 'duplicate_today', msg: `تم تسجيل "${reason}" من قبل اليوم!` }, { status: 400 });
    }
  }

  // قاعدة القداس: الأول بـ 50، وأي قداس إضافي في نفس الأسبوع بـ 10
  if (reason === "القداس" && points > 0) {
    const startOfWeekDate = getStartOfWeek();
    
    const liturgiesThisWeek = await prisma.pointsLog.count({
      where: {
        youthId,
        reason: "القداس",
        createdAt: {
          gte: startOfWeekDate
        },
        points: { gt: 0 }
      }
    });

    points = liturgiesThisWeek > 0 ? 10 : 50;
  }

  const youth = await prisma.youth.update({
    where: { id: youthId },
    data: {
      totalPoints: { increment: points }
    }
  });

  const log = await prisma.pointsLog.create({
    data: { youthId, reason, points, servantName }
  });

  return NextResponse.json({ youth, log });
}

export async function GET() {
  const logs = await prisma.pointsLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { youth: true }
  });
  return NextResponse.json(logs);
}
