-- SchoolPass — dashboard redesign migration
-- Safe to run on top of supabase-migration.sql. Run in Supabase dashboard → SQL Editor.

-- ── 1. Admin's own name, for the dashboard greeting ("Good morning, Mrs Okeke") ──
-- Nullable — existing accounts fall back to the school name until they set one.
ALTER TABLE schools ADD COLUMN IF NOT EXISTS admin_name TEXT;

-- ── 2. Track when a parent notification actually succeeded, for the "Alerts
--      sent" dashboard metric. notifyParent() stays fire-and-forget; this is
--      set afterwards once the Lambda call resolves, without blocking the scan
--      response. Nullable — null means no alert was sent (or it's still pending
--      / failed).
ALTER TABLE arrivals ADD COLUMN IF NOT EXISTS alerted_at TIMESTAMPTZ;
