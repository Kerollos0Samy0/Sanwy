const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dummyYouth = [
  { name: "مينا جرجس", grade: "أولى ثانوي", totalPoints: 120 },
  { name: "مارينا عادل", grade: "تانية ثانوي", totalPoints: 150 },
  { name: "كيرلس سامي", grade: "تالتة ثانوي", totalPoints: 200 },
  { name: "جوي أشرف", grade: "أولى ثانوي", totalPoints: 80 },
  { name: "بيتر مجدي", grade: "تانية ثانوي", totalPoints: 100 },
  { name: "مارتينا هاني", grade: "تالتة ثانوي", totalPoints: 190 },
  { name: "ديفيد عماد", grade: "أولى ثانوي", totalPoints: 50 },
];

async function main() {
  console.log("بدأ إضافة البيانات...");
  for (const y of dummyYouth) {
    await prisma.youth.create({ data: y });
  }
  console.log("تمت إضافة البيانات بنجاح!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
