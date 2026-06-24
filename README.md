# SchoolPass — dataocelotschools.com

A multi-tenant school arrival tracking SaaS. Each school gets its own isolated portal at a unique subdomain (e.g. `greenfield.dataocelotschools.com`). Gate attendants log student arrivals and departures by entering a 6-digit code, scanning a QR code, or using an RFID reader. Parents receive SMS and WhatsApp notifications in real time.

---

## Features

- **Multi-tenant** — every school is fully data-isolated behind its own subdomain
- **Gate scanner** — code entry, QR camera, or USB RFID reader (HID keyboard emulation)
- **Student ID card result** — scan shows portrait photo, name, class, student ID, and arrival time in a clean card UI
- **Live dashboard** — real-time arrival stats that auto-refresh every 10 seconds
- **Student directory** — all enrolled students with gate codes, photos, and class info
- **Student code rotation** — codes tied to the school year; rotate automatically on promotion, preserved on class repeat
- **Parent notifications** — SMS + WhatsApp via AWS Lambda on every arrival and departure
- **Parent self-registration** — 2-step OTP flow; phone must match what the school registered (prevents students faking parent numbers)
- **School self-registration** — any school signs up at `/signup`, no manual SQL needed
- **Super admin panel** — platform owner can suspend, restore, archive, or permanently delete any school
- **Rate limiting** — per-endpoint limits via Upstash Redis (gracefully skips if not configured)
- **Admin auth** — encrypted session cookies via iron-session; bcrypt password hashing

---

## Architecture

```
Browser / Gate device
        │
        ▼
  Next.js 16 (App Router)  ←── proxy.js (subdomain routing + status check)
        │
        ├── /superadmin     Platform owner panel (suspend / archive / delete schools)
        ├── /api/*          REST endpoints (external devices, parent registration)
        ├── /               Admin dashboard (server component, session-protected)
        ├── /gate           Gate scanner (client component)
        ├── /students       Student directory with class editing + code rotation
        ├── /signup         School self-registration
        └── /login          Admin login
        │
        ▼
   Supabase (PostgreSQL)
        │
        ▼
   AWS Lambda              SMS (SNS) + WhatsApp (End User Messaging Social)
```

**Subdomain routing** — `proxy.js` intercepts every request, looks up the school by subdomain, checks its status (`active` / `suspended` / `archived`), and injects the school's API key only for active schools.

---

## Project Structure

```
school-arrival-tracker/
├── admin-portal/           Next.js 16 app
│   ├── app/
│   │   ├── page.js              Dashboard
│   │   ├── gate/                Gate scanner
│   │   ├── students/            Student directory + code rotation
│   │   ├── superadmin/          Super admin panel
│   │   ├── login/               Admin login
│   │   ├── signup/              School registration
│   │   ├── register/            Parent self-registration
│   │   ├── actions/
│   │   │   └── scan.js          Server action for gate scanning
│   │   └── api/
│   │       ├── scan/            External device endpoint (ESP32, RFID bridge)
│   │       ├── students/        CRUD for students
│   │       ├── students/[id]/   Update class + trigger code rotation
│   │       ├── arrivals/        Query arrivals
│   │       ├── stats/           Today's stats
│   │       ├── signup/          School account creation
│   │       ├── register/        Parent OTP request
│   │       ├── verify/          Parent OTP verification
│   │       ├── superadmin/      Super admin auth + school management
│   │       └── auth/            Login / logout
│   ├── lib/
│   │   ├── supabase.js          Supabase client (lazy init)
│   │   ├── session.js           iron-session school admin auth
│   │   ├── superSession.js      iron-session super admin auth (separate cookie)
│   │   ├── schools.js           School lookup by API key
│   │   ├── notify.js            Lambda notification helper
│   │   └── ratelimit.js         Upstash rate limiting
│   └── proxy.js                 Subdomain routing (Next.js middleware)
├── card-generator/              Static HTML card printer (generates printable student codes)
├── lambda/
│   └── notify/
│       └── index.mjs            AWS Lambda — SMS + WhatsApp notifications
└── infrastructure/
    └── supabase-migration.sql   Full DB schema
```

