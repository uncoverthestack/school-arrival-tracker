'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { RequestDemoButton } from './RequestDemoButton'
import { MobileNav } from './MobileNav'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

// Section headings/subtitles fade in once when scrolled into view — doesn't replay on every scroll past.
const scrollReveal = { once: true, amount: 0.3 }

const FEATURES = [
  {
    title: 'Gate Scanner',
    desc: 'Three check-in modes at the gate: ID card tap, 6-digit code entry, or Face ID — whatever fits your school.',
    icon: (
      <path d="M2 5V3a1 1 0 0 1 1-1h3M18 5V3a1 1 0 0 0-1-1h-3M2 15v2a1 1 0 0 0 1 1h3M18 15v2a1 1 0 0 1-1 1h-3M2 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    ),
  },
  {
    title: 'Instant Parent Alerts',
    desc: 'Parents get an SMS/WhatsApp message the moment their child arrives — and again when they leave.',
    icon: (
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Class Management',
    desc: 'Set up JSS1A, JSS1B, JSS1C and beyond — add as many arms as your school needs, any time.',
    icon: (
      <><rect x="2" y="2" width="7" height="7" rx="1.5" /><rect x="11" y="2" width="7" height="7" rx="1.5" opacity="0.4" /><rect x="2" y="11" width="7" height="7" rx="1.5" opacity="0.4" /><rect x="11" y="11" width="7" height="7" rx="1.5" opacity="0.4" /></>
    ),
  },
  {
    title: 'Bulk Student Import',
    desc: 'Already have a student list from the school? Import it in one go via CSV instead of entering each one by hand.',
    icon: (
      <path d="M10 3v10m0 0-4-4m4 4 4-4M3 15v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Live Dashboard',
    desc: 'See checked-in, checked-out, and unaccounted counts update in real time as the gate scans come in.',
    icon: (
      <><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" /><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>
    ),
  },
  {
    title: 'Multi-School Ready',
    desc: 'Each school gets its own portal and gate codes — built to scale from one campus to a whole network.',
    icon: (
      <path d="M3 17V8l7-4 7 4v9M3 17h14M3 17v0M7 17v-5h6v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
]

const PRICING = [
  {
    name: 'Standard',
    price: '₦2,000',
    per: '/ pupil / term',
    note: 'Pay only for active students. Perfect for starting out.',
    features: ['All system features', 'Unlimited guardians & staff', 'SMS arrival & departure alerts', 'Face ID + card + code check-in', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '₦4,000',
    per: '/ pupil / term',
    note: 'Unlimited students, subsidized cost at scale.',
    features: ['Everything in Standard', 'Unlimited pupils', 'Priority support', 'Dedicated account manager'],
    highlighted: true,
  },
]

const WHY_US = [
  {
    title: 'Live "In-School" Visibility',
    desc: "Know exactly who's checked in and who's already gone home, at any second of the school day.",
  },
  {
    title: 'Instant Notifications',
    desc: 'Parents receive a message the moment their child arrives or leaves, no more wondering.',
  },
  {
    title: 'Unique Gate Codes',
    desc: 'Every student gets a private 6-digit code. Codes automatically rotate when they’re promoted a class.',
  },
  {
    title: 'Multiple Check-In Modes',
    desc: 'ID card, code entry, or Face ID, staff can pick whichever is fastest for the gate that day.',
  },
]

export function LandingPage() {
  return (
    <div data-theme="light" className="min-h-screen bg-surface text-on-surface font-kiosk">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-outline-variant">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <div className="flex items-center gap-2">
            <img src="/brand/childmap-icon-256.png" alt="" width={30} height={30} className="size-7.5 shrink-0" />
            <p className="text-xl font-extrabold text-on-surface">Childmap</p>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
            <a href="#features" className="hover:text-on-surface transition-colors">Features</a>
            <a href="#why-us" className="hover:text-on-surface transition-colors">Why Childmap</a>
            <a href="#pricing" className="hover:text-on-surface transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold transition-opacity hover:opacity-90"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="4" y="9" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Login
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <section className="bg-linear-to-b from-primary-container/70 via-primary-container/25 to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-32 grid lg:grid-cols-12 gap-16 items-center">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="lg:col-span-5">
            <motion.span
              variants={fadeUp}
              className="inline-block px-3 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant text-xs font-semibold text-on-surface-variant mb-6"
            >
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl font-extrabold leading-tight text-on-surface">
              Track Every Arrival, <span className="text-primary">Departure.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-lg text-on-surface-variant max-w-md">
              Replace the paper logbook with instant gate check-ins, live dashboards, and SMS alerts parents actually see.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <RequestDemoButton className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold transition-opacity hover:opacity-90">
                Request Demo
              </RequestDemoButton>
              <a
                href="#features"
                className="px-6 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-semibold transition-colors hover:bg-surface-container"
              >
                Learn More ↓
              </a>
            </motion.div>
          </motion.div>

          {/* Dashboard mockup — a stylized preview of the real Today dashboard, always dark to match the app screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            data-theme="dark" className="lg:col-span-7">
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-outline-variant bg-surface-container">
                <span className="w-2.5 h-2.5 rounded-full bg-error" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                <span className="w-2.5 h-2.5 rounded-full bg-success" />
                <span className="ml-3 text-xs text-on-surface-variant font-mono truncate">http://localhost:3000</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ml-auto text-on-surface-variant md:hidden shrink-0">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex">
                <div className="hidden md:flex flex-col gap-1 w-40 shrink-0 border-r border-outline-variant p-3">
                  <p className="text-xs font-bold text-on-surface px-2 pb-2">Childmap</p>
                  <span className="text-xs font-medium rounded-md px-2 py-1.5 bg-primary-container text-on-primary-container">Today</span>
                  <span className="text-xs font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Gate scanner</span>
                  <span className="text-xs font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Watchlist</span>
                  <span className="text-xs font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Students</span>
                  <span className="text-xs font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Messages</span>
                </div>
                <div className="p-4 sm:p-5 flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface mb-3">Welcome, Admin</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                    <MockMetric label="Checked in" value="128" bg="bg-success-container" text="text-on-success-container" />
                    <MockMetric label="Checked out" value="94" bg="bg-secondary-container" text="text-on-secondary-container" />
                    <MockMetric label="Expected" value="150" bg="bg-primary-container" text="text-on-primary-container" />
                    <MockMetric label="Unaccounted" value="22" bg="bg-warning-container" text="text-on-warning-container" />
                    <MockMetric label="Alerts sent" value="340" bg="bg-tertiary-container" text="text-on-tertiary-container" />
                    <MockMetric label="Classes" value="18" bg="bg-surface-container" text="text-on-surface" />
                  </div>
                  <div className="rounded-xl bg-surface-container p-3">
                    <p className="text-xs text-on-surface-variant mb-2">Arrival flow</p>
                    <svg viewBox="0 0 200 50" className="w-full h-10 text-primary" preserveAspectRatio="none">
                      <polyline
                        points="0,45 20,40 40,30 60,15 80,10 100,8 120,12 140,20 160,28 180,35 200,42"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={fadeUp}
          className="text-center max-w-xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-extrabold text-on-surface">Everything your gate needs</h2>
          <p className="mt-3 text-on-surface-variant">One system connecting the gate, the office, and every parent.</p>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map(f => (
            <motion.div key={f.title} variants={fadeUp} className="p-6 rounded-2xl bg-surface-container border border-outline-variant">
              <div className="w-11 h-11 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">{f.icon}</svg>
              </div>
              <p className="text-lg font-bold text-on-surface">{f.title}</p>
              <p className="mt-1.5 text-sm text-on-surface-variant">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="why-us" className="bg-secondary-container/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
          <motion.h2
            initial="hidden" whileInView="show" viewport={scrollReveal} variants={fadeUp}
            className="text-3xl font-extrabold text-center mb-12 text-on-surface"
          >
            Why Schools Choose SchoolPass
          </motion.h2>
          <h2 className="text-3xl font-extrabold text-center mb-12 text-on-surface">Why Schools Choose Childmap</h2>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial="hidden" whileInView="show" viewport={scrollReveal} variants={staggerContainer}
              className="flex flex-col gap-8"
            >
              {WHY_US.map((item, i) => (
                <motion.div key={item.title} variants={fadeUp} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-on-surface">{item.title}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={scrollReveal}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-2xl bg-surface-container border border-outline-variant p-10 flex flex-col items-center justify-center text-center gap-4 min-h-64"
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-primary">
                <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3Z" fill="currentColor" opacity="0.15" />
                <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p className="italic text-on-surface-variant">&ldquo;Safety isn&apos;t expensive, it&apos;s priceless.&rdquo;</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={fadeUp}
          className="text-center max-w-xl mx-auto mb-12"
        >
          <h2 className="text-3xl font-extrabold text-on-surface">Simple, Fair Pricing</h2>
          <p className="mt-3 text-on-surface-variant">Choose the plan that fits your school&apos;s size. Start small, grow big.</p>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={staggerContainer}
          className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {PRICING.map(plan => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              className={`relative rounded-2xl p-8 border ${
                plan.highlighted ? 'border-primary bg-surface-container-lowest shadow-lg' : 'border-outline-variant bg-surface-container-lowest'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold">
                  Best value for growth
                </span>
              )}
              <p className="text-lg font-bold text-on-surface text-center">{plan.name}</p>
              <p className="mt-3 text-center">
                <span className="text-3xl font-extrabold text-primary">{plan.price}</span>{' '}
                <span className="text-sm text-on-surface-variant">{plan.per}</span>
              </p>
              <p className="mt-3 text-xs text-center text-on-surface-variant bg-surface-container rounded-lg px-3 py-2">{plan.note}</p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-on-surface">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-success shrink-0 mt-0.5">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-primary text-on-primary">
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={staggerContainer}
          className="max-w-3xl mx-auto px-4 sm:px-8 py-16 text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-extrabold">Ready to get started?</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 opacity-90">Tell us about your school and we&apos;ll set up a walkthrough.</motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <RequestDemoButton className="px-8 py-3.5 rounded-xl bg-surface-container-lowest text-primary font-bold transition-opacity hover:opacity-90">
              Request Demo
            </RequestDemoButton>
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-outline-variant">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col items-center gap-1 text-center">
          <img src="/brand/childmap-icon-256.png" alt="" width={28} height={28} className="size-7 shrink-0 mb-1" />
          <p className="font-extrabold text-on-surface">Childmap</p>
          <p className="text-sm text-on-surface-variant">Real-time school arrival &amp; departure tracking.</p>
          <p className="text-sm text-on-surface-variant mt-3">© {new Date().getFullYear()} Childmap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function MockMetric({ label, value, bg, text }) {
  return (
    <div className={`${bg} ${text} rounded-lg px-2.5 py-2`}>
      <p className="text-[10px] font-medium opacity-80 truncate">{label}</p>
      <p className="text-lg font-extrabold leading-tight">{value}</p>
    </div>
  )
}
