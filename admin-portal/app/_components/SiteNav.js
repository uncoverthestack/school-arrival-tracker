'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '../LogoutButton'

// The auth pages (login/signup) have their own branded layout, the
// dashboard and students pages now use the sidebar nav, and the gate
// scanner is a full-screen kiosk with no nav at all — the global top nav
// would just duplicate or clutter all of these.
const HIDDEN_ON = ['/login', '/signup', '/', '/students', '/gate']

export function SiteNav({ schoolId, schoolName }) {
  const pathname = usePathname()
  if (HIDDEN_ON.includes(pathname)) return null

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
      <span className="text-white font-bold text-sm tracking-wide">Childmap</span>
      {schoolId ? (
        <>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/gate" className="text-sm text-gray-400 hover:text-white transition-colors">
            Gate Scanner
          </Link>
          <Link href="/students" className="text-sm text-gray-400 hover:text-white transition-colors">
            Students
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-500">{schoolName}</span>
            <LogoutButton />
          </div>
        </>
      ) : (
        <Link href="/login" className="ml-auto text-sm text-gray-400 hover:text-white transition-colors">
          Sign In
        </Link>
      )}
    </nav>
  )
}