---

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project
- (Optional) An [Upstash](https://upstash.com) Redis database for rate limiting
- (Optional) AWS account with Lambda for SMS/WhatsApp notifications

---

## Database Setup

Run the full migration in your Supabase dashboard under **SQL Editor** — paste the contents of `infrastructure/supabase-migration.sql` and click Run.

The schema creates:

| Table | Key columns |
|-------|-------------|
| `schools` | `name`, `subdomain`, `api_key`, `status`, `archived_at` |
| `students` | `school_id`, `code`, `code_year`, `student_id`, `photo_url` |
| `arrivals` | `school_id`, `student_id`, `type`, `date`, `scanned_at` |
| `verifications` | `student_id`, `phone`, `otp`, `expires_at`, `used` |

**Grant permissions** (required for tables created via SQL editor):

```sql
GRANT ALL ON public.schools      TO service_role;
GRANT ALL ON public.students     TO service_role;
GRANT ALL ON public.arrivals     TO service_role;
GRANT ALL ON public.verifications TO service_role;
```

**Fix status on existing rows** (if migrating an existing database):

```sql
UPDATE schools SET status = 'active' WHERE status IS NULL;
```

---

## Local Setup

```bash
git clone <repo>
cd school-arrival-tracker/admin-portal
pnpm install
cp .env.local.example .env.local   # fill in your values
pnpm dev
```

Open [http://localhost:3000/signup](http://localhost:3000/signup) to create your first school account.

---

## Environment Variables

Create `admin-portal/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Session encryption (must be 32+ characters)
SESSION_SECRET=change-me-to-a-32-plus-character-random-string

# Super admin credentials — platform owner only, never share these
SUPER_ADMIN_EMAIL=you@yourdomain.com
SUPER_ADMIN_PASSWORD=your-strong-password

# AWS Lambda for SMS/WhatsApp (optional — skip to disable notifications)
NOTIFY_LAMBDA_URL=https://your-function.lambda-url.us-east-1.on.aws
NOTIFY_LAMBDA_API_KEY=your-lambda-api-key

# Upstash Redis for rate limiting (optional — skipped gracefully if missing)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Super Admin Panel

The platform owner manages all schools at:

```
https://dataocelotschools.com/superadmin
```

Log in with `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`. This panel is completely separate from school admin accounts — no school can access it.

### School statuses

| Status | Meaning | Data |
|--------|---------|------|
| **Active** | School has full access | Live |
| **Suspended** | Access blocked (e.g. late payment) | Intact — fully restorable |
| **Archived** | Soft-deleted, hidden from all queries | Intact in Supabase — restorable |

### Actions per status

| From | Actions available |
|------|------------------|
| Active | Suspend · Archive |
| Suspended | Restore · Archive |
| Archived | Restore · Delete forever |

- **Suspend** — portal goes dark instantly, login blocked, all data untouched
- **Restore** — one click, full access restored immediately
- **Archive** — school is hidden from all queries but data stays in Supabase
- **Delete forever** — only available on archived schools; permanently removes all students, arrivals, and parent records

### Clear test data via SQL

To wipe all schools and start clean:

```sql
DELETE FROM verifications WHERE student_id IN (SELECT id FROM students);
DELETE FROM arrivals;
DELETE FROM students;
DELETE FROM schools;
```

---

## Adding Students

**Via API** (using the school's API key):

```bash
curl -X POST https://greenfield.dataocelotschools.com/api/students \
  -H "x-api-key: YOUR_SCHOOL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jubril Manch",
    "studentClass": "JSS 2B",
    "parentPhone": "+2348012345678",
    "parentName": "Amina Manch",
    "photoUrl": "https://your-cdn.com/jubril.jpg"
  }'
```

The API auto-generates a unique `student_id` (`SCH-YYYY-NNNN`), a 6-digit gate `code`, and tags the code with the current school year (`code_year`).

**List all students:**

```bash
curl https://greenfield.dataocelotschools.com/api/students \
  -H "x-api-key: YOUR_SCHOOL_API_KEY"
```

---

## Student Code Rotation

Each student's 6-digit gate code is tied to the school year (`code_year`, e.g. `2025-2026`). At year-end, the school admin updates each student's class from the **Students** page:

| Change | Result |
|--------|--------|
| Class updated (e.g. JSS 1A → JSS 2A) | **New code generated** — student is promoted |
| Class unchanged (same class) | **Code preserved** — student is repeating |

The old code stops working immediately when a new one is generated.

---

## Gate Scanner

Open `/gate` on the school's subdomain (or pass `?key=API_KEY` on localhost):

```
http://localhost:3000/gate?key=YOUR_API_KEY
```

Three scan modes:

| Mode | How it works |
|------|-------------|
| **Code Entry** | Attendant types the student's 6-digit code |
| **QR Camera** | Phone/tablet camera reads a QR code printed on the student card |
| **RFID** | USB RFID reader plugged into the gate laptop — HID keyboard emulation, no driver needed |

The result card shows:
- Student portrait photo (letter avatar fallback)
- Full name, class, student ID
- Arrived / Departed time
- Status banner (green for first scan, orange if already checked in)

---

## External Device API

For hardware devices (ESP32, Raspberry Pi, custom RFID bridge):

```bash
POST /api/scan
x-api-key: YOUR_SCHOOL_API_KEY
Content-Type: application/json

{ "cardId": "123456", "type": "arrival" }
```

`cardId` can be the 6-digit code, the `student_id`, or the `card_id` (RFID chip UID).

---

## Parent Registration

Parents visit `/register` on the school's subdomain:

1. Enter the student's 6-digit code and their phone number
2. System checks the submitted number against what the school registered — prevents students entering their own number
3. OTP sent via SMS to the verified number
4. Enter the OTP to complete registration

After registration, every arrival and departure triggers an SMS + WhatsApp notification to that number.

---

## Multi-Tenancy

Every school is isolated by `school_id`. The subdomain is resolved in `proxy.js`:

1. Request arrives at `greenfield.dataocelotschools.com`
2. `proxy.js` reads the subdomain, queries Supabase for the matching school and checks its `status`
3. If status is not `active` — no school key is set, access is blocked
4. If active — sets `x-school-key` header (server components) and `school-key` cookie (client components)
5. All DB queries are scoped by `school_id` — School A can never read School B's data

No code changes or redeployments are needed when a new school signs up.

---

## Deployment

### How it works

Each school picks a subdomain at signup. With `dataocelotschools.com`:

| School | Subdomain | Portal URL |
|--------|-----------|------------|
| Greenfield Academy | `greenfield` | `greenfield.dataocelotschools.com` |
| St Joseph's | `stjoseph` | `stjoseph.dataocelotschools.com` |

The wildcard `*` routes all subdomains to the same Vercel deployment automatically.

---

### Step 1 — Deploy to Vercel

```bash
cd admin-portal
pnpm install
vercel --prod
```

Add all environment variables in Vercel → **Settings → Environment Variables**.

---

### Step 2 — Add domains in Vercel

In your Vercel project → **Settings → Domains**, add:

```
dataocelotschools.com
*.dataocelotschools.com
```

---

### Step 3 — Point nameservers to Vercel

Since `dataocelotschools.com` is a fresh domain (nothing else running on it), point its nameservers to Vercel in **AWS Route 53 → Registered Domains → Edit nameservers**:

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

This lets Vercel handle wildcard SSL automatically. Propagation takes a few minutes to a few hours.

---

### Step 4 — Deploy Lambda (SMS/WhatsApp notifications)

```bash
cd lambda/notify
zip -r function.zip .
aws lambda create-function \
  --function-name schoolpass-notify \
  --runtime nodejs20.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role
```

Enable a **Function URL** on the Lambda and add the URL + API key to Vercel environment variables.

---

## API Reference

All school-scoped endpoints require authentication via `x-api-key: YOUR_SCHOOL_API_KEY` header.  
Replace `https://greenfield.dataocelotschools.com` with your school's subdomain URL, or use `http://localhost:3000` with `?key=YOUR_API_KEY` for local testing.

---

### School Registration

#### `POST /api/signup`
Register a new school account. No auth required.

```bash
curl -X POST https://dataocelotschools.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Greenfield Academy",
    "subdomain": "greenfield",
    "email": "admin@greenfield.edu.ng",
    "password": "yourpassword"
  }'
```

**Response `201`**
```json
{ "success": true, "subdomain": "greenfield", "school": "Greenfield Academy" }
```

**Errors:** `400` missing fields · `409` subdomain or email already taken

---

### Admin Auth

#### `POST /api/auth/login`
Log in as school admin. Call from the school's subdomain so the middleware injects the school key — or pass `schoolKey` in the body for local testing.

```bash
curl -X POST https://greenfield.dataocelotschools.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greenfield.edu.ng",
    "password": "yourpassword"
  }'
```

Local testing (no subdomain):
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greenfield.edu.ng",
    "password": "yourpassword",
    "schoolKey": "YOUR_SCHOOL_API_KEY"
  }'
