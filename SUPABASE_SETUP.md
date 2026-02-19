# Supabase Setup for english-reviewer

This document explains how to configure Supabase for the `english-reviewer` project and the required environment variables.

## 1) Create a Supabase project
1. Go to https://app.supabase.com and create a new project.
2. Enable the database and note your project `URL` and `API Keys`.
   - You will need the **Service Role** key for server-side operations (do NOT expose this in client code).

## 2) Create `diary` table (SQL)
Run the SQL in the Supabase SQL editor (or use the migration file `db/create_diary_table.sql`):

```sql
-- create_diary_table.sql
CREATE TABLE IF NOT EXISTS public.diary (
  id text PRIMARY KEY,
  title text,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 3) Environment variables
Add the following to your `.env.local` (server-only values):

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...your_service_role_key...
```

- `SUPABASE_SERVICE_KEY` must be kept secret. Do NOT commit it to source control.

## 4) Usage
- The project will automatically use Supabase if both `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are present.
- If not present, the app falls back to local `data/diary.json` file storage.

## 5) Notes
- For production, consider creating API routes that use minimal privileges or enable Row Level Security (RLS) and use a service role only where necessary.
- If you prefer hosted syncing (e.g., Supabase Auth per-user), we can extend the API to save entries per-user and require authentication.
