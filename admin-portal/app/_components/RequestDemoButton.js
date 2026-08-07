'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { RollingText } from './RollingText'

const inputClass =
  'w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-3 text-body-large tracking-[0.2px] outline-none ' +
  'focus:border-primary focus-visible:ring-2 focus-visible:ring-primary'
const labelClass = 'block text-body-medium tracking-[0.1px] text-on-surface-variant mb-1'
const focusRing = 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

function RequestDemoModal({ onClose, triggerRef }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [schoolEmail, setSchoolEmail] = useState('')
  const [schoolAddress, setSchoolAddress] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const reduceMotion = useReducedMotion()
  const dialogRef = useRef(null)
  const firstFieldRef = useRef(null)
  const headingId = useId()

  // Move focus into the dialog on open, and back to the trigger button on close —
  // otherwise keyboard/screen-reader users lose their place in the page.
  useEffect(() => {
    firstFieldRef.current?.focus()
    const trigger = triggerRef.current
    return () => trigger?.focus()
  }, [triggerRef])

  // Escape closes the modal; Tab is trapped so focus can't leak into the page behind it.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll(
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

    const res = await fetch('/api/demo-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, phone, schoolName, schoolEmail, schoolAddress })
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
    setDone(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        className="bg-surface-container-lowest rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-success-container flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12l5 5L20 6" stroke="var(--color-on-success-container)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p id={headingId} className="text-title-medium font-bold text-on-surface mb-1">Request received</p>
            <p className="text-body-medium tracking-[0.1px] text-on-surface-variant mb-6">
              We will contact you as soon as possible.
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`group w-full py-3 rounded-lg text-label-large bg-primary text-on-primary font-bold shadow-sm transition-all hover:opacity-90 hover:shadow-md ${focusRing}`}
            >
              <RollingText>Close</RollingText>
            </button>
          </div>
        ) : (
          <>
            <h2 id={headingId} className="text-title-medium font-bold text-on-surface mb-1">Request a demo</h2>
            <p className="text-body-medium tracking-[0.1px] text-on-surface-variant mb-5">
              Tell us about your school and we&apos;ll reach out to set up a walkthrough.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="demo-first-name" className={labelClass}>First name</label>
                  <input
                    id="demo-first-name" ref={firstFieldRef}
                    value={firstName} onChange={e => setFirstName(e.target.value)}
                    required className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="demo-last-name" className={labelClass}>Surname</label>
                  <input
                    id="demo-last-name"
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    required className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="demo-phone" className={labelClass}>Phone number</label>
                <input
                  id="demo-phone" type="tel"
                  value={phone} onChange={e => setPhone(e.target.value)}
                  required className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="demo-school-name" className={labelClass}>School name</label>
                <input
                  id="demo-school-name"
                  value={schoolName} onChange={e => setSchoolName(e.target.value)}
                  required className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="demo-school-email" className={labelClass}>School email address</label>
                <input
                  id="demo-school-email" type="email"
                  value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)}
                  required className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="demo-school-address" className={labelClass}>School address</label>
                <input
                  id="demo-school-address"
                  value={schoolAddress} onChange={e => setSchoolAddress(e.target.value)}
                  required className={inputClass}
                />
              </div>

              {error && <p role="alert" className="text-error text-body-medium tracking-[0.1px]">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`group flex-1 py-3 rounded-lg text-label-large bg-primary text-on-primary disabled:opacity-50 font-bold shadow-sm transition-all hover:opacity-90 hover:shadow-md ${focusRing}`}
                >
                  <RollingText>{submitting ? 'Sending…' : 'Send request'}</RollingText>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`group flex-1 py-3 rounded-lg text-label-large bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold shadow-sm hover:shadow-md transition-all ${focusRing}`}
                >
                  <RollingText>Cancel</RollingText>
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export function RequestDemoButton({ className, children }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`${className} ${focusRing}`}
      >
        {children}
      </motion.button>
      {/* Portaled straight to <body> — otherwise a transformed ancestor elsewhere on the
          page (e.g. the hero mockup's TiltCard, which sets a live CSS transform) can pull
          this fixed-position modal into its own stacking context and bury it under other
          content, even with z-50. */}
      {open && createPortal(
        <RequestDemoModal onClose={() => setOpen(false)} triggerRef={triggerRef} />,
        document.body
      )}
    </>
  )
}
