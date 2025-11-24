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

async function addDeletedByColumn() {
  try {
    console.log('Checking if deleted_by_id column exists...');

    // Check if the column exists
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'articles' AND column_name = 'deleted_by_id'
      );
    `;

    if (!(columnExists as any)[0].exists) {
      console.log('deleted_by_id column does not exist. Adding it now...');
      
      // Add the column
      await prisma.$executeRaw`
        ALTER TABLE articles 
        ADD COLUMN deleted_by_id TEXT;
      `;

      // Add foreign key constraint
      await prisma.$executeRaw`
        ALTER TABLE articles 
        ADD CONSTRAINT articles_deleted_by_id_fkey 
        FOREIGN KEY (deleted_by_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL;
      `;

      console.log('✅ deleted_by_id column added successfully.');
    } else {
      console.log('✅ deleted_by_id column already exists');
    }

    // Verify by fetching an article and checking the field
    const testArticle = await prisma.article.findFirst({
      select: {
        deletedById: true,
      },
    });

    if (testArticle) {
      console.log('✅ Column verified:', testArticle);
    } else {
      console.log('⚠️ No articles found to verify column, but column check passed.');
    }

    console.log('\n✅ Process completed successfully');
  } catch (error: any) {
    console.error('❌ Error adding deleted_by_id column:', error);
    throw error;
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

addDeletedByColumn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