```

**Response `200`**
```json
{ "success": true, "school": "Greenfield Academy" }
```

**Errors:** `401` wrong credentials · `403` suspended or archived · `429` rate limited

#### `POST /api/auth/logout`
Clears the admin session cookie. No body needed.

```bash
curl -X POST https://greenfield.dataocelotschools.com/api/auth/logout
```

---

### Students

#### `GET /api/students`
List all students for the school.

```bash
curl https://greenfield.dataocelotschools.com/api/students \
  -H "x-api-key: YOUR_SCHOOL_API_KEY"
```

**Response `200`**
```json
{
  "students": [
    {
      "id": "uuid",
      "student_id": "SCH-2026-0001",
      "name": "Jubril Manch",
      "student_class": "JSS 2B",
      "parent_name": "Amina Manch",
      "parent_phone": "+2348012345678",
      "code": "483920",
      "code_year": "2025-2026",
      "photo_url": "https://cdn.example.com/jubril.jpg",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/students`
Add a new student. Generates a unique `student_id` and 6-digit gate `code` automatically.

```bash
curl -X POST https://greenfield.dataocelotschools.com/api/students \
  -H "x-api-key: YOUR_SCHOOL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jubril Manch",
    "studentClass": "JSS 2B",
    "parentPhone": "+2348012345678",
    "parentName": "Amina Manch",
    "photoUrl": "https://cdn.example.com/jubril.jpg"
  }'
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Student full name |
| `studentClass` | Yes | e.g. `JSS 2B`, `SS3A` |
| `parentPhone` | Yes | Used for notifications and registration verification |
| `parentName` | No | |
| `parentEmail` | No | |
| `photoUrl` | No | URL to student portrait photo |
| `cardId` | No | RFID card UID — defaults to `student_id` if omitted |

**Response `201`**
```json
{ "student": { "id": "uuid", "student_id": "SCH-2026-0001", "code": "483920", ... } }
```

#### `PATCH /api/students/:id`
Update a student's name, class, or photo. Requires admin session (browser login). Class change triggers automatic code rotation.

```bash
curl -X PATCH https://greenfield.dataocelotschools.com/api/students/STUDENT_UUID \
  -H "Content-Type: application/json" \
  --cookie "sp-admin=YOUR_SESSION" \
  -d '{
    "name": "Jubril A. Manch",
    "studentClass": "JSS 3B",
    "photoUrl": "https://cdn.example.com/jubril-new.jpg"
  }'
```

**Response `200`**
```json
{ "student": { ... }, "codeRotated": true }
```

`codeRotated: true` means the class changed → new gate code issued. `codeRotated: false` means same class → code preserved.

---

### Gate Scan (External Devices)

#### `POST /api/scan`
Log an arrival or departure. Intended for hardware devices (ESP32, Raspberry Pi, RFID bridge). `cardId` can be the 6-digit code, the `student_id`, or the RFID chip UID.

```bash
curl -X POST https://greenfield.dataocelotschools.com/api/scan \
  -H "x-api-key: YOUR_SCHOOL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "cardId": "483920", "type": "arrival" }'
```

| Field | Required | Values |
|-------|----------|--------|
| `cardId` | Yes | 6-digit code, `student_id`, or RFID UID |
| `type` | No | `arrival` (default) or `departure` |

**Response — first scan `200`**
```json
{
  "success": true,
  "student": { "name": "Jubril Manch", "studentClass": "JSS 2B", "studentId": "SCH-2026-0001", "photoUrl": null },
  "time": "08:42",
  "message": "Arrived at 08:42 — parent notified"
}
```

**Response — duplicate scan `200`**
```json
{
  "duplicate": true,
  "student": { "name": "Jubril Manch", ... },
  "message": "Already scanned at 08:42"
}
```

**Errors:** `401` bad API key · `404` student not found · `429` rate limited (60 req/min per school)

---

### Arrivals

#### `GET /api/arrivals`
Query arrival and departure records for a given date.

```bash
# Today
curl https://greenfield.dataocelotschools.com/api/arrivals \
  -H "x-api-key: YOUR_SCHOOL_API_KEY"

# Specific date
curl "https://greenfield.dataocelotschools.com/api/arrivals?date=2026-06-24" \
  -H "x-api-key: YOUR_SCHOOL_API_KEY"
```

**Response `200`**
```json
{
  "arrivals": [
    {
      "id": "uuid",
      "type": "arrival",
      "time": "08:42",
      "scannedAt": "2026-06-24T07:42:00Z",
      "name": "Jubril Manch",
      "studentClass": "JSS 2B",
      "studentId": "SCH-2026-0001"
    }
  ],
  "date": "2026-06-24"
}
```

---

### Stats

#### `GET /api/stats`
Today's summary: total students, how many arrived, how many haven't.

```bash
curl https://greenfield.dataocelotschools.com/api/stats \
  -H "x-api-key: YOUR_SCHOOL_API_KEY"
```

**Response `200`**
```json
{
  "school": "Greenfield Academy",
  "totalStudents": 120,
  "arrivedToday": 87,
  "notArrived": 33,
  "date": "2026-06-24"
}
```

---

### Parent Registration

#### `POST /api/register`
Step 1 — request an OTP. The phone number submitted must exactly match `parent_phone` set by the school when the student was added.

```bash
curl -X POST https://greenfield.dataocelotschools.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "code": "483920",
    "parentName": "Amina Manch",
    "parentPhone": "+2348012345678"
  }'
```

**Response `200`**
```json
{
  "pending": true,
  "verificationId": "uuid",
  "studentName": "Jubril Manch",
  "message": "A verification code has been sent to +2348012345678",
  "devOtp": "291847"
}
```

> `devOtp` is only included in non-production environments to make local testing easier.

**Errors:** `403` phone doesn't match school records · `404` student code not found

#### `POST /api/verify`
Step 2 — submit the OTP to complete registration.

```bash
curl -X POST https://greenfield.dataocelotschools.com/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "verificationId": "uuid-from-step-1",
    "otp": "291847",
    "parentName": "Amina Manch"
  }'
```

**Response `200`**
```json
{
  "success": true,
  "student": { "name": "Jubril Manch", "studentClass": "JSS 2B" },
  "message": "You will receive notifications for Jubril Manch"
}
```

**Errors:** `400` wrong OTP · `410` expired or already used

---

### Super Admin

All super admin endpoints use a separate session cookie (`sp-super`). Call from `dataocelotschools.com`.

#### `POST /api/superadmin/login`

```bash
curl -X POST https://dataocelotschools.com/api/superadmin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@yourdomain.com",
    "password": "your-strong-password"
  }'
```

**Response `200`** — `{ "success": true }` — sets `sp-super` session cookie

#### `GET /api/superadmin/schools`
List all schools across the platform with student counts.

```bash
curl https://dataocelotschools.com/api/superadmin/schools \
  --cookie "sp-super=YOUR_SESSION"
```

**Response `200`**
```json
{
  "schools": [
    {
      "id": "uuid",
      "name": "Greenfield Academy",
      "subdomain": "greenfield",
      "admin_email": "admin@greenfield.edu.ng",
      "status": "active",
      "studentCount": 120,
      "created_at": "2026-01-10T09:00:00Z"
    }
  ]
}
```

#### `PATCH /api/superadmin/schools?id=SCHOOL_UUID`
Change a school's status. `action` must be `suspend`, `restore`, or `archive`.

```bash
# Suspend
curl -X PATCH "https://dataocelotschools.com/api/superadmin/schools?id=SCHOOL_UUID" \
  --cookie "sp-super=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{ "action": "suspend" }'

# Restore
curl -X PATCH "https://dataocelotschools.com/api/superadmin/schools?id=SCHOOL_UUID" \
  --cookie "sp-super=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{ "action": "restore" }'

# Archive
curl -X PATCH "https://dataocelotschools.com/api/superadmin/schools?id=SCHOOL_UUID" \
  --cookie "sp-super=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{ "action": "archive" }'
```

**Response `200`** — `{ "success": true, "action": "suspend" }`

#### `DELETE /api/superadmin/schools?id=SCHOOL_UUID`
Permanently delete a school and all its data. **School must be archived first.**

```bash
curl -X DELETE "https://dataocelotschools.com/api/superadmin/schools?id=SCHOOL_UUID" \
  --cookie "sp-super=YOUR_SESSION"
```

**Response `200`** — `{ "success": true }`

**Error `400`** if school is not in `archived` status.

#### `POST /api/superadmin/logout`
```bash
curl -X POST https://dataocelotschools.com/api/superadmin/logout \
  --cookie "sp-super=YOUR_SESSION"
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/scan` | 60 requests / minute per school |
| `/api/register` | 5 requests / minute per IP |
| `/api/auth/login` | 10 requests / 15 minutes per IP |

Rate limiting uses Upstash Redis. If `UPSTASH_REDIS_REST_URL` is not set or is a placeholder, rate limiting is silently skipped (safe for local dev).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Database | Supabase (PostgreSQL) |
| Auth | iron-session (encrypted cookies) + bcryptjs |
| Rate limiting | Upstash Redis + @upstash/ratelimit |
| Notifications | AWS Lambda + SNS (SMS) + End User Messaging Social (WhatsApp) |
| QR scanning | html5-qrcode |
| Styling | Tailwind CSS v4 |
| Package manager | pnpm |
