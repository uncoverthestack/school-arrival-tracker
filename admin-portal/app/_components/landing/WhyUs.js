'use client'

import { motion } from 'framer-motion'

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

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0, 0, 1] } } }

export function WhyUs() {
  return (
    <section id="why-us" className="scroll-mt-20 relative overflow-hidden bg-[#101010] py-20 md:py-28">
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">
        <motion.div
          className="mb-14 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Why schools choose Childmap
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-x-10 gap-y-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {WHY_US.map((item, i) => (
            <motion.div key={item.title} variants={itemVariants} className="flex gap-4">
              <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#1d6fc4] text-white font-bold text-sm">
                {i + 1}
              </span>
              <div>
                <p className="text-base font-bold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
