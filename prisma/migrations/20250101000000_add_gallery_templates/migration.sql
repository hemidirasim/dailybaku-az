-- CreateTable
CREATE TABLE IF NOT EXISTS "gallery_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'grid',
    "columns" INTEGER NOT NULL DEFAULT 3,
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "gallery_template_translations" (
    "id" TEXT NOT NULL,
    "gallery_template_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "gallery_template_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "gallery_template_images" (
    "id" TEXT NOT NULL,
    "gallery_template_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_template_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "gallery_templates_slug_key" ON "gallery_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "gallery_template_translations_gallery_template_id_locale_key" ON "gallery_template_translations"("gallery_template_id", "locale");

-- AddForeignKey
ALTER TABLE "gallery_template_translations" ADD CONSTRAINT "gallery_template_translations_gallery_template_id_fkey" FOREIGN KEY ("gallery_template_id") REFERENCES "gallery_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_template_images" ADD CONSTRAINT "gallery_template_images_gallery_template_id_fkey" FOREIGN KEY ("gallery_template_id") REFERENCES "gallery_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

