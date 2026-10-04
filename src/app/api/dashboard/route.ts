import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const youth = await prisma.youth.findMany({
    include: { pointsLogs: true }
  });

  // الترتيب العام
  const overall = [...youth].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);

  // دالة لحساب أعلى ناس في تصنيف معين
  const getTopByReason = (reason: string) => {
    const scores = youth.map(y => {
      const score = y.pointsLogs
        .filter(log => log.reason === reason && log.points > 0)
        .reduce((sum, log) => sum + log.points, 0);
      return { ...y, categoryScore: score };
    });
    // تصفية اللي ليهم نقط وترتيبهم ونجيب أول 5
    return scores.filter(y => y.categoryScore > 0).sort((a, b) => b.categoryScore - a.categoryScore).slice(0, 5);
  };

  const topLiturgy = getTopByReason("القداس");
  const topTasbeha = getTopByReason("التسبحة");
  const topService = getTopByReason("الخدمة");
  const topVespers = getTopByReason("العشية");

  return NextResponse.json({
    overall,
    topLiturgy,
    topTasbeha,
    topService,
    topVespers
  });
}
