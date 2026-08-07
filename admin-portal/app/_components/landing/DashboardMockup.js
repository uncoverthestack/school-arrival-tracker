function MockMetric({ label, value, bg, text }) {
  return (
    <div className={`${bg} ${text} rounded-lg px-2.5 py-2`}>
      <p className="text-label-small tracking-[0.2px] font-medium opacity-80 truncate">{label}</p>
      <p className="text-title-large font-bold leading-tight">{value}</p>
    </div>
  )
}

export function DashboardMockup() {
  return (
    <div className="rounded-lg bg-surface-container-lowest border border-outline-variant overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-outline-variant bg-surface-container">
        <span className="w-2.5 h-2.5 rounded-full bg-error" />
        <span className="w-2.5 h-2.5 rounded-full bg-warning" />
        <span className="w-2.5 h-2.5 rounded-full bg-success" />
        <span className="ml-3 text-label-medium tracking-[0.15px] text-on-surface-variant font-mono truncate">app.childmap.ng</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ml-auto text-on-surface-variant md:hidden shrink-0">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex">
        <div className="hidden md:flex flex-col gap-1 w-40 shrink-0 border-r border-outline-variant p-3">
          <p className="text-label-medium tracking-[0.15px] font-bold text-on-surface px-2 pb-2">Childmap</p>
          <span className="text-label-medium tracking-[0.15px] font-medium rounded-md px-2 py-1.5 bg-primary-container text-on-primary-container">Today</span>
          <span className="text-label-medium tracking-[0.15px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Gate scanner</span>
          <span className="text-label-medium tracking-[0.15px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Watchlist</span>
          <span className="text-label-medium tracking-[0.15px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Students</span>
          <span className="text-label-medium tracking-[0.15px] font-medium rounded-md px-2 py-1.5 text-on-surface-variant">Messages</span>
        </div>
        <div className="p-4 sm:p-5 flex-1 min-w-0">
          <p className="text-title-small font-bold text-on-surface mb-3">Welcome, Admin</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
            <MockMetric label="Checked in" value="128" bg="bg-success-container" text="text-on-success-container" />
            <MockMetric label="Checked out" value="94" bg="bg-secondary-container" text="text-on-secondary-container" />
            <MockMetric label="Expected" value="150" bg="bg-primary-container" text="text-on-primary-container" />
            <MockMetric label="Unaccounted" value="22" bg="bg-warning-container" text="text-on-warning-container" />
            <MockMetric label="Alerts sent" value="340" bg="bg-tertiary-container" text="text-on-tertiary-container" />
            <MockMetric label="Classes" value="18" bg="bg-surface-container" text="text-on-surface" />
          </div>
          <div className="rounded-xl bg-surface-container p-3">
            <p className="text-label-medium tracking-[0.15px] text-on-surface-variant mb-2">Arrival flow</p>
            <svg viewBox="0 0 200 50" className="w-full h-10 text-primary" preserveAspectRatio="none">
              <polyline
                points="0,45 20,40 40,30 60,15 80,10 100,8 120,12 140,20 160,28 180,35 200,42"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
