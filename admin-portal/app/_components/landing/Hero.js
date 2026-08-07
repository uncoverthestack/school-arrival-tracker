'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { RequestDemoButton } from '../RequestDemoButton'
import { RollingText } from '../RollingText'
import { TiltCard } from '../TiltCard'
import { DashboardMockup } from './DashboardMockup'

const ROTATING_WORDS = ['schools', 'parents', 'gate staff', 'Nigeria', 'guardians']

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % ROTATING_WORDS.length), 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative flex min-h-screen w-full flex-col justify-center overflow-x-hidden pt-40 pb-24">
      {/* Background dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Ambient glow behind heading */}
      <motion.div
        className="pointer-events-none absolute top-[38%] left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(ellipse at center, rgba(29,111,196,0.14) 0%, rgba(29,111,196,0.04) 40%, transparent 70%)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />

      {/* Decorative technical borders */}
      <div className="absolute top-28 inset-x-0 hidden h-px bg-white/5 lg:block" />
      <div className="absolute top-0 bottom-0 left-8 hidden w-px bg-white/5 md:left-16 lg:block" />
      <div className="absolute top-0 bottom-0 right-8 hidden w-px bg-white/5 md:right-16 lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 flex flex-1 flex-col justify-center">
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="font-sans text-4xl md:text-6xl lg:text-[64px] tracking-tighter leading-[0.95] text-white mb-2">
              Every child accounted for,
            </h1>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h1 className="font-sans text-4xl md:text-6xl lg:text-[64px] tracking-tighter leading-[0.95] mb-8">
              <span className="text-white">built for </span>
              <span className="relative inline-block min-w-[7ch] text-left">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROTATING_WORDS[wordIndex]}
                    className="inline-block text-[#5b9fe3]"
                    initial={reduceMotion ? { opacity: 0 } : { y: 12, opacity: 0, filter: 'blur(4px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={reduceMotion ? { opacity: 0 } : { y: -12, opacity: 0, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeIn' } }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {ROTATING_WORDS[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className="mb-12 max-w-xl text-sm md:text-base text-white/50 text-pretty">
            Replace the paper logbook with instant gate check-ins, live dashboards, and SMS alerts parents actually see.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
            <RequestDemoButton className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#1d6fc4] text-white px-8 py-3 text-sm font-semibold shadow-sm transition-all hover:bg-[#1d6fc4]/90 active:scale-[0.97]">
              <RollingText>Request Demo</RollingText>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </RequestDemoButton>
            <a
              href="#features"
              className="group inline-flex items-center justify-center rounded-full border border-white/15 text-white px-8 py-3 text-sm font-semibold transition-all hover:bg-white/5 active:scale-[0.97]"
            >
              <RollingText>Learn More ↓</RollingText>
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <span className="h-px w-8 bg-white/10" />
              What schools get on day one
              <span className="h-px w-8 bg-white/10" />
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              {['3 check-in modes', 'SMS + WhatsApp alerts', 'Live dashboard'].map(stat => (
                <div
                  key={stat}
                  className="rounded-full border border-white/10 bg-white/2 px-4 py-2 text-sm font-medium text-white/60"
                >
                  {stat}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Product preview */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-20 w-full max-w-4xl"
        >
          <div className="pointer-events-none absolute -inset-10 rounded-[28px] bg-gradient-to-br from-[#1d6fc4]/25 via-[#14b8a6]/15 to-transparent blur-2xl" />
          <div data-theme="dark" className="relative">
            <TiltCard tiltStrength={5} className="rounded-lg shadow-2xl">
              <DashboardMockup />
            </TiltCard>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
