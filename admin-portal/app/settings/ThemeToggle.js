'use client'

import { useEffect, useState } from 'react'
import { setTheme, getStoredTheme } from '@/lib/theme'

const OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function ThemeToggle() {
  const [theme, setThemeState] = useState('system')

  useEffect(() => {
    setThemeState(getStoredTheme())
  }, [])

  function handleSelect(value) {
    setTheme(value)
    setThemeState(value)
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => handleSelect(o.value)}
          className={`px-4 py-2 rounded-md text-label-large border transition-colors ${
            theme === o.value
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-outline'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
