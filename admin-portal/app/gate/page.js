'use client'

import { useState, useEffect } from 'react'
import { GateScanner } from './GateScanner'

export default function GatePage() {
  const [schoolKey, setSchoolKey] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const keyFromUrl = params.get('key') ?? ''

    const cookieKey = document.cookie
      .split('; ')
      .find(row => row.startsWith('school-key='))
      ?.split('=')[1] ?? ''

    setSchoolKey(decodeURIComponent(keyFromUrl || cookieKey))
  }, [])

  return <GateScanner schoolKey={schoolKey} />
}
