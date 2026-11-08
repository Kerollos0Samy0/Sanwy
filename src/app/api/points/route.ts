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
  let { youthId, reason, points, servantName, preventDuplicateToday, force } = body;

  const isConfession = reason === "الاعتراف" || reason === "اعتراف";

  // 1. قاعدة الاعتراف: مرة واحدة في الشهر فقط
  if (isConfession && points > 0) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const confessionThisMonth = await prisma.pointsLog.findFirst({
      where: {
        youthId,
        reason: { in: ["الاعتراف", "اعتراف"] },
        createdAt: { gte: startOfMonth },
        points: { gt: 0 }
      }
    });

    if (confessionThisMonth && !force) {
      return NextResponse.json({ 
        error: 'duplicate_month', 
        msg: `تم تسجيل الاعتراف لهذا المخدوم بالفعل هذا الشهر! (مرة واحدة فقط شهرياً)` 
      }, { status: 400 });
    }
  }

  // 2. منع التكرار اليومي للأنشطة الأخرى (إذا تم تفعيل الخيار)
  if (preventDuplicateToday && !isConfession && !force) {
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

  // 3. قاعدة القداس:
  // القداس الأول في الأسبوع يأخذ الدرجة المحددة لهذا الأسبوع (المرسلة من الخادم مثلاً 100 أو 50).
  // وأي قداس إضافي في نفس الأسبوع يحصل على 10 نقاط.
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

    if (liturgiesThisWeek > 0) {
      points = 10;
    }
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const logId = searchParams.get('logId');

    if (!logId) {
      return NextResponse.json({ error: 'Missing logId' }, { status: 400 });
    }

    const log = await prisma.pointsLog.findUnique({
      where: { id: logId }
    });

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.pointsLog.delete({
        where: { id: logId }
      }),
      prisma.youth.update({
        where: { id: log.youthId },
        data: {
          totalPoints: { decrement: log.points }
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 });
  }
}
