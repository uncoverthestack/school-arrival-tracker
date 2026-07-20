'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#why-us', label: 'Why Childmap' },
  { href: '#pricing', label: 'Pricing' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <div className="sm:hidden">
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        whileTap={{ scale: 0.9 }}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-on-surface focus-visible:ring-2 focus-visible:ring-primary"
      >
        <motion.svg
          width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full bg-surface-container-lowest border-b border-outline-variant shadow-lg px-4 py-3 flex flex-col gap-1"
          >
            {LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-label-large tracking-[0.1px] font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2.5 rounded-lg text-label-large tracking-[0.1px] font-bold bg-primary text-on-primary text-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
