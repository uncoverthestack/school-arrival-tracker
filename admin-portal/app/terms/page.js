import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Childmap',
}

const sectionClass = 'mt-8'
const headingClass = 'text-title-medium font-bold text-on-surface'
const bodyClass = 'mt-2 text-body-medium tracking-[0.1px] text-on-surface-variant leading-relaxed'

export default function TermsPage() {
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
          <strong>Draft — pending legal review.</strong> This page describes how Childmap actually operates today. It
          has not been reviewed by a lawyer and should not be relied on as a binding contract before real public launch.
        </div>

        <h1 className="text-headline-large font-bold text-on-surface">Terms of Service</h1>
        <p className="mt-2 text-body-medium tracking-[0.1px] text-on-surface-variant">Last updated: 24 July 2026</p>

        <div className={sectionClass}>
          <p className={bodyClass}>
            These terms govern a school&apos;s use of Childmap (&quot;we&quot;, &quot;our&quot;), a gate attendance and
            parent-notification system. By creating a school account, you agree to these terms on behalf of your school.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>The service</h2>
          <p className={bodyClass}>
            Childmap lets a school record student arrivals and departures at the gate (by ID card, code entry, or
            Face ID), notify parents by SMS/WhatsApp when their child checks in or out, and manage classes and
            students from an admin dashboard.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Accounts and approval</h2>
          <p className={bodyClass}>
            A school signs up with an admin name, email, and school details. New accounts are reviewed before they
            become active. The registering admin is responsible for keeping login credentials secure and for the
            accuracy of the student and guardian information entered into the system.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Pricing and billing</h2>
          <p className={bodyClass}>
            Plans are billed per pupil, per term — Standard at ₦2,000/pupil/term, Premium (unlimited pupils) at
            ₦4,000/pupil/term. You only pay for active students. Pricing is subject to change with notice before
            your next billing term.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Your data</h2>
          <p className={bodyClass}>
            Your school owns the student, guardian, and attendance records you enter. You can edit or delete them at
            any time from the dashboard. See our{' '}
            <Link href="/privacy" className="text-primary hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary rounded-sm">Privacy Policy</Link>
            {' '}for what we collect and how it&apos;s used.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Acceptable use</h2>
          <p className={bodyClass}>
            Childmap is for legitimate school attendance tracking only. You agree not to enter data for students or
            guardians without a lawful basis to do so, attempt to bypass gate verification, or use the service in a
            way that disrupts other schools on the platform.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Service availability</h2>
          <p className={bodyClass}>
            We aim to keep Childmap available and notifications timely, but as with any networked service, gate
            scans, SMS/WhatsApp delivery, and dashboard access can be affected by factors outside our control
            (connectivity, third-party messaging providers, etc.). We are not liable for delays or failures caused
            by those factors.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Changes to these terms</h2>
          <p className={bodyClass}>
            We may update these terms as the product changes. Material changes will be communicated to school admins
            before they take effect.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Contact</h2>
          <p className={bodyClass}>
            Questions about these terms can be sent to the platform administrator&apos;s registered contact email.
          </p>
        </div>
      </main>
    </div>
  )
}
