import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('servant_auth');
    const roleCookie = cookieStore.get('auth_role');

    // Security check: must have active session and role 'admin'
    if (!authCookie || authCookie.value !== 'authenticated' || roleCookie?.value !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح: هذه العملية مخصصة لحساب الأدمن فقط' }, { status: 403 });
    }

    // Reset all totalPoints to 0 and delete all PointsLogs
    await prisma.$transaction([
      prisma.youth.updateMany({
        data: { totalPoints: 0 }
      }),
      prisma.pointsLog.deleteMany({})
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'تم تصفير جميع النقاط والعدادات بنجاح للبدء من جديد' 
    });
  } catch (error) {
    console.error('Reset points error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تصفير العداد' }, { status: 500 });
  }
}
