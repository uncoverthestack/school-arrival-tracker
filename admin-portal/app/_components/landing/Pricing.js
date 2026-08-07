'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { RequestDemoButton } from '../RequestDemoButton'
import { RollingText } from '../RollingText'

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

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0, 0, 1] } } }

export function Pricing() {
  return (
    <section id="pricing" data-theme="light" className="scroll-mt-20 relative overflow-hidden bg-surface py-20 md:py-28">
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
        <motion.div
          className="mb-14 flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface text-balance">
            Simple, fair pricing
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 max-w-lg text-base text-on-surface-variant">
            Choose the plan that fits your school&apos;s size. Start small, grow big.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {PRICING.map(plan => (
            <motion.div key={plan.name} variants={itemVariants} className="h-full">
              <div
                className={`relative h-full flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest px-8 py-10 shadow-sm transition-shadow duration-300 hover:shadow-md ${
                  plan.highlighted ? 'border-2 border-primary' : 'border border-outline-variant'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute top-0 right-0 rounded-bl-xl bg-primary text-on-primary text-xs uppercase font-bold px-4 py-2">
                    Best Value
                  </span>
                )}

                <p className="text-center text-lg font-bold text-on-surface">{plan.name}</p>
                <p className="mt-4 text-center">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>{' '}
                  <span className="text-sm text-on-surface-variant">{plan.per}</span>
                </p>
                <p className="mt-4 text-sm text-center text-on-surface-variant bg-surface-container rounded-lg px-4 py-2.5">
                  {plan.note}
                </p>

                <ul className="mt-8 flex flex-col gap-3.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-on-surface">
                      <Check className="h-4 w-4 shrink-0 mt-0.5 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.highlighted ? (
                  <RequestDemoButton className="group/btn mt-8 w-full py-3 rounded-lg text-sm font-bold bg-primary text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-[0.98]">
                    <RollingText>Get Started</RollingText>
                  </RequestDemoButton>
                ) : (
                  <button
                    type="button"
                    className="group/btn mt-8 w-full py-3 rounded-lg text-sm font-bold border border-outline text-on-surface transition-all hover:bg-surface-container active:scale-[0.98]"
                  >
                    <RollingText>Get Started</RollingText>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
