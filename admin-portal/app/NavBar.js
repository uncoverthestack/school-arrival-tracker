'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NavBar({ schoolId, schoolName }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
        {/* Logo + brand name */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="text-white font-bold text-sm tracking-wide">SchoolPass</span>
        </Link>

        {schoolId ? (
          <>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-5 ml-2">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/gate" className="text-sm text-gray-400 hover:text-white transition-colors">
                Gate Scanner
              </Link>
              <Link href="/students" className="text-sm text-gray-400 hover:text-white transition-colors">
                Students
              </Link>
            </div>

            {/* Right side — school name + logout (desktop) */}
            <div className="hidden md:flex ml-auto items-center gap-4">
              <span className="text-sm text-gray-500 truncate max-w-45">{schoolName}</span>
              <LogoutLink />
            </div>

            {/* Mobile: school name + hamburger */}
            <div className="ml-auto flex md:hidden items-center gap-3">
              <span className="text-xs text-gray-500 truncate max-w-25">{schoolName}</span>
              <button
                onClick={() => setOpen(o => !o)}
                aria-label="Toggle menu"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {open ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          <Link href="/login" className="ml-auto text-sm text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {open && schoolId && (
        <div className="md:hidden border-t border-gray-800 px-4 py-3 flex flex-col gap-1">
          <MobileNavLink href="/" onClick={() => setOpen(false)}>Dashboard</MobileNavLink>
          <MobileNavLink href="/gate" onClick={() => setOpen(false)}>Gate Scanner</MobileNavLink>
          <MobileNavLink href="/students" onClick={() => setOpen(false)}>Students</MobileNavLink>
          <div className="mt-2 pt-2 border-t border-gray-800">
            <LogoutLink mobile />
          </div>
        </div>
      )}
    </nav>
  )
}

function MobileNavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
    >
      {children}
    </Link>
  )
}

function LogoutLink({ mobile = false }) {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className={
        mobile
          ? 'w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors'
          : 'text-sm text-gray-400 hover:text-white transition-colors'
      }
    >
      Sign Out
    </button>
  )
}
