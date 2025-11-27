-- Add agenda column to articles table if it doesn't exist
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS agenda BOOLEAN DEFAULT false;




