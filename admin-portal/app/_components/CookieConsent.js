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
    // Fixed dark glass style regardless of page theme (M3 light/dark tokens
    // would mismatch here — e.g. a white card over the black landing-page
    // hero) since this is a system-level overlay, not page content, the same
    // way the marketing pages' other floating CTAs are always-dark. Mobile
    // gets extra bottom clearance everywhere, not just on "/" — the
    // landing page's own sticky mobile CTA bar sits in this same spot, and
    // this can't tell which page it's on without adding that coupling.
    <div className="fixed inset-x-0 bottom-20 md:bottom-4 z-50 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-[#101010]/95 backdrop-blur-md border border-white/10 shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-white/70 leading-relaxed">
          We use cookies and similar technologies to improve your experience on our site. To learn more, view our{' '}
          <Link href="/privacy" className="text-white font-medium underline hover:text-[#5b9fe3] transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-[#1d6fc4] text-white text-sm font-semibold px-5 py-2.5 shadow-sm transition-all hover:bg-[#1d6fc4]/90 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010]"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
