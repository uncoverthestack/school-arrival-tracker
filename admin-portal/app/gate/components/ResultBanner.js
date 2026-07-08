const STYLES = {
  success: 'bg-success-container text-on-success-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container'
}

function BannerIcon({ state }) {
  if (state === 'success') {
    return <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  }
  if (state === 'warning') {
    return (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    )
  }
  return (
    <path
      d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
  )
}

export function ResultBanner({ state, message }) {
  return (
    <div className={`flex items-center justify-center gap-2 w-[440px] max-w-full px-4 py-3 rounded-md ${STYLES[state]}`}>
      <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <BannerIcon state={state} />
      </svg>
      <p className="text-title-medium font-medium tracking-[0.15px]">{message}</p>
    </div>
  )
}
