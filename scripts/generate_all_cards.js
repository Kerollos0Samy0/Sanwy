const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');

process.env.DATABASE_URL = "postgresql://neondb_owner:npg_ZbXp1gl0nxVq@ep-bold-flower-b7e000mc-pooler.c-13.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
const prisma = new PrismaClient();

const TEMPLATE_PATH = path.join(__dirname, '../public/card-template.png');
const OUTPUT_DIR = path.join(__dirname, '../public/cards');
const BOYS_DIR = path.join(OUTPUT_DIR, 'ولاد');
const GIRLS_DIR = path.join(OUTPUT_DIR, 'بنات');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}

async function generateCard(youth) {
  // Generate QR buffer
  const qrBuffer = await QRCode.toBuffer(youth.id, {
    width: 134,
    margin: 1,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff'
    }
  });

  // Calculate font size based on name length
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
  const nameBuffer = Buffer.from(nameSvg);

  const cardBuffer = await sharp(TEMPLATE_PATH)
    .composite([
      {
        input: qrBuffer,
        left: 70,
        top: 140
      },
      {
        input: nameBuffer,
        left: 220,
        top: 238
      }
    ])
    .png()
    .toBuffer();

  const safeName = sanitizeFilename(youth.name);
  const safeGrade = sanitizeFilename(youth.grade || 'عام');
  const filename = `${safeName} - ${safeGrade}.png`;

  // Write to main cards dir
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), cardBuffer);

  // Write to gender dir
  if (youth.gender === 'بنت') {
    fs.writeFileSync(path.join(GIRLS_DIR, filename), cardBuffer);
  } else {
    fs.writeFileSync(path.join(BOYS_DIR, filename), cardBuffer);
  }

  return filename;
}

async function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(BOYS_DIR);
  ensureDir(GIRLS_DIR);

  const youths = await prisma.youth.findMany({
    orderBy: [
      { grade: 'asc' },
      { name: 'asc' }
    ]
  });

  console.log(`Found ${youths.length} students in database.`);

  let count = 0;
  for (const youth of youths) {
    const filename = await generateCard(youth);
    count++;
    console.log(`[${count}/${youths.length}] Generated card for: ${youth.name} (${youth.gender}) -> ${filename}`);
  }

  console.log(`\nAll ${count} cards generated successfully in: ${OUTPUT_DIR}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
