'use client'

import { useState, useEffect } from 'react'
import { GateScanner } from './GateScanner'

export default function GatePage() {
  const [schoolKey, setSchoolKey] = useState('')

  // window/document only exist client-side, so the school key can't be part
  // of the initial state — it has to be read after mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const keyFromUrl = params.get('key') ?? ''

    const cookieKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('school-key='))
      ?.split('=')[1] ?? ''

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSchoolKey(decodeURIComponent(keyFromUrl || cookieKey))
  }, [])

  return <GateScanner schoolKey={schoolKey} />
}
