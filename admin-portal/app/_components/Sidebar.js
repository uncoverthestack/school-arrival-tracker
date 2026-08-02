'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const itemClass = 'flex items-center gap-3 p-3 rounded-md w-full text-label-large text-on-surface-variant'
const activeItemClass = 'flex items-center gap-3 p-3 rounded-md w-full text-label-large bg-primary-container text-on-primary-container'

function TodayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function GateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 5V3a1 1 0 0 1 1-1h3M18 5V3a1 1 0 0 0-1-1h-3M2 15v2a1 1 0 0 0 1 1h3M18 15v2a1 1 0 0 1-1 1h-3M2 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function WatchlistIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StudentsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 12.2c1.8.2 3 1.4 3 3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2.5 4.5A1.5 1.5 0 0 1 4 3h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 16 14H8l-4 3v-3H4a1.5 1.5 0 0 1-1.5-1.5v-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 17.5H4.5A1.5 1.5 0 0 1 3 16V4a1.5 1.5 0 0 1 1.5-1.5H8M13.5 14l4-4-4-4M17 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Sidebar({ watchlistCount = 0, messagesCount = 0, onNavigate }) {
  const pathname = usePathname()
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="bg-surface-container-lowest border-r border-outline-variant flex flex-col h-full p-4 py-8 shrink-0 w-63 overflow-y-auto">
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2.5 pb-6 pt-1 px-1">
          <img src="/brand/childmap-icon-256.png" alt="" width={32} height={32} className="size-8 shrink-0" />
          <p className="text-title-medium tracking-[0.15px] text-on-surface">Childmap</p>
        </div>

        <Link href="/" onClick={onNavigate} className={pathname === '/' ? activeItemClass : itemClass}>
          <TodayIcon />
          <span className="flex-1">Today</span>
        </Link>

        <Link href="/gate" onClick={onNavigate} className={itemClass}>
          <GateIcon />
          <span className="flex-1">Gate scanner</span>
        </Link>

        {/* Not built yet — visual only, matching the Figma sidebar. */}
        <div className={itemClass}>
          <WatchlistIcon />
          <span className="flex-1">Watchlist</span>
          {watchlistCount > 0 && (
            <span className="bg-warning-container text-on-warning-container text-label-small tracking-[0.5px] rounded-full px-2 py-1">
              {watchlistCount}
            </span>
          )}
        </div>

        <Link href="/students" onClick={onNavigate} className={pathname === '/students' ? activeItemClass : itemClass}>
          <StudentsIcon />
          <span className="flex-1">Students</span>
        </Link>

        <Link href="/messages" onClick={onNavigate} className={pathname === '/messages' ? activeItemClass : itemClass}>
          <MessagesIcon />
          <span className="flex-1">Messages</span>
          <AnimatePresence>
            {messagesCount > 0 && (
              <motion.span
                key={messagesCount}
                initial={reduceMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 500, damping: 15 }}
                className="bg-warning-container text-on-warning-container text-label-small tracking-[0.5px] rounded-full px-2 py-1"
              >
                {messagesCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <div className="flex flex-col gap-1 w-full mt-auto pt-4">
        <Link href="/settings" onClick={onNavigate} className={pathname === '/settings' ? activeItemClass : itemClass}>
          <SettingsIcon />
          <span className="flex-1">Settings</span>
        </Link>

        <button onClick={handleLogout} className={`${itemClass} cursor-pointer`}>
          <LogoutIcon />
          <span className="flex-1 text-left">Sign out</span>
        </button>
      </div>
    </div>
  )
}
