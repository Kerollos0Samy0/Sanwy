import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const youth = await prisma.youth.findMany({
    include: { pointsLogs: true }
  });

  // الترتيب العام: جميع المخدومين مرتبين من الأول للأخير (تنازلياً حسب النقاط)
  const overall = [...youth].sort((a, b) => b.totalPoints - a.totalPoints);

  // دالة لحساب وترتيب المخدومين في نشاط معين من الأول للأخير
  const getTopByReason = (reason: string) => {
    const scores = youth.map(y => {
      const score = y.pointsLogs
        .filter(log => log.reason === reason)
        .reduce((sum, log) => sum + log.points, 0);
      return { ...y, categoryScore: score };
    });
    // ترتيب جميع من لديهم نقاط في هذا النشاط من الأول للأخير
    return scores
      .filter(y => y.categoryScore > 0)
      .sort((a, b) => b.categoryScore - a.categoryScore);
  };

  const topLiturgy = getTopByReason("القداس");
  const topConfession = getTopByReason("الاعتراف"); // تم استبدال التناول بالاعتراف
  const topTasbeha = getTopByReason("التسبحة");
  const topService = getTopByReason("الخدمة");
  const topVespers = getTopByReason("العشية");
  const topMercy = getTopByReason("أعمال رحمة");

  return NextResponse.json({
    overall,
    topLiturgy,
    topConfession,
    topTasbeha,
    topService,
    topVespers,
    topMercy
  });
}
