#!/bin/sh
set -e

echo "🚀 Starting Daily Baku application..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1 || npx prisma migrate status > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, trying to initialize..."
  npx prisma migrate dev --name init --create-only || true
  npx prisma migrate deploy || true
}

# Generate Prisma Client (if needed)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Note: Admin user should be created manually using:
# docker-compose exec app npm run create-admin
# Or use Prisma Studio:
# docker-compose exec app npx prisma studio
echo "ℹ️  To create admin user, run: docker-compose exec app npm run create-admin"

echo "🎉 Starting Next.js application..."
exec "$@"

