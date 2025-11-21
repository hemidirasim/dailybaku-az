-- Add caption column to article_images
ALTER TABLE "article_images" ADD COLUMN IF NOT EXISTS "caption" TEXT;

-- Add caption column to gallery_template_images
ALTER TABLE "gallery_template_images" ADD COLUMN IF NOT EXISTS "caption" TEXT;

