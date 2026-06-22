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
    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
      Live {lastUpdated && `· updated ${lastUpdated}`}
    </div>
  )
}
