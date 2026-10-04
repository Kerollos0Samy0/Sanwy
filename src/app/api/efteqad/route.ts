import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  const youth = await prisma.youth.findMany({
    include: { pointsLogs: { orderBy: { createdAt: 'desc' } } }
  });

  const efteqadData = youth.map(y => {
    const lastLiturgy = y.pointsLogs.find(log => log.reason === "القداس")?.createdAt || null;
    const lastAny = y.pointsLogs[0]?.createdAt || null;
    
    let daysSinceLast = -1;
    if (lastAny) {
      const diffTime = Math.abs(new Date().getTime() - new Date(lastAny).getTime());
      daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    }

    return {
      id: y.id,
      name: y.name,
      grade: y.grade,
      lastLiturgy,
      lastAny,
      daysSinceLast,
      totalPoints: y.totalPoints
    };
  });

  // ترتيب المخدومين: اللي غايبين من فترة أطول يظهروا الأول عشان الافتقاد
  efteqadData.sort((a, b) => b.daysSinceLast - a.daysSinceLast);

  return NextResponse.json(efteqadData);
}
