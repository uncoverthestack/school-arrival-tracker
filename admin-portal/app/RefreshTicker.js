'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshTicker({ intervalMs = 10_000 }) {
  const router = useRouter()
  const [lastUpdated, setLastUpdated] = useState('')

  const refresh = useCallback(() => {
    router.refresh()
    setLastUpdated(new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Lagos'
    }))
  }, [router])

  useEffect(() => {
    // Intentional: fire once immediately, then on the interval — there's no
    // SSR-safe way to know "now" ahead of mount, so the first render is a
    // one-time exception before the polling loop takes over.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return (
    <div className="flex items-center gap-2 bg-success-container text-on-success-container text-label-large tracking-[0.1px] rounded-full px-3 py-2">
      <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
      Live {lastUpdated && `· updated ${lastUpdated}`}
    </div>
  )
}
