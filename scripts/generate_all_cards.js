const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

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
    width: 290,
    margin: 1,
    color: {
      dark: '#1a1a1a',
      light: '#ffffff'
    }
  });

  // Calculate font size based on name length
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
  const nameBuffer = Buffer.from(nameSvg);

  const cardBuffer = await sharp(TEMPLATE_PATH)
    .composite([
      {
        input: qrBuffer,
        left: 110,
        top: 301
      },
      {
        input: nameBuffer,
        left: 455,
        top: 332
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

function createZipArchives() {
  console.log('\nCreating/Updating zip archives...');
  try {
    const allCardsZip = path.join(OUTPUT_DIR, 'all_cards.zip');
    const boysCardsZip = path.join(OUTPUT_DIR, 'boys_cards.zip');
    const girlsCardsZip = path.join(OUTPUT_DIR, 'girls_cards.zip');

    if (fs.existsSync(allCardsZip)) fs.unlinkSync(allCardsZip);
    if (fs.existsSync(boysCardsZip)) fs.unlinkSync(boysCardsZip);
    if (fs.existsSync(girlsCardsZip)) fs.unlinkSync(girlsCardsZip);

    execSync(`powershell -NoProfile -Command "Compress-Archive -Path 'public/cards/*.png' -DestinationPath 'public/cards/all_cards.zip' -Force"`, { stdio: 'inherit' });
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path 'public/cards/ولاد/*.png' -DestinationPath 'public/cards/boys_cards.zip' -Force"`, { stdio: 'inherit' });
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path 'public/cards/بنات/*.png' -DestinationPath 'public/cards/girls_cards.zip' -Force"`, { stdio: 'inherit' });
    console.log('Successfully created all 3 ZIP archives!');
  } catch (err) {
    console.error('Error creating ZIP archives:', err.message);
  }
}

async function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(BOYS_DIR);
  ensureDir(GIRLS_DIR);

  // Clean old png files from cards directories
  const cleanDir = (d) => {
    if (fs.existsSync(d)) {
      const files = fs.readdirSync(d);
      for (const file of files) {
        if (file.endsWith('.png')) {
          fs.unlinkSync(path.join(d, file));
        }
      }
    }
  };
  cleanDir(OUTPUT_DIR);
  cleanDir(BOYS_DIR);
  cleanDir(GIRLS_DIR);

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
  createZipArchives();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
