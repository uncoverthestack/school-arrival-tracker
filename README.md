# SchoolPass

A multi-tenant school arrival tracking SaaS. Each school gets its own isolated portal with a unique subdomain. Gate attendants log student arrivals and departures by entering a 6-digit code, scanning a QR code, or using an RFID reader. Parents receive SMS and WhatsApp notifications in real time.

---

## Features

- **Multi-tenant** — every school is fully data-isolated behind its own subdomain (e.g. `greenfield.schoolpass.com`)
- **Gate scanner** — code entry, QR camera, or USB RFID reader (HID keyboard emulation)
- **Student ID card** — scan result shows portrait photo, name, class, student ID, and arrival time
- **Live dashboard** — real-time arrival stats that auto-refresh every 10 seconds
- **Student directory** — paginated list of all enrolled students with gate codes
- **Parent notifications** — SMS + WhatsApp via AWS Lambda on every arrival and departure
- **Parent self-registration** — 2-step OTP phone verification so parents link themselves to a student
- **School self-registration** — any school can sign up at `/signup` with no manual SQL
- **Rate limiting** — per-endpoint limits via Upstash Redis (gracefully skips if not configured)
- **Admin auth** — encrypted session cookies via iron-session; bcrypt password hashing

---

## Architecture

```
Browser / Gate device
        │
        ▼
  Next.js 16 (App Router)  ←── proxy.js (subdomain routing)
        │
        ├── /api/*          REST endpoints (external devices, parent registration)
        ├── /               Admin dashboard (server component, session-protected)
        ├── /gate           Gate scanner (client component)
        ├── /students       Student directory (server component)
        ├── /signup         School self-registration
        └── /login          Admin login
        │
        ▼
   Supabase (PostgreSQL)
        │
        ▼
   AWS Lambda              SMS (SNS) + WhatsApp (End User Messaging Social)
```

**Subdomain routing** — `proxy.js` intercepts every request, looks up the school by subdomain via the Supabase REST API, and injects the school's API key as an `x-school-key` header and a `school-key` cookie so both server components and client components can identify the school.

---

## Project Structure

```
school-arrival-tracker/
├── admin-portal/           Next.js 16 app
│   ├── app/
│   │   ├── page.js         Dashboard
│   │   ├── gate/           Gate scanner
│   │   ├── students/       Student directory
│   │   ├── login/          Admin login
│   │   ├── signup/         School registration
│   │   ├── register/       Parent self-registration
│   │   ├── actions/
│   │   │   └── scan.js     Server action for gate scanning
│   │   └── api/
│   │       ├── scan/       External device endpoint (ESP32, RFID bridge)
│   │       ├── students/   CRUD for students
│   │       ├── arrivals/   Query arrivals
│   │       ├── stats/      Today's stats
│   │       ├── signup/     School account creation
│   │       ├── register/   Parent OTP request
│   │       ├── verify/     Parent OTP verification
│   │       └── auth/       Login / logout
│   ├── lib/
│   │   ├── supabase.js     Supabase client
│   │   ├── session.js      iron-session admin auth
│   │   ├── schools.js      School lookup by API key
│   │   ├── notify.js       Lambda notification helper
│   │   └── ratelimit.js    Upstash rate limiting
│   └── proxy.js            Subdomain routing (Next.js middleware)
├── card-generator/         Static HTML card printer (generates printable student codes)
├── lambda/
│   └── notify/
│       └── index.mjs       AWS Lambda — SMS + WhatsApp notifications
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

Run the migration in your Supabase dashboard under **SQL Editor**:

```sql
-- From infrastructure/supabase-migration.sql
```

The schema creates:

| Table | Purpose |
|-------|---------|
| `schools` | One row per school — name, subdomain, hashed password, API key |
| `students` | Students with `school_id`, 6-digit `code`, `student_id`, `photo_url` |
| `arrivals` | Arrival/departure events with `school_id`, `student_id`, `date`, `type` |
| `verifications` | OTP records for parent phone verification |

After running the migration, also run this if adding `photo_url` to an existing database:

```sql
ALTER TABLE students ADD COLUMN photo_url TEXT;
```

---

## Local Setup

```bash
git clone <repo>
cd school-arrival-tracker/admin-portal
pnpm install
cp .env.local.example .env.local   # then fill in your values
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

# AWS Lambda for SMS/WhatsApp (optional — skip to disable notifications)
NOTIFY_LAMBDA_URL=https://your-function.lambda-url.us-east-1.on.aws
NOTIFY_LAMBDA_API_KEY=your-lambda-api-key

# Upstash Redis for rate limiting (optional — skipped gracefully if missing)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

---

## Adding Students

**Via API** (using the school's API key):

```bash
curl -X POST https://yourschool.schoolpass.com/api/students \
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

The API auto-generates a unique `student_id` (`SCH-YYYY-NNNN`) and a 6-digit gate `code`. The response includes both.

**List all students:**

```bash
curl https://yourschool.schoolpass.com/api/students \
  -H "x-api-key: YOUR_SCHOOL_API_KEY"
```

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

When a code is scanned the result card shows:
- Student portrait photo (letter avatar fallback)
- Full name, class, student ID
- Arrival or departure time
- Parent notification status

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
2. Receive a 6-digit OTP via SMS
3. Enter the OTP to link their number to the student

After registration, every arrival and departure triggers an SMS + WhatsApp message to that number.

---

## Multi-Tenancy

Every school is isolated by `school_id`. The subdomain is resolved in `proxy.js`:

1. Request arrives at `greenfield.schoolpass.com`
2. `proxy.js` queries Supabase for the school with `subdomain = 'greenfield'`
3. Sets `x-school-key` header (read by server components) and `school-key` cookie (read by client components)
4. All DB queries are scoped by `school_id` — no school can read another school's data

---

## Deployment

### Next.js → Vercel

```bash
cd admin-portal
vercel --prod
```

Set all environment variables in the Vercel project dashboard. Configure custom domains so `*.schoolpass.com` points to your Vercel deployment.

### Lambda → AWS

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

Enable a **Function URL** on the Lambda and set the URL + a secret API key in your Vercel environment variables.

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/scan` | 60 requests / minute per school |
| `/api/register` | 5 requests / minute per IP |
| `/api/auth/login` | 10 requests / 15 minutes per IP |

Limits are enforced via Upstash Redis. If `UPSTASH_REDIS_REST_URL` is not set, rate limiting is silently skipped (safe for local dev).

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
