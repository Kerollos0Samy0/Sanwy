require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const femaleFirstNames = [
  "إيريني", "كريستين", "مريم", "ثاؤبستا", "مهرائيل", "جوستينا", 
  "يوستينا", "مارينا", "إيلاريا", "جومانا", "اليس", "يؤانا", "ندي", 
  "ندى", "ماريا", "سارة", "رفقة", "دميانة", "مارتينا", "جيسيكا", 
  "سيلفيا", "كارولين"
];

async function main() {
  const youths = await prisma.youth.findMany();
  for (const y of youths) {
    const firstName = y.name.split(' ')[0];
    if (femaleFirstNames.includes(firstName)) {
      await prisma.youth.update({
        where: { id: y.id },
        data: { gender: "بنت" }
      });
      console.log(`Updated ${y.name} to بنت`);
    } else {
      // It defaults to ولد, but just in case
      await prisma.youth.update({
        where: { id: y.id },
        data: { gender: "ولد" }
      });
    }
  }
  console.log("Done updating genders.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
