'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function DashboardShell({ watchlistCount, messagesCount, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="theme-auto font-kiosk flex min-h-screen bg-surface text-on-surface">
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-b border-outline-variant">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-1 -ml-1 text-on-surface">
          <MenuIcon />
        </button>
        <img src="/brand/childmap-icon-256.png" alt="" width={26} height={26} className="size-6.5 shrink-0" />
        <p className="text-title-medium tracking-[0.15px] text-on-surface">Childmap</p>
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out
          lg:static lg:z-auto lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar watchlistCount={watchlistCount} messagesCount={messagesCount} onNavigate={() => setOpen(false)} />
      </div>

      <main className="relative flex-1 flex flex-col gap-8 px-4 pt-20 pb-8 lg:px-10 lg:py-8 min-w-0 overflow-hidden">
        <img
          src="/images/mascot.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute -bottom-16 -right-16 w-80 lg:w-[28rem] opacity-10"
        />
        {children}
      </main>
    </div>
  )
}
