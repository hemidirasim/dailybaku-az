import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

// Initialize Prisma Client
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

async function addAgendaColumn() {
  try {
    console.log('Checking if agenda column exists...');

    // Check if column exists by trying to query it
    try {
      await pool.query('SELECT agenda FROM articles LIMIT 1');
      console.log('✅ agenda column already exists');
    } catch (error: any) {
      // If column doesn't exist, add it
      if (error.message.includes('column "agenda" does not exist')) {
        console.log('⚠️  agenda column does not exist. Adding it...');
        
        await pool.query(`
          ALTER TABLE articles 
          ADD COLUMN IF NOT EXISTS agenda BOOLEAN DEFAULT false;
        `);
        
        console.log('✅ agenda column added successfully');
      } else {
        throw error;
      }
    }

    // Verify the column was added
    const result = await pool.query('SELECT agenda FROM articles LIMIT 1');
    console.log('✅ Column verified:', result.rows[0]);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

addAgendaColumn()
  .then(() => {
    console.log('\n✅ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  });

