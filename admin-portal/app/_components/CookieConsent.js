'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'childmap-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-body-medium tracking-[0.1px] text-on-surface-variant">
          We use cookies and similar technologies to improve your experience on our site. To learn more about this,
          view our{' '}
          <Link href="/privacy" className="text-primary font-medium hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-primary text-on-primary text-label-large font-bold px-4 py-2 shadow-sm transition-all hover:opacity-90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
