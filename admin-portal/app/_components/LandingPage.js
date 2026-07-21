'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { RequestDemoButton } from './RequestDemoButton'
import { MobileNav } from './MobileNav'
import { TiltCard } from './TiltCard'

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
    iconBg: 'bg-primary-container', iconText: 'text-primary', // shared across all feature icons for a consistent accent
    icon: (
      <path d="M2 5V3a1 1 0 0 1 1-1h3M18 5V3a1 1 0 0 0-1-1h-3M2 15v2a1 1 0 0 0 1 1h3M18 15v2a1 1 0 0 1-1 1h-3M2 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    ),
    panel: (
      <div className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-success-container text-on-success-container flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-label-large tracking-[0.1px] font-bold text-on-surface truncate">Ada Bello checked in</p>
          <p className="text-label-medium tracking-[0.4px] text-on-surface-variant">Gate scanner · 7:42 AM</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Instant Parent Alerts',
    desc: 'Parents get an SMS/WhatsApp message the moment their child arrives — and again when they leave.',
    iconBg: 'bg-primary-container', iconText: 'text-primary',
    icon: (
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
    panel: (
      <div className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4">
        <p className="text-label-medium tracking-[0.4px] text-on-surface-variant mb-2">SMS to parent</p>
        <div className="inline-block rounded-lg rounded-tl-none bg-success-container text-on-success-container px-3 py-2">
          <p className="text-body-medium tracking-[0.25px]">Ada arrived safely at 7:42am.</p>
        </div>
      </div>
    ),
  },
  {
    title: 'Class Management',
    desc: 'Set up JSS1A, JSS1B, JSS1C and beyond — add as many arms as your school needs, any time.',
    iconBg: 'bg-primary-container', iconText: 'text-primary',
    icon: (
      <><rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="11.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" /></>
    ),
    panel: (
      <div className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4 flex flex-wrap gap-2">
        {['JSS1A', 'JSS1B', 'JSS1C', 'JSS2A'].map(c => (
          <span key={c} className="rounded-full bg-secondary-container text-on-secondary-container text-label-medium tracking-[0.4px] px-3 py-1">{c}</span>
        ))}
      </div>
    ),
  },
  {
    title: 'Bulk Student Import',
    desc: 'Already have a student list from the school? Import it in one go via CSV instead of entering each one by hand.',
    iconBg: 'bg-primary-container', iconText: 'text-primary',
    icon: (
      <path d="M10 3v10m0 0-4-4m4 4 4-4M3 15v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
    panel: (
      <div className="rounded-lg bg-surface-container-lowest border border-outline-variant p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-label-large tracking-[0.1px] font-bold text-on-surface">students.csv</p>
          <p className="text-label-medium tracking-[0.4px] text-on-surface-variant">247 rows</p>
        </div>
        <div className="h-2 rounded-full bg-surface-container overflow-hidden">
          <div className="h-full bg-tertiary rounded-full" style={{ width: '70%' }} />
        </div>
      </div>
    ),
  },
  {
    title: 'Live Dashboard',
    desc: 'See checked-in, checked-out, and unaccounted counts update in real time as the gate scans come in.',
    iconBg: 'bg-primary-container', iconText: 'text-primary',
    icon: (
      <><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" /><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>
    ),
    panel: (
      <div className="grid grid-cols-2 gap-2.5">
        <MockMetric label="Checked in" value="128" bg="bg-success-container" text="text-on-success-container" />
        <MockMetric label="Unaccounted" value="4" bg="bg-warning-container" text="text-on-warning-container" />
      </div>
    ),
  },
  {
    title: 'Multi-School Ready',
    desc: 'Each school gets its own portal and gate codes — built to scale from one campus to a whole network.',
    iconBg: 'bg-primary-container', iconText: 'text-primary',
    icon: (
      <path d="M3 17V8l7-4 7 4v9M3 17h14M3 17v0M7 17v-5h6v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
    panel: (
      <div className="rounded-lg bg-surface-container-lowest border border-outline-variant p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-primary-container text-on-primary-container">
          <p className="text-label-large tracking-[0.1px] font-medium">Greenfield Academy</p>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="px-3 py-2 rounded-md text-on-surface-variant">
          <p className="text-label-large tracking-[0.1px] font-medium">Sunrise College</p>
        </div>
      </div>
    ),
  },
]

const PRICING = [
  {
    name: 'Standard',
    price: '₦2,000',
    per: '/ pupil / term',
    note: 'Pay only for active students.',
    features: ['Unlimited guardians & staff', 'SMS arrival & departure alerts', 'Face ID + card + code check-in', 'Email support'],
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
    desc: 'Every student gets a private 6-digit code. Codes automatically rotate when they’re promoted to the next class.',
  },
  {
    title: 'Multiple Check-In Modes',
    desc: 'ID card, code entry, or Face ID, staff can pick whichever is fastest for the gate that day.',
  },
]

export function LandingPage() {
  const heroRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -60])
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduceMotion ? 1 : 0])
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 40])
  const mockupRotate = useTransform(scrollYProgress, [0, 1], [-8, reduceMotion ? -8 : -2])

  return (
    <div data-theme="light" className="min-h-screen bg-surface text-on-surface font-kiosk">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-outline-variant">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <div className="flex items-center gap-2">
            <img src="/brand/childmap-icon-256.png" alt="" width={30} height={30} className="size-7.5 shrink-0" />
            <p className="text-title-large font-bold text-on-surface">Childmap</p>
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-label-large tracking-[0.1px] font-medium text-on-surface-variant">
            <a href="#features" className="rounded-sm hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary transition-colors">Features</a>
            <a href="#why-us" className="rounded-sm hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary transition-colors">Why Childmap</a>
            <a href="#pricing" className="rounded-sm hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-label-large tracking-[0.1px] font-bold shadow-sm transition-all hover:opacity-90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

      <section ref={heroRef} className="relative overflow-hidden bg-linear-to-b from-primary-container/70 via-primary-container/25 to-surface">
        {/* Ambient floating glow — pure atmosphere, no interaction. Static (no loop) under reduced motion. */}
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? {} : { x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl"
        />
        <motion.div
          aria-hidden="true"
          animate={reduceMotion ? {} : { x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-tertiary/20 blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-32 grid lg:grid-cols-12 gap-16 items-center">
          <motion.div
            style={{ y: heroTextY, opacity: heroTextOpacity }}
            initial="hidden" animate="show" variants={staggerContainer} className="lg:col-span-5"
          >
            <motion.h1 variants={fadeUp} className="text-display-small sm:text-display-large font-bold text-on-surface">
              Track Every Arrival <span className="text-primary">and Departure.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-body-large tracking-[0.5px] text-on-surface-variant max-w-md">
              Replace the paper logbook with instant gate check-ins, live dashboards, and SMS alerts parents actually see.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <RequestDemoButton className="px-6 py-3 rounded-lg bg-primary text-on-primary text-label-large tracking-[0.1px] font-bold shadow-sm transition-all hover:opacity-90 hover:shadow-md">
                Request Demo
              </RequestDemoButton>
              <a
                href="#features"
                className="px-6 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface text-label-large tracking-[0.1px] font-semibold shadow-sm transition-all hover:bg-surface-container hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Learn More ↓
              </a>
            </motion.div>
          </motion.div>

          {/* Dashboard mockup — a stylized preview of the real Today dashboard, always dark to match the app screenshot.
              Rests at a 3D tilt (perspective + rotateY) and tilts further toward the cursor via TiltCard. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, x: 60, rotateY: -22 }}
            animate={{ opacity: 1, x: 0, rotateY: -8 }}
            style={{ y: mockupY, rotate: mockupRotate, perspective: 1200 }}
            transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            data-theme="dark" className="lg:col-span-7"
          >
            <TiltCard tiltStrength={6} className="rounded-lg shadow-2xl">
              <div className="rounded-lg bg-surface-container-lowest border border-outline-variant overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-outline-variant bg-surface-container">
                  <span className="w-2.5 h-2.5 rounded-full bg-error" />
                  <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="ml-3 text-label-medium tracking-[0.4px] text-on-surface-variant font-mono truncate">app.childmap.ng</span>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ml-auto text-on-surface-variant md:hidden shrink-0">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex">
                  <div className="hidden md:flex flex-col gap-1 w-40 shrink-0 border-r border-outline-variant p-3">
                    <p className="text-label-medium tracking-[0.4px] font-bold text-on-surface px-2 pb-2">Childmap</p>
                    <span className="text-label-medium tracking-[0.4px] font-medium rounded-md px-2 py-1.5 bg-primary-container text-on-primary-container">Today</span>
                    <span className="text-label-medium tracking-[0.4px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Gate scanner</span>
                    <span className="text-label-medium tracking-[0.4px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Watchlist</span>
                    <span className="text-label-medium tracking-[0.4px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Students</span>
                    <span className="text-label-medium tracking-[0.4px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Messages</span>
                  </div>
                  <div className="p-4 sm:p-5 flex-1 min-w-0">
                    <p className="text-title-small font-bold text-on-surface mb-3">Welcome, Admin</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
                      <MockMetric label="Checked in" value="128" bg="bg-success-container" text="text-on-success-container" />
                      <MockMetric label="Checked out" value="94" bg="bg-secondary-container" text="text-on-secondary-container" />
                      <MockMetric label="Expected" value="150" bg="bg-primary-container" text="text-on-primary-container" />
                      <MockMetric label="Unaccounted" value="22" bg="bg-warning-container" text="text-on-warning-container" />
                      <MockMetric label="Alerts sent" value="340" bg="bg-tertiary-container" text="text-on-tertiary-container" />
                      <MockMetric label="Classes" value="18" bg="bg-surface-container" text="text-on-surface" />
                    </div>
                    <div className="rounded-xl bg-surface-container p-3">
                      <p className="text-label-medium tracking-[0.4px] text-on-surface-variant mb-2">Arrival flow</p>
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
            </TiltCard>
          </motion.div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={fadeUp}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <p className="text-label-medium tracking-[0.4px] uppercase font-bold text-primary mb-2">Features</p>
          <h2 className="text-headline-medium font-bold text-on-surface">Everything your gate needs</h2>
          <p className="mt-3 text-body-large tracking-[0.5px] text-on-surface-variant">One system connecting the gate, the office, and every parent.</p>
        </motion.div>
        <div className="flex flex-col gap-16 sm:gap-20">
          {FEATURES.map((f, i) => {
            const reversed = i % 2 === 1
            return (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="show" viewport={scrollReveal} variants={fadeUp}
                className="grid sm:grid-cols-2 gap-8 sm:gap-14 items-center"
              >
                <div className={reversed ? 'sm:order-2' : undefined}>
                  <div className={`w-11 h-11 rounded-xl ${f.iconBg} ${f.iconText} flex items-center justify-center mb-4`}>
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">{f.icon}</svg>
                  </div>
                  <p className="text-title-large font-bold text-on-surface">{f.title}</p>
                  <p className="mt-2 text-body-medium tracking-[0.25px] text-on-surface-variant max-w-md">{f.desc}</p>
                </div>
                <div className={`rounded-lg bg-surface-container border border-outline-variant p-6 sm:p-8 ${reversed ? 'sm:order-1' : ''}`}>
                  {f.panel}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section id="why-us" className="scroll-mt-20 bg-secondary-container/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20">
          <motion.div
            initial="hidden" whileInView="show" viewport={scrollReveal} variants={fadeUp}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <p className="text-label-medium tracking-[0.4px] uppercase font-bold text-primary mb-2">Why Childmap</p>
            <h2 className="text-headline-medium font-bold text-on-surface">Why Schools Choose Childmap</h2>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="show" viewport={scrollReveal} variants={staggerContainer}
            className="grid sm:grid-cols-2 gap-x-10 gap-y-8 max-w-3xl mx-auto"
          >
            {WHY_US.map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-label-large tracking-[0.1px]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-title-medium font-bold text-on-surface">{item.title}</p>
                  <p className="mt-1 text-body-medium tracking-[0.25px] text-on-surface-variant">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={scrollReveal}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mt-16 text-center text-headline-small text-on-surface max-w-2xl mx-auto italic"
          >
            &ldquo;Safety isn&apos;t expensive, it&apos;s priceless.&rdquo;
          </motion.p>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-20 max-w-6xl mx-auto px-4 sm:px-8 py-20">
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={fadeUp}
          className="text-center max-w-xl mx-auto mb-12"
        >
          <p className="text-label-medium tracking-[0.4px] uppercase font-bold text-primary mb-2">Pricing</p>
          <h2 className="text-headline-medium font-bold text-on-surface">Simple, Fair Pricing</h2>
          <p className="mt-3 text-body-large tracking-[0.5px] text-on-surface-variant">Choose the plan that fits your school&apos;s size. Start small, grow big.</p>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={staggerContainer}
          className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto"
        >
          {PRICING.map(plan => (
            <motion.div key={plan.name} variants={fadeUp} className="h-full">
            <div
              className={`relative h-full flex flex-col rounded-lg px-8 py-8 sm:py-10 border transition-all duration-200 hover:-translate-y-0.5 ${
                plan.highlighted
                  ? 'border-primary bg-surface-container-lowest shadow-md hover:shadow-xl'
                  : 'border-outline-variant bg-surface-container-lowest shadow-sm hover:border-primary hover:shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-on-primary text-label-small tracking-[0.5px] font-bold">
                  Best value for growth
                </span>
              )}
              <p className="text-title-large font-bold text-on-surface text-center">{plan.name}</p>
              <p className="mt-3 text-center">
                <span className="text-headline-medium font-bold text-primary">{plan.price}</span>{' '}
                <span className="text-body-medium tracking-[0.25px] text-on-surface-variant">{plan.per}</span>
              </p>
              <p className="mt-3 text-label-medium tracking-[0.4px] text-center text-on-surface-variant bg-surface-container rounded-lg px-4 py-2.5">{plan.note}</p>
              <ul className="mt-8 flex flex-col gap-3.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-body-medium tracking-[0.25px] text-on-surface">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-success shrink-0 mt-0.5">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.highlighted ? (
                <RequestDemoButton
                  className="mt-8 w-full py-3 rounded-lg text-label-large tracking-[0.1px] font-bold bg-primary text-on-primary shadow-sm hover:opacity-90 hover:shadow-md transition-all"
                >
                  Get Started
                </RequestDemoButton>
              ) : (
                // Not wired yet — destination TBD, don't open the demo modal for this plan.
                <button
                  type="button"
                  className="mt-8 w-full py-3 rounded-lg text-label-large tracking-[0.1px] font-bold bg-surface-container-lowest text-on-surface border border-outline shadow-sm hover:bg-surface-container hover:shadow-md transition-all"
                >
                  Get Started
                </button>
              )}
            </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-primary text-on-primary">
        <motion.div
          initial="hidden" whileInView="show" viewport={scrollReveal} variants={staggerContainer}
          className="max-w-3xl mx-auto px-4 sm:px-8 py-16 text-center"
        >
          <motion.h2 variants={fadeUp} className="text-headline-medium font-bold">Ready to get started?</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-body-large tracking-[0.5px] opacity-90">Tell us about your school and we&apos;ll set up a walkthrough.</motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <RequestDemoButton className="px-8 py-3.5 rounded-lg bg-surface-container-lowest text-primary text-label-large tracking-[0.1px] font-bold shadow-sm transition-all hover:opacity-90 hover:shadow-md">
              Request Demo
            </RequestDemoButton>
          </motion.div>
        </motion.div>
      </section>

      <footer className="border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <img src="/brand/childmap-icon-256.png" alt="" width={28} height={28} className="size-7 shrink-0" />
              <div>
                <p className="text-title-medium font-bold text-on-surface">Childmap</p>
                <p className="text-body-medium tracking-[0.25px] text-on-surface-variant">Real-time school arrival &amp; departure tracking.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
              <Link href="/privacy" className="rounded-sm text-body-medium tracking-[0.25px] text-primary hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary transition-opacity">Privacy Policy</Link>
              <p className="text-body-medium tracking-[0.25px] text-on-surface-variant">© {new Date().getFullYear()} Childmap. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function MockMetric({ label, value, bg, text }) {
  return (
    <div className={`${bg} ${text} rounded-lg px-2.5 py-2`}>
      <p className="text-label-small tracking-[0.5px] font-medium opacity-80 truncate">{label}</p>
      <p className="text-title-large font-bold leading-tight">{value}</p>
    </div>
  )
}
