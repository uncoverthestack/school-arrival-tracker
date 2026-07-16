-- SchoolPass — full database migration
-- Safe to run on a fresh DB or an existing one that already has students/arrivals tables.
-- Run in Supabase dashboard → SQL Editor

-- ── 1. Schools table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 TEXT        NOT NULL,
  subdomain            TEXT        NOT NULL UNIQUE,
  api_key              TEXT        NOT NULL UNIQUE,
  admin_email          TEXT        NOT NULL UNIQUE,
  admin_password_hash  TEXT        NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS schools_subdomain_idx   ON schools(subdomain);
CREATE INDEX IF NOT EXISTS schools_admin_email_idx ON schools(admin_email);

-- ── 2. OTP verification table for parent phone verification ─────────────────
CREATE TABLE IF NOT EXISTS verifications (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  phone      TEXT        NOT NULL,
  otp        TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS verifications_id_used_idx ON verifications(id, used);

-- ── 3. Add school_id to students ────────────────────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id);

-- ── 4. Add unique 6-digit gate code to students ─────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;

-- ── 5. Add optional student photo URL ───────────────────────────────────────
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ── 6. Add school_id to arrivals ────────────────────────────────────────────
ALTER TABLE arrivals ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id);

-- ── 8. School status ────────────────────────────────────────────────────────
-- pending:     just registered, awaiting payment approval — no portal access
-- active:      payment approved, full access
-- payment_due: subscription expired — blocked until super admin approves renewal
-- suspended:   manually blocked by super admin, data intact, restorable
-- archived:    soft-deleted, hidden from all queries, restorable by super admin
ALTER TABLE schools ADD COLUMN IF NOT EXISTS status       TEXT        DEFAULT 'pending';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS archived_at  TIMESTAMPTZ;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS payment_approved_at TIMESTAMPTZ;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS payment_due_at      TIMESTAMPTZ;
-- Pending registrations expire after 48 hours; subdomain is freed for re-registration after expiry
ALTER TABLE schools ADD COLUMN IF NOT EXISTS pending_expires_at  TIMESTAMPTZ;
-- School type for identification — primary, secondary, combined, nursery, tertiary
ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_type TEXT DEFAULT 'primary';

-- Existing schools that were already active should stay active
UPDATE schools SET status = 'active' WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 minute';

-- ── 9. Track which school year the gate code was generated for ──────────────
-- e.g. "2025-2026". Code rotates when student is promoted; stays if repeating.
ALTER TABLE students ADD COLUMN IF NOT EXISTS code_year TEXT;

-- ── 10. Face descriptor for gate face recognition ───────────────────────────
-- Stored as a JSON array of 128 floats (Float32Array from face-api.js).
-- NULL means no face enrolled for this student.
ALTER TABLE students ADD COLUMN IF NOT EXISTS face_descriptor TEXT;

-- ── 11. Performance indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS students_school_id_idx        ON students(school_id);
CREATE INDEX IF NOT EXISTS students_code_idx             ON students(code);
CREATE INDEX IF NOT EXISTS arrivals_school_id_date_idx   ON arrivals(school_id, date);
CREATE INDEX IF NOT EXISTS arrivals_student_type_date_idx ON arrivals(student_id, type, date);
