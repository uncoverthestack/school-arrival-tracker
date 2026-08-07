'use client'

import { motion } from 'framer-motion'
import { ScanFace, MessageSquareText, LayoutGrid, LayoutDashboard } from 'lucide-react'

function GateScannerPanel() {
  return (
    <div className="w-full rounded-lg bg-surface-container-low border border-outline-variant p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-success-container text-on-success-container flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-on-surface truncate">Ada Bello checked in</p>
        <p className="text-xs text-on-surface-variant">Gate scanner · 7:42 AM</p>
      </div>
    </div>
  )
}

function AlertsPanel() {
  return (
    <div className="w-full rounded-lg bg-surface-container-low border border-outline-variant p-4">
      <p className="text-xs text-on-surface-variant mb-2">SMS to parent</p>
      <div className="inline-block rounded-lg rounded-tl-none bg-success-container text-on-success-container px-3 py-2">
        <p className="text-sm">Ada arrived safely at 7:42am.</p>
      </div>
    </div>
  )
}

function ClassesPanel() {
  return (
    <div className="w-full rounded-lg bg-surface-container-low border border-outline-variant p-4 flex flex-wrap gap-2">
      {['JSS1A', 'JSS1B', 'JSS1C', 'JSS2A'].map(c => (
        <span key={c} className="rounded-full bg-secondary-container text-on-secondary-container text-xs px-3 py-1">{c}</span>
      ))}
    </div>
  )
}

function DashboardPanel() {
  return (
    <div className="w-full rounded-lg bg-surface-container-low border border-outline-variant p-4 grid grid-cols-2 gap-2.5">
      <div className="bg-success-container text-on-success-container rounded-lg px-2.5 py-2">
        <p className="text-[10px] font-medium opacity-80 truncate uppercase tracking-wide">Checked in</p>
        <p className="text-lg font-bold leading-tight">128</p>
      </div>
      <div className="bg-warning-container text-on-warning-container rounded-lg px-2.5 py-2">
        <p className="text-[10px] font-medium opacity-80 truncate uppercase tracking-wide">Unaccounted</p>
        <p className="text-lg font-bold leading-tight">4</p>
      </div>
    </div>
  )
}

const FEATURES = [
  {
    icon: ScanFace,
    title: 'Gate Scanner',
    description: 'Three check-in modes at the gate: ID card tap, 6-digit code entry, or Face ID whatever fits your school.',
    span: 'lg:col-span-2',
    Panel: GateScannerPanel,
  },
  {
    icon: MessageSquareText,
    title: 'Instant Parent Alerts',
    description: 'Parents get an SMS/WhatsApp message the moment their child arrives and again when they leave.',
    span: 'lg:col-span-3',
    Panel: AlertsPanel,
  },
  {
    icon: LayoutGrid,
    title: 'Class Management',
    description: 'Set up JSS1A, JSS1B, JSS1C and beyond add as many arms as your school needs, any time.',
    span: 'lg:col-span-3',
    Panel: ClassesPanel,
  },
  {
    icon: LayoutDashboard,
    title: 'Live Dashboard',
    description: 'See checked-in, checked-out, and unaccounted counts update in real time as the gate scans come in.',
    span: 'lg:col-span-2',
    Panel: DashboardPanel,
  },
]

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0, 0, 1] } } }

export function Features() {
  return (
    <section id="features" data-theme="light" className="scroll-mt-20 relative overflow-hidden bg-surface py-20 md:py-28">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          className="mb-14 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface text-balance">
            Everything your gate needs
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 max-w-xl text-base text-on-surface-variant">
            One system connecting the gate, the office, and every parent.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {FEATURES.map(f => (
            <motion.div key={f.title} variants={itemVariants} className={`h-full w-full ${f.span}`}>
              <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="flex h-full w-full flex-col gap-5 p-6 lg:p-8">
                  <div>
                    <div className="mb-4 flex items-center justify-center w-11 h-11 rounded-full bg-primary-container">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-on-surface">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant text-pretty">{f.description}</p>
                  </div>
                  <div className="mt-auto">
                    <f.Panel />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
