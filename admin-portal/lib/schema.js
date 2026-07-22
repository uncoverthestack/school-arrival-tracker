import { pgTable, uuid, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core'

export const schools = pgTable('schools', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  name:                text('name').notNull(),
  subdomain:           text('subdomain').notNull().unique(),
  apiKey:              text('api_key').notNull().unique(),
  adminEmail:          text('admin_email').notNull().unique(),
  adminPasswordHash:   text('admin_password_hash').notNull(),
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
  pendingExpiresAt:    timestamp('pending_expires_at', { withTimezone: true }),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const students = pgTable('students', {
  id:                uuid('id').defaultRandom().primaryKey(),
  schoolId:          uuid('school_id').references(() => schools.id),
  studentId:         text('student_id'),
  name:              text('name').notNull(),
  studentClass:      text('student_class'),
  parentName:        text('parent_name'),
  parentPhone:       text('parent_phone'),
  parentEmail:       text('parent_email'),
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
})

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
