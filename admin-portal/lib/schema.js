import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const schools = pgTable('schools', {
  id:                  uuid('id').defaultRandom().primaryKey(),
  name:                text('name').notNull(),
  subdomain:           text('subdomain').notNull().unique(),
  apiKey:              text('api_key').notNull().unique(),
  adminEmail:          text('admin_email').notNull().unique(),
  adminPasswordHash:   text('admin_password_hash').notNull(),
  status:              text('status').default('pending').notNull(),
  schoolType:          text('school_type').default('primary').notNull(),
  archivedAt:          timestamp('archived_at', { withTimezone: true }),
  paymentApprovedAt:   timestamp('payment_approved_at', { withTimezone: true }),
  paymentDueAt:        timestamp('payment_due_at', { withTimezone: true }),
  pendingExpiresAt:    timestamp('pending_expires_at', { withTimezone: true }),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const students = pgTable('students', {
  id:             uuid('id').defaultRandom().primaryKey(),
  schoolId:       uuid('school_id').references(() => schools.id),
  studentId:      text('student_id'),
  name:           text('name').notNull(),
  studentClass:   text('student_class'),
  parentName:     text('parent_name'),
  parentPhone:    text('parent_phone'),
  parentEmail:    text('parent_email'),
  cardId:         text('card_id'),
  code:           text('code').unique(),
  codeYear:       text('code_year'),
  photoUrl:       text('photo_url'),
  faceDescriptor: text('face_descriptor'),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
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

export const verifications = pgTable('verifications', {
  id:         uuid('id').defaultRandom().primaryKey(),
  studentId:  uuid('student_id').references(() => students.id),
  phone:      text('phone').notNull(),
  otp:        text('otp').notNull(),
  expiresAt:  timestamp('expires_at', { withTimezone: true }).notNull(),
  used:       boolean('used').default(false).notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
