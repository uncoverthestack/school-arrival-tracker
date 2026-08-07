'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, animate, useReducedMotion } from 'framer-motion'
import { ScanFace, MessageSquareText, LayoutDashboard, Clock } from 'lucide-react'

const STATS = [
  { id: 1, value: '3', label: 'Check-in Modes', icon: ScanFace },
  { id: 2, value: '2', label: 'Alert Channels', icon: MessageSquareText },
  { id: 3, value: '1', label: 'Live Dashboard', icon: LayoutDashboard },
  { id: 4, value: '<1', suffix: 'min', label: 'Alert Speed', icon: Clock },
]

function CountingNumber({ value, suffix }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const reduceMotion = useReducedMotion()
  const number = parseFloat(value)

  useEffect(() => {
    if (!isInView || !ref.current) return
    if (reduceMotion) {
      ref.current.textContent = value
      return
    }
    const controls = animate(0, number, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: latest => {
        if (ref.current) ref.current.textContent = Number.isInteger(number) ? Math.floor(latest).toString() : latest.toFixed(1)
      },
    })
    return controls.stop
  }, [isInView, number, reduceMotion, value])

  return (
    <span className="tabular-nums">
      <span ref={ref}>0</span>
      {suffix ? <span className="ml-1 text-xl lg:text-2xl align-middle">{suffix}</span> : null}
    </span>
  )
}

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0, 0, 1] } } }

export function Stats() {
  return (
    <section data-theme="light" className="relative w-full overflow-hidden bg-surface py-20 md:py-28">
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          className="mb-14 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface">
            One system, everything covered
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {STATS.map(stat => (
            <motion.div
              key={stat.id}
              variants={itemVariants}
              className="rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center p-6 lg:p-8 text-center">
                <div className="mb-4 flex items-center justify-center w-11 h-11 rounded-full bg-primary-container">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mb-1 text-3xl lg:text-4xl font-bold tracking-tight text-on-surface tabular-nums">
                  <CountingNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-medium text-on-surface-variant">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
