import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}

export async function POST() {
  try {
    const templatePath = path.join(process.cwd(), 'public/card-template.png');
    const outputDir = path.join(process.cwd(), 'public/cards');
    const boysDir = path.join(outputDir, 'ولاد');
    const girlsDir = path.join(outputDir, 'بنات');

    ensureDir(outputDir);
    ensureDir(boysDir);
    ensureDir(girlsDir);

    const youths = await prisma.youth.findMany({
      orderBy: [
        { grade: 'asc' },
        { name: 'asc' }
      ]
    });

    for (const youth of youths) {
      const qrBuffer = await QRCode.toBuffer(youth.id, {
        width: 290,
        margin: 1,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      });

      const name = youth.name.trim();
      let fontSize = 34;
      if (name.length > 25) {
        fontSize = 23;
      } else if (name.length > 20) {
        fontSize = 26;
      } else if (name.length > 16) {
        fontSize = 29;
      }

      const nameSvg = `
        <svg width="430" height="76">
          <style>
            .name {
              font-family: 'Segoe UI', Tahoma, 'Arial', sans-serif;
              font-weight: 900;
              font-size: ${fontSize}px;
              fill: #420b12;
            }
          </style>
          <text x="215" y="46" class="name" text-anchor="middle">${name}</text>
        </svg>
      `;

      const cardBuffer = await sharp(templatePath)
        .composite([
          { input: qrBuffer, left: 110, top: 301 },
          { input: Buffer.from(nameSvg), left: 455, top: 332 }
        ])
        .png()
        .toBuffer();

      const safeName = sanitizeFilename(youth.name);
      const safeGrade = sanitizeFilename(youth.grade || 'عام');
      const filename = `${safeName} - ${safeGrade}.png`;

      fs.writeFileSync(path.join(outputDir, filename), cardBuffer);
      if (youth.gender === 'بنت') {
        fs.writeFileSync(path.join(girlsDir, filename), cardBuffer);
      } else {
        fs.writeFileSync(path.join(boysDir, filename), cardBuffer);
      }
    }

    // Attempt to update ZIP archives if PowerShell is available
    try {
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path 'public/cards/*.png' -DestinationPath 'public/cards/all_cards.zip' -Force"`);
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path 'public/cards/ولاد/*.png' -DestinationPath 'public/cards/boys_cards.zip' -Force"`);
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path 'public/cards/بنات/*.png' -DestinationPath 'public/cards/girls_cards.zip' -Force"`);
    } catch (zipErr) {
      console.warn('Could not compress zip archives in API route:', zipErr);
    }

    return NextResponse.json({ success: true, count: youths.length });
  } catch (error: any) {
    console.error('Error generating cards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
