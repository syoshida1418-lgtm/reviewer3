-- create_diary_table.sql
CREATE TABLE IF NOT EXISTS public.diary (
  id text PRIMARY KEY,
  title text,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Example insert
-- INSERT INTO public.diary (id, title, content) VALUES ('uuid-1', 'My Diary', 'Today I learned...');
