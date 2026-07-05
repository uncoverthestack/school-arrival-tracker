const RETICLE_PATHS = [
  'M4 20V8a4 4 0 0 1 4-4h12',
  'M56 4h12a4 4 0 0 1 4 4v12',
  'M72 56v12a4 4 0 0 1-4 4H56',
  'M20 72H8a4 4 0 0 1-4-4V56'
]

const PHOTO_BG = {
  scanning: 'bg-primary-container',
  photo: 'bg-surface-container',
  error: 'bg-error-container',
  offline: 'bg-surface-variant'
}

// One ID-card shell reused across every kiosk state — only the inner
// "photo" area content changes: a live camera feed + reticle, a resolved
// student photo, an alert triangle, or a wifi-off icon.
export function IdCard({ variant = 'scanning', photoUrl, studentName, elevated = false }) {
  return (
    <div
      className={`relative w-[300px] h-[360px] bg-surface-container-lowest border border-outline-variant rounded-lg ${
        elevated
          ? 'shadow-[0_4px_8px_3px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.3)]'
          : 'shadow-[0_1px_2px_rgba(0,0,0,0.15),0_1px_6px_1px_rgba(0,0,0,0.07)]'
      }`}
    >
      <p className="absolute left-[18px] top-[22px] text-label-small font-medium tracking-[0.5px] text-on-surface-variant">
        STUDENT
      </p>
      <span className="absolute left-[142px] top-[18px] w-4 h-4 rounded-full bg-surface-dim" />

      <div className={`absolute left-[14px] top-[46px] w-[272px] h-[300px] rounded-md overflow-hidden ${PHOTO_BG[variant]}`}>
        {variant === 'photo' && (
          photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl font-bold text-on-primary-container/40">
              {studentName?.[0] ?? '?'}
            </div>
          )
        )}

        {variant === 'scanning' && (
          <>
            <div id="qr-reader" className="w-full h-full [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover" />
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] text-on-primary-container opacity-50 pointer-events-none"
              viewBox="0 0 76 76" fill="none" aria-hidden="true"
            >
              {RETICLE_PATHS.map((d) => (
                <path key={d} d={d} stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              ))}
            </svg>
          </>
        )}

        {variant === 'error' && (
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88px] h-[88px] text-error"
            viewBox="0 0 24 24" fill="none" aria-hidden="true"
          >
            <path d="M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" fill="currentColor" />
            <path d="M12 9.5v3.25M12 15.75h.01" stroke="var(--color-on-error)" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}

        {variant === 'offline' && (
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92px] h-[92px] text-on-surface-variant"
            viewBox="0 0 24 24" fill="none" aria-hidden="true"
          >
            <path
              d="M2 8.82a15.9 15.9 0 0 1 4.17-2.65M12 20h.01M8.5 16.43a6.5 6.5 0 0 1 7 0M5.3 12.9a11 11 0 0 1 3.7-2.16M15 10.74a11 11 0 0 1 3.7 2.16M9.9 6.34A15.9 15.9 0 0 1 12 6.16c2.45 0 4.78.55 6.87 1.53"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
            <path d="M2 2l20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  )
}
