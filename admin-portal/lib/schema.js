import { pgTable, uuid, text, boolean, integer, timestamp, unique, index } from 'drizzle-orm/pg-core'

export const schools = pgTable('schools', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  name:                text('name').notNull(),
  // Short human-readable tag shown in front of gate codes for this school
  // (e.g. "TA" -> "TA-482910") — resolved once at creation time and never
  // recomputed, so a later school with a colliding name falls back to a
  // different tag instead of silently displaying the same prefix as an
  // earlier school. See lib/codePrefix.js.
  codePrefix:          text('code_prefix').unique(),
  subdomain:           text('subdomain').notNull().unique(),
  apiKey:              text('api_key').notNull().unique(),
  adminEmail:          text('admin_email').notNull().unique(),
  adminPasswordHash:   text('admin_password_hash').notNull(),
  adminName:           text('admin_name'),
  status:              text('status').default('pending').notNull(),
  schoolType:          text('school_type').default('primary').notNull(),
  // Time (school's local/Africa-Lagos clock) after which a not-yet-arrived,
  // non-bus student triggers a "not in school" alert to their parent.
  arrivalCutoffHour:     integer('arrival_cutoff_hour').default(8).notNull(),
  arrivalCutoffMinute:   integer('arrival_cutoff_minute').default(15).notNull(),
  // Time after which a student who arrived but hasn't been scanned out yet
  // (and isn't a bus rider) triggers a "hasn't checked out" alert.
  departureCutoffHour:   integer('departure_cutoff_hour').default(15).notNull(),
  departureCutoffMinute: integer('departure_cutoff_minute').default(0).notNull(),
  archivedAt:          timestamp('archived_at', { withTimezone: true }),
  paymentApprovedAt:   timestamp('payment_approved_at', { withTimezone: true }),
  paymentDueAt:        timestamp('payment_due_at', { withTimezone: true }),
  paymentReminderSentAt: timestamp('payment_reminder_sent_at', { withTimezone: true }),
  pendingExpiresAt:    timestamp('pending_expires_at', { withTimezone: true }),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// A parent/guardian contact — one per distinct phone number per school, so
// siblings sharing a parent share one record instead of duplicating (and
// drifting out of sync with) their contact info across student rows.
export const parents = pgTable('parents', {
  id:            uuid('id').defaultRandom().primaryKey(),
  schoolId:      uuid('school_id').references(() => schools.id).notNull(),
  name:          text('name'),
  phone:         text('phone').notNull(), // E.164
  email:         text('email'),
  phoneVerified: boolean('phone_verified').default(false).notNull(),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const students = pgTable('students', {
  id:                uuid('id').defaultRandom().primaryKey(),
  schoolId:          uuid('school_id').references(() => schools.id),
  studentId:         text('student_id'),
  name:              text('name').notNull(),
  studentClass:      text('student_class'),
  parentId:          uuid('parent_id').references(() => parents.id),
  cardId:            text('card_id'),
  code:              text('code').unique(),
  codeYear:          text('code_year'),
  photoUrl:          text('photo_url'),
  faceDescriptor:    text('face_descriptor'),
  // Bus riders are exempt from the cutoff-time "not in school" alert — their
  // arrival time depends on the route, not a fixed gate time.
  usesBus:                  boolean('uses_bus').default(false).notNull(),
  lastLateAlertDate:        text('last_late_alert_date'), // YYYY-MM-DD — arrival-alert dedup guard
  lastLateDepartureAlertDate: text('last_late_departure_alert_date'), // YYYY-MM-DD — departure-alert dedup guard
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // studentId/cardId are per-school sequence numbers (see createStudent
  // call sites) — they only need to be unique within a school, not across
  // the whole app. Scoped here to replace stray global-unique constraints
  // that existed directly on the database outside of migration history and
  // caused collisions between different schools' students.
  unique('students_school_student_id_unique').on(table.schoolId, table.studentId),
  unique('students_school_card_id_unique').on(table.schoolId, table.cardId),
])

export const classes = pgTable('classes', {
  id:        uuid('id').defaultRandom().primaryKey(),
  schoolId:  uuid('school_id').references(() => schools.id).notNull(),
  level:     text('level').notNull(),  // e.g. 'JSS1', 'JSS2', 'SS1'
  arm:       text('arm').notNull(),    // e.g. 'A', 'B', 'C', 'D'...
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const arrivals = pgTable('arrivals', {
  id:        uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').references(() => students.id),
  schoolId:  uuid('school_id').references(() => schools.id),
  type:      text('type').notNull(), // 'arrival' | 'departure'
  date:      text('date').notNull(), // YYYY-MM-DD
  scannedAt: timestamp('scanned_at', { withTimezone: true }).defaultNow().notNull(),
  alertedAt: timestamp('alerted_at', { withTimezone: true }),
})

// A record of a student flagged by the cutoff-time alert cron jobs — created
// at the same moment the parent's SMS goes out, so admins have a browsable,
// persistent log instead of just the on-the-fly "Needs attention" preview.
export const watchlistEntries = pgTable('watchlist_entries', {
  id:         uuid('id').defaultRandom().primaryKey(),
  schoolId:   uuid('school_id').references(() => schools.id).notNull(),
  studentId:  uuid('student_id').references(() => students.id).notNull(),
  reason:     text('reason').notNull(), // 'not_arrived' | 'not_departed'
  date:       text('date').notNull(),   // YYYY-MM-DD
  flaggedAt:  timestamp('flagged_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
})

export const demoRequests = pgTable('demo_requests', {
  id:            uuid('id').defaultRandom().primaryKey(),
  firstName:     text('first_name').notNull(),
  lastName:      text('last_name').notNull(),
  phone:         text('phone').notNull(),
  schoolName:    text('school_name').notNull(),
  schoolEmail:   text('school_email').notNull(),
  schoolAddress: text('school_address').notNull(),
  contacted:     boolean('contacted').default(false).notNull(),
  createdAt:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const passwordResets = pgTable('password_resets', {
  id:         uuid('id').defaultRandom().primaryKey(),
  schoolId:   uuid('school_id').references(() => schools.id).notNull(),
  token:      text('token').notNull().unique(),
  expiresAt:  timestamp('expires_at', { withTimezone: true }).notNull(),
  used:       boolean('used').default(false).notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const verifications = pgTable('verifications', {
  id:         uuid('id').defaultRandom().primaryKey(),
  studentId:  uuid('student_id').references(() => students.id),
  phone:      text('phone').notNull(),
  otp:        text('otp').notNull(),
  expiresAt:  timestamp('expires_at', { withTimezone: true }).notNull(),
  used:       boolean('used').default(false).notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// One row per SMS we hand to a provider, updated in place when the provider's
// delivery webhook reports back. Without this, a message accepted by the API but
// dropped by the carrier (the usual DND failure) is invisible to us.
export const smsDeliveries = pgTable('sms_deliveries', {
  id:         uuid('id').defaultRandom().primaryKey(),
  provider:   text('provider').notNull(),
  // Provider-side message id; the only key a delivery webhook gives us to join on.
  messageId:  text('message_id').unique(),
  brand:      text('brand'),
  phone:      text('phone').notNull(),
  kind:       text('kind'),
  // submitted -> delivered | failed | expired, as reported by the provider
  status:     text('status').notNull().default('submitted'),
  // Provider's own status string and failure reason, kept verbatim for debugging
  providerStatus: text('provider_status'),
  failureReason:  text('failure_reason'),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // Supports getRecentSmsFailures(): newest failures first. messageId already has an
  // index via its unique constraint, which is the key delivery webhooks look up by.
  index('sms_deliveries_status_created_idx').on(table.status, table.createdAt.desc()),
])
