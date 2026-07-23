const FEATURES = [
  'Instant SMS to parents on any phone',
  "Alerts the moment a child doesn't arrive",
  'Flags dead parent numbers before they matter'
]

export function AuthLayout({ children }) {
  return (
    <div data-theme="light" className="font-kiosk flex flex-col lg:flex-row min-h-screen bg-white">

      {/* Brand panel — top on mobile, left on desktop */}
      <div className="relative flex flex-col justify-between h-[45vh] lg:h-auto w-full lg:w-150 lg:shrink-0 p-10 lg:p-16 overflow-hidden">
        <img src="/auth-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-[rgba(18,79,143,0.55)] via-55% via-[rgba(15,69,125,0.8)] to-[rgba(10,51,102,0.97)]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <img src="/brand/childmap-icon-256.png" alt="" width={40} height={40} className="size-10 shrink-0" />
          <p className="text-title-large text-white">Childmap</p>
        </div>

        {/* Tagline + features — always visible */}
        <div className="relative flex flex-col gap-4 lg:gap-5 max-w-118">
          <p className="text-2xl lg:text-headline-large font-bold text-white leading-snug">
            Every child accounted for, the moment they arrive.
          </p>
          <p className="hidden lg:block text-body-large tracking-[0.5px] text-white/90">
            Childmap checks students in at the gate and texts parents instantly — even on a basic phone.
          </p>
          <div className="flex flex-col gap-2 lg:gap-3">
            {FEATURES.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                  <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.15"/>
                  <path d="M8 12.5l2.5 2.5 5.5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm lg:text-body-large tracking-[0.5px] text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-100 flex flex-col gap-5">
          {children}
        </div>
      </div>

    </div>
  )
}
