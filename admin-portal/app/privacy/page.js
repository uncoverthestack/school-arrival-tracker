import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Childmap',
}

const sectionClass = 'mt-8'
const headingClass = 'text-title-medium font-bold text-on-surface'
const bodyClass = 'mt-2 text-body-medium tracking-[0.1px] text-on-surface-variant leading-relaxed'

export default function PrivacyPolicyPage() {
  return (
    <div data-theme="light" className="min-h-screen bg-surface text-on-surface font-kiosk">
      <header className="border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="rounded-sm text-title-medium font-bold text-on-surface focus-visible:ring-2 focus-visible:ring-primary">Childmap</Link>
          <Link href="/" className="rounded-sm text-body-medium tracking-[0.1px] text-on-surface-variant hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary transition-colors">← Back home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <div className="rounded-xl bg-warning-container text-on-warning-container text-body-medium tracking-[0.1px] px-4 py-3 mb-8">
          <strong>Draft — pending legal review.</strong> This page describes what Childmap actually collects and how it's
          used today. It has not been reviewed by a lawyer and should not be relied on as a compliance guarantee
          (e.g. under Nigeria's NDPR) before real public launch.
        </div>

        <h1 className="text-headline-large font-bold text-on-surface">Privacy Policy</h1>
        <p className="mt-2 text-body-medium tracking-[0.1px] text-on-surface-variant">Last updated: 18 July 2026</p>

        <div className={sectionClass}>
          <p className={bodyClass}>
            Childmap ("we", "our") provides a school gate attendance and parent-notification system. This policy
            explains what information we collect from schools, students, and parents, and how it's used.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Information we collect</h2>
          <p className={bodyClass}>
            <strong>School accounts:</strong> the registering admin's name, email address, and a password (stored as a
            salted hash, never in plain text).
          </p>
          <p className={bodyClass}>
            <strong>Student records:</strong> name, class, a school-assigned student ID, an optional photo, and an
            optional face descriptor (a mathematical representation of facial geometry generated from the photo —
            not the photo itself — used only to match a student at the gate camera).
          </p>
          <p className={bodyClass}>
            <strong>Parent/guardian information:</strong> name, phone number, and optionally email, provided by the
            school or by the parent during phone verification. Phone numbers are used to send arrival/departure
            notifications by SMS and WhatsApp.
          </p>
          <p className={bodyClass}>
            <strong>Attendance records:</strong> a timestamped log of each gate check-in and check-out, per student.
          </p>
          <p className={bodyClass}>
            <strong>Demo requests:</strong> if you fill out the "Request a Demo" form, we store your name, phone
            number, and your school's name, email, and address so we can follow up.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>How we use this information</h2>
          <p className={bodyClass}>
            To operate the attendance system: recognising students at the gate, recording arrivals and departures,
            and sending real-time notifications to parents. To support school administrators: dashboards, class
            management, and account communications (e.g. payment reminders, approval notices). We do not sell
            personal information, and we do not use student or parent data for advertising.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Where data is stored</h2>
          <p className={bodyClass}>
            Records are stored in a managed PostgreSQL database (Supabase). Photos are stored in Supabase Storage.
            Emails are sent via Amazon SES; SMS/WhatsApp messages are sent via a third-party messaging provider.
            These providers process data on our behalf and do not use it for their own purposes.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Biometric data (Face ID)</h2>
          <p className={bodyClass}>
            Face ID enrollment is optional. If a school enables it for a student, we store a face descriptor derived
            from the student's photo — not the raw image data used for matching. A school admin can remove a
            student's face descriptor at any time from the Students page, which deletes it permanently.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Data retention and deletion</h2>
          <p className={bodyClass}>
            Schools control their own student records and can edit or delete them at any time. If a school account is
            permanently deleted, all associated student, attendance, and verification records are deleted with it.
            Demo request submissions are retained until manually removed by our team.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Your rights</h2>
          <p className={bodyClass}>
            Parents or guardians who want their phone number, or a student's face data, removed should contact their
            school's administrator directly — schools control this data and can act on the request through their
            dashboard.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Contact</h2>
          <p className={bodyClass}>
            Questions about this policy can be sent to the platform administrator's registered contact email.
          </p>
        </div>
      </main>
    </div>
  )
}
