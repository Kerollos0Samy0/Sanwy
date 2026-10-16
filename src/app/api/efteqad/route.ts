import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  const youth = await prisma.youth.findMany({
    include: { pointsLogs: { orderBy: { createdAt: 'desc' } } }
  });

  const now = new Date();
  const egyptDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(now);

  const efteqadData = youth.map(y => {
    const lastLiturgy = y.pointsLogs.find(log => log.reason === "القداس")?.createdAt || null;
    const lastAny = y.pointsLogs[0]?.createdAt || null;
    
    // سحب سجلات اليوم بحسب توقيت مصر
    const todayLogs = y.pointsLogs.filter(log => {
      const logEgyptDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date(log.createdAt));
      return logEgyptDateStr === egyptDateStr;
    });
    const attendedToday = todayLogs.length > 0;
    const todayActivities = Array.from(new Set(todayLogs.map(l => l.reason)));

    let daysSinceLast = -1;
    if (lastAny) {
      const diffTime = Math.abs(now.getTime() - new Date(lastAny).getTime());
      daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    }

    return {
      id: y.id,
      name: y.name,
      grade: y.grade,
      gender: y.gender,
      imageUrl: y.imageUrl,
      lastLiturgy,
      lastAny,
      daysSinceLast,
      totalPoints: y.totalPoints,
      attendedToday,
      todayActivities
    };
  });

  // ترتيب: اللي ما حضروش النهارده وفترة غيابهم أطول يظهروا أولاً في الافتقاد
  efteqadData.sort((a, b) => {
    if (a.attendedToday !== b.attendedToday) {
      return a.attendedToday ? 1 : -1; // الغائب يظهر أولاً
    }
    return b.daysSinceLast - a.daysSinceLast;
  });

  return NextResponse.json(efteqadData);
}
