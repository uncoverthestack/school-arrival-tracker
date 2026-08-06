import Link from 'next/link'

export const metadata = {
  title: 'About — Childmap',
}

const sectionClass = 'mt-8'
const headingClass = 'text-title-medium font-bold text-on-surface'
const bodyClass = 'mt-2 text-body-medium tracking-[0.1px] text-on-surface-variant leading-relaxed'

export default function AboutPage() {
  return (
    <div data-theme="light" className="min-h-screen bg-surface text-on-surface font-kiosk">
      <header className="border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="rounded-sm text-title-medium font-bold text-on-surface focus-visible:ring-2 focus-visible:ring-primary">Childmap</Link>
          <Link href="/" className="rounded-sm text-body-medium tracking-[0.1px] text-on-surface-variant hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary transition-colors">← Back home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <h1 className="text-headline-large font-bold text-on-surface">About Childmap</h1>
        <p className="mt-2 text-body-medium tracking-[0.1px] text-on-surface-variant">Why we built this</p>

        <div className={sectionClass}>
          <p className={bodyClass}>
            Every school gate still runs on the same outdated system: a paper logbook, a teacher or gateman manually recording names and times, and a parent at home simply hoping everything went fine.
            Most days, it does.
            But the moment something goes wrong a late pickup, a child who never made it into school, or confusion over who a student left with the logbook has little useful information to offer. By the time anyone checks it, it’s often too late to matter.
            Schools need more than a record of what happened. They need a system that knows when a child arrives, when they leave, who they leave with, and can instantly notify the right parent.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>The problem we kept seeing</h2>
          <p className={bodyClass}>
            Parents want one simple thing: to know their child is safe, the moment it&apos;s true not at pickup
            time, not when someone remembers to call. Schools want the same thing from the other side: a reliable
            record of who&apos;s on campus right now, without a staff member re-typing a paper register into a
            spreadsheet every evening. Neither side was getting it. The gap between &quot;my child left the house
            for school&quot; and &quot;my child is confirmed safe at school&quot; was just silence.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>What Childmap does about it</h2>
          <p className={bodyClass}>
            Childmap replaces the logbook with a gate scanner and a live dashboard. A student taps a card, enters a
            code, or is recognised by Face ID, and two things happen instantly: the school&apos;s dashboard updates,
            and the parent gets a message. Same at pickup. No end-of-day reconciliation, no guessing, no waiting
            just a record that&apos;s accurate the second it&apos;s created, for the people who actually need it.
          </p>
        </div>

        <div className={sectionClass}>
          <h2 className={headingClass}>Who it&apos;s for</h2>
          <p className={bodyClass}>
            We built Childmap for schools that take arrival and departure seriously but don&apos;t have the budget
            or the appetite for enterprise security software starting with schools here in Nigeria, where this gap
            is especially wide. Simple enough for gate staff to run without training, honest enough about pricing
            that a school can budget for it per term, and built so that every check-in actually reaches a
            parent&apos;s phone, not just a database.
          </p>
        </div>
      </main>
    </div>
  )
}
