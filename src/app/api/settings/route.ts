import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const DEFAULT_POINTS: Record<string, number> = {
  'القداس': 50,
  'الاعتراف': 50,
  'التسبحة': 30,
  'العشية': 20,
  'الخدمة': 30,
  'أعمال رحمة': 50,
};

export async function GET() {
  try {
    let settingRecord: any = null;
    try {
      settingRecord = await (prisma as any).systemSetting.findUnique({
        where: { key: 'weekly_points' }
      });
    } catch {
      // SystemSetting model might not be generated in local client yet; fallback to raw query
      try {
        const rows: any = await prisma.$queryRawUnsafe(`
          SELECT "value" FROM "SystemSetting" WHERE "key" = 'weekly_points' LIMIT 1;
        `);
        if (rows && rows.length > 0) {
          settingRecord = rows[0];
        }
      } catch {
        // Table doesn't exist yet
      }
    }

    if (settingRecord && settingRecord.value) {
      const parsed = JSON.parse(settingRecord.value);
      return NextResponse.json({ ...DEFAULT_POINTS, ...parsed });
    }

    return NextResponse.json(DEFAULT_POINTS);
  } catch (error) {
    return NextResponse.json(DEFAULT_POINTS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const value = JSON.stringify(body);

    let saved = false;
    try {
      await (prisma as any).systemSetting.upsert({
        where: { key: 'weekly_points' },
        create: { key: 'weekly_points', value },
        update: { value }
      });
      saved = true;
    } catch {
      // Fallback to raw SQL if Prisma client or table not migrated yet
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "SystemSetting" (
            "key" TEXT PRIMARY KEY,
            "value" TEXT NOT NULL,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await prisma.$executeRawUnsafe(`
          INSERT INTO "SystemSetting" ("key", "value", "updatedAt")
          VALUES ('weekly_points', $1, CURRENT_TIMESTAMP)
          ON CONFLICT ("key") DO UPDATE SET "value" = $1, "updatedAt" = CURRENT_TIMESTAMP;
        `, value);
        saved = true;
      } catch (err) {
        console.error('Failed to save settings via SQL:', err);
      }
    }

    if (saved) {
      return NextResponse.json({ success: true, points: body });
    }
    return NextResponse.json({ error: 'Failed to persist settings' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
