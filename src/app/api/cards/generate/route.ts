import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import QRCode from 'qrcode';

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
        width: 134,
        margin: 1,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        }
      });

      const name = youth.name.trim();
      let fontSize = 18;
      if (name.length > 25) {
        fontSize = 13;
      } else if (name.length > 20) {
        fontSize = 15;
      } else if (name.length > 16) {
        fontSize = 16.5;
      }

      const nameSvg = `
        <svg width="220" height="40">
          <style>
            .name {
              font-family: 'Segoe UI', Tahoma, 'Arial', sans-serif;
              font-weight: 900;
              font-size: ${fontSize}px;
              fill: #420b12;
            }
          </style>
          <text x="110" y="27" class="name" text-anchor="middle">${name}</text>
        </svg>
      `;

      const cardBuffer = await sharp(templatePath)
        .composite([
          { input: qrBuffer, left: 70, top: 140 },
          { input: Buffer.from(nameSvg), left: 220, top: 238 }
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

    return NextResponse.json({ success: true, count: youths.length });
  } catch (error: any) {
    console.error('Error generating cards:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
