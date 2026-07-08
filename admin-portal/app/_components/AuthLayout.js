const FEATURES = [
  'Instant SMS to parents on any phone',
  "Alerts the moment a child doesn't arrive",
  'Flags dead parent numbers before they matter'
]

// Shared split-screen shell for the sign-up / sign-in pages: a fixed brand
// panel (photo + gradient, always white text — it's a static brand asset,
// not themed) and a form panel on the right that follows light/dark via
// .theme-auto like the rest of the app.
export function AuthLayout({ children }) {
  return (
    <div className="theme-auto font-kiosk flex min-h-screen bg-surface">
      <div className="relative hidden lg:flex flex-col justify-between w-[600px] shrink-0 p-16 overflow-hidden">
        <img src="/auth-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(18,79,143,0.55)] via-[55%] via-[rgba(15,69,125,0.8)] to-[rgba(10,51,102,0.97)]" />

        <div className="relative flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3Z" fill="white"/>
            <path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="#124f8f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-title-large text-white">Attendance Tracker</p>
        </div>

        <div className="relative flex flex-col gap-5 max-w-[472px]">
          <p className="text-headline-large font-bold text-white">
            Every child accounted for, the moment they arrive.
          </p>
          <p className="text-body-large tracking-[0.5px] text-white/90">
            Attendance Guard checks students in at the gate and texts parents instantly — even on a basic phone.
          </p>
          <div className="flex flex-col gap-3">
            {FEATURES.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                  <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.15"/>
                  <path d="M8 12.5l2.5 2.5 5.5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-body-large tracking-[0.5px] text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-16">
        <div className="w-full max-w-[400px] flex flex-col gap-5">
          {children}
        </div>
      </div>
    </div>
  )
}
