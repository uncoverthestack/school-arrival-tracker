'use client'

import { useState } from 'react'
import Link from 'next/link'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#why-us', label: 'Why SchoolPass' },
  { href: '#pricing', label: 'Pricing' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-on-surface"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-surface-container-lowest border-b border-outline-variant shadow-lg px-4 py-3 flex flex-col gap-1">
          {LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-1 px-3 py-2.5 rounded-lg text-sm font-bold bg-primary text-on-primary text-center"
          >
            Login
          </Link>
        </div>
      )}
    </div>
  )
}
