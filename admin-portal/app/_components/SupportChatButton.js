'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { RollingText } from './RollingText'

const inputClass =
  'w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-body-medium tracking-[0.2px] outline-none ' +
  'focus:border-primary focus-visible:ring-2 focus-visible:ring-primary'
const labelClass = 'block text-body-small tracking-[0.1px] text-on-surface-variant mb-1'
const focusRing = 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

function SupportChatPanel({ onClose, triggerRef, schoolName }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const reduceMotion = useReducedMotion()
  const panelRef = useRef(null)
  const firstFieldRef = useRef(null)
  const headingId = useId()

  useEffect(() => {
    firstFieldRef.current?.focus()
    const trigger = triggerRef.current
    return () => trigger?.focus()
  }, [triggerRef])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/support-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, schoolName, message })
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
    setDone(true)
  }

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
      transition={{ duration: reduceMotion ? 0 : 0.15, ease: 'easeOut' }}
      className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl p-5 max-h-[75vh] overflow-y-auto"
    >
      {done ? (
        <div className="text-center py-4">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-success-container flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12l5 5L20 6" stroke="var(--color-on-success-container)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p id={headingId} className="text-title-medium font-bold text-on-surface mb-1">Message sent</p>
          <p className="text-body-medium tracking-[0.1px] text-on-surface-variant mb-6">
            Our support team will get back to you shortly.
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`group w-full py-2.5 rounded-lg text-label-large bg-primary text-on-primary font-bold shadow-sm transition-all hover:opacity-90 hover:shadow-md ${focusRing}`}
          >
            <RollingText>Close</RollingText>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-1">
            <h2 id={headingId} className="text-title-medium font-bold text-on-surface">Contact support</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`text-on-surface-variant hover:text-on-surface rounded-full p-1 -mr-1 -mt-1 ${focusRing}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="text-body-small tracking-[0.1px] text-on-surface-variant mb-4">
            Questions or an issue? Send us a message and we&apos;ll reply by email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="support-name" className={labelClass}>Your name</label>
              <input
                id="support-name" ref={firstFieldRef}
                value={name} onChange={e => setName(e.target.value)}
                required className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="support-email" className={labelClass}>Email address</label>
              <input
                id="support-email" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                required className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="support-message" className={labelClass}>Message</label>
              <textarea
                id="support-message" rows={4}
                value={message} onChange={e => setMessage(e.target.value)}
                required className={`${inputClass} resize-none`}
              />
            </div>

            {error && <p role="alert" className="text-error text-body-small tracking-[0.1px]">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className={`group w-full py-2.5 rounded-lg text-label-large bg-primary text-on-primary disabled:opacity-50 font-bold shadow-sm transition-all hover:opacity-90 hover:shadow-md ${focusRing}`}
            >
              <RollingText>{submitting ? 'Sending…' : 'Send message'}</RollingText>
            </button>
          </form>
        </>
      )}
    </motion.div>
  )
}

export function SupportChatButton({ schoolName }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef(null)
  const reduceMotion = useReducedMotion()

  // createPortal needs `document`, which doesn't exist during SSR — and it's called
  // unconditionally here (not gated on `open`) so AnimatePresence can play the exit
  // animation after close. Deferring to a post-mount flag keeps the initial server
  // render safe.
  useEffect(() => setMounted(true), [])

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close support chat' : 'Contact support'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:opacity-90 hover:shadow-xl transition-shadow ${focusRing}`}
      >
        <motion.span
          initial={false}
          animate={{ rotate: open ? 90 : 0, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 4h16v12H8l-4 4V4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </motion.span>
      </motion.button>
      {/* Portaled straight to <body> — same reasoning as RequestDemoButton: a fixed-position
          panel can otherwise get buried under a transformed ancestor's stacking context. */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && <SupportChatPanel onClose={() => setOpen(false)} triggerRef={triggerRef} schoolName={schoolName} />}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
