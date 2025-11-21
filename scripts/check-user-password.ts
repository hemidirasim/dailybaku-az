import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('İstifadə: npx tsx scripts/check-user-password.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`İstifadəçi tapılmadı: ${email}`);
    process.exit(1);
  }

  console.log(`İstifadəçi tapıldı: ${user.email}`);
  console.log(`Ad: ${user.name || 'Yoxdur'}`);
  console.log(`Rol: ${user.role}`);
  console.log(`Şifrə hash: ${user.password.substring(0, 20)}...`);
  console.log(`Şifrə uzunluğu: ${user.password.length}`);

  // Test şifrəsi
  const testPassword = process.argv[3];
  if (testPassword) {
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`\nTest şifrəsi "${testPassword}": ${isValid ? '✅ Düzgündür' : '❌ Yanlışdır'}`);
  } else {
    console.log('\nŞifrəni test etmək üçün: npx tsx scripts/check-user-password.ts <email> <password>');
  }
}

main()
  .catch((e) => {
    console.error('Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

