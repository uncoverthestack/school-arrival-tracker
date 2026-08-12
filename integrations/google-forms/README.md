# Google Forms → Instant Student Creation

Lets a parent/staff Form submission create a real, scannable student —
photo uploaded, gate code generated — the moment they hit Submit. No manual
CSV export or Bulk Import step.

## Why this exists

Google Forms file-upload answers only give you a Google Drive link — not
usable as a photo URL (no public serving, no CORS). `photo-sync.gs` closes
that gap and goes one step further: on every form submission it (1) pulls
the uploaded photo out of Drive and re-uploads it to your Supabase
`student-photos` bucket, then (2) calls the admin portal's `/api/students`
endpoint directly to create the student with that photo already attached,
writing the generated `code` and `studentId` back into the response Sheet.

## Reachability — read this before setup

This script calls your admin portal *from Google's servers*, over the
public internet. **`http://localhost:3000` will not work** — Google cannot
reach a URL that only exists on your laptop. `ADMIN_PORTAL_URL` needs to
point at:
- a real deployment (e.g. `https://your-app.vercel.app`), or
- a temporary public tunnel (e.g. `ngrok http 3000`) if you're testing
  against local dev — the tunnel URL changes every time you restart it,
  so you'd need to update the script property each time.

## Setup

See the header comment in [`photo-sync.gs`](./photo-sync.gs) for exact
steps: paste the script into the response Sheet's Apps Script editor, set
five Script Properties (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SCHOOL_ID`, `ADMIN_PORTAL_URL`, `SCHOOL_API_KEY`), match the `FIELD_*`
constants to your form's actual question titles, and add an "On form
submit" trigger.

`SCHOOL_API_KEY` is that school's `schools.api_key` — the same value used
in its gate URL's `?key=` param. It authenticates the script's
student-creation requests the same way a gate kiosk authenticates scans.

## Day-to-day flow

1. Parent/staff fills out the Form (name, class, parent phone, photo, etc).
2. The script fires automatically: photo → Supabase Storage, student →
   admin portal database, gate code generated.
3. The response Sheet gets `photoUrl`, `code`, and `studentId` columns
   filled in on that same row, for your own records.
4. The student is immediately scannable at the gate with that code —
   nothing left to import.

## Limits worth knowing

- The service_role key bypasses Row Level Security — it can read/write your
  whole Supabase project, not just this bucket. `SCHOOL_API_KEY` grants
  full student-creation rights for that one school. Treat both as
  production secrets.
- Rows missing name, studentClass, or parentPhone are skipped (logged in
  Apps Script's Executions) — a photo alone won't create a student.
- Newly created students start with `phoneVerified: false` — the gate will
  refuse to check them in until the parent completes the SMS OTP flow at
  `/register`. This is separate from and unaffected by this integration.
- Every created student gets a unique gate code immediately, but the
  Bulk Import CSV path still exists and works independently if you ever
  need to backfill a batch some other way.
