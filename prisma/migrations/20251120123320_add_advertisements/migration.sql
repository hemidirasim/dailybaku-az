-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "image_url" TEXT,
    "html_code" TEXT,
    "link_url" TEXT,
    "position" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_translations" (
    "id" TEXT NOT NULL,
    "advertisement_id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,

    CONSTRAINT "advertisement_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "advertisement_translations_advertisement_id_locale_key" ON "advertisement_translations"("advertisement_id", "locale");

-- AddForeignKey
ALTER TABLE "advertisement_translations" ADD CONSTRAINT "advertisement_translations_advertisement_id_fkey" FOREIGN KEY ("advertisement_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
