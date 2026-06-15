-- School Arrival Tracker — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database.

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,   -- e.g. SCH-2026-0001 (matches QR code value)
  name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  parent_name TEXT,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  card_id TEXT UNIQUE,               -- RFID card UID or same as student_id for QR
  photo_url TEXT,                    -- public URL from Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS arrivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('arrival', 'departure')),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE DEFAULT CURRENT_DATE
);

-- Index for fast daily lookups
CREATE INDEX IF NOT EXISTS idx_arrivals_date ON arrivals(date);
CREATE INDEX IF NOT EXISTS idx_arrivals_student_date ON arrivals(student_id, date, type);
CREATE INDEX IF NOT EXISTS idx_students_card_id ON students(card_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);

-- Row Level Security (enable after confirming schema works)
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE arrivals ENABLE ROW LEVEL SECURITY;
