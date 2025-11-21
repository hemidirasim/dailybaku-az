// Prisma configuration file
// This file is used by Prisma Migrate and other CLI commands
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL is optional for prisma generate, required for migrate/db push
    url: env("DATABASE_URL", { optional: true }) || "postgresql://dailybaku_user:RMSKSYcLqNzawhuNhP9Lf65PB@68.183.173.136:5432/dailybaku?schema=public",
  },
});

