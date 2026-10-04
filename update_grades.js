const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const grades = ["أولى ثانوي", "تانية ثانوي", "تالتة ثانوي"];

async function main() {
  const youths = await prisma.youth.findMany();
  for (const y of youths) {
    const randomGrade = grades[Math.floor(Math.random() * grades.length)];
    await prisma.youth.update({
      where: { id: y.id },
      data: { grade: randomGrade }
    });
    console.log(`تم تحديث ${y.name} إلى ${randomGrade}`);
  }
}
main().finally(() => prisma.$disconnect());
