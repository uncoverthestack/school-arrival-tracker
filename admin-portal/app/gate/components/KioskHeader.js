import Link from 'next/link'

export function KioskHeader({ title, scanType, online, time }) {
  return (
    <header className="flex items-center justify-between px-10 py-6 border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-title-medium text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>
        <span className="text-outline-variant">|</span>
        <p className="text-title-large text-on-surface">{title}</p>
      </div>
      <div className="flex items-center gap-4">
        <div
          className={`inline-flex items-center gap-2 h-7 px-3 rounded-full ${
            scanType === 'arrival'
              ? 'bg-success-container text-on-success-container'
              : 'bg-tertiary-container text-on-tertiary-container'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          <span className="text-label-large font-medium tracking-[0.1px]">
            {scanType === 'arrival' ? 'Arrival' : 'Departure'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-success' : 'bg-error'}`} />
          <span className="text-title-medium font-medium tracking-[0.15px]">{online ? 'online' : 'offline'}</span>
          <span className="text-body-large tracking-[0.5px] text-outline">·</span>
          <span className="text-title-medium font-medium tracking-[0.15px]">{time}</span>
        </div>
      </div>
    </header>
  )
}
